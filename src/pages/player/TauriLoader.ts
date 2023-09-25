import {
  type HlsConfig,
  type Loader,
  type LoaderCallbacks,
  type LoaderConfiguration,
  type LoaderContext,
  type LoaderOnProgress,
  type LoaderResponse,
  type LoaderStats,
} from 'hls.js'

import {
  ResponseType,
  getClient,
  fetch,
  type FetchOptions,
  type HttpVerb,
  type Response,
} from '@tauri-apps/api/http'

const client = await getClient();
export function fetchSupported(): boolean {
  return !!__TAURI__
}

const BYTERANGE = /(\d+)-(\d+)\/(\d+)/

export class TauriLoader implements Loader<LoaderContext> {
  private fetchSetup: (context: LoaderContext, initParams: any) => Request
  private requestTimeout?: number
  private request!: Request
  private response!: Response<any>
  private controller: AbortController
  public context!: LoaderContext
  private config: LoaderConfiguration | null = null
  private callbacks: LoaderCallbacks<LoaderContext> | null = null
  public stats: LoaderStats
  private loader: Response<any> | null = null

  constructor(config: HlsConfig) {
    this.fetchSetup = config.fetchSetup || getRequest
    this.controller = new self.AbortController()

    // https://github.com/video-dev/hls.js/blob/master/src/loader/load-stats.ts
    this.stats = {
      aborted: false,
      loaded: 0,
      retry: 0,
      total: 0,
      chunkCount: 0,
      bwEstimate: 0,
      loading: { start: 0, first: 0, end: 0 },
      parsing: { start: 0, end: 0 },
      buffering: { start: 0, first: 0, end: 0 },
    }
  }

  destroy(): void {
    this.loader = this.callbacks = null
    this.abortInternal()
  }

  abortInternal(): void {
    const response = this.response
    if (!response?.ok) {
      this.stats.aborted = true
      this.controller.abort()
    }
  }

  abort(): void {
    this.abortInternal()
    if (this.callbacks?.onAbort) {
      this.callbacks.onAbort(this.stats, this.context, this.response)
    }
  }

  load(
    context: LoaderContext,
    config: LoaderConfiguration,
    callbacks: LoaderCallbacks<LoaderContext>
  ): void {
    const stats = this.stats
    if (stats.loading.start) {
      throw new Error('Loader can only be used once.')
    }
    stats.loading.start = self.performance.now()

    const initParams = getRequestParameters(context, this.controller.signal)
    const onProgress: LoaderOnProgress<LoaderContext> | undefined =
      callbacks.onProgress
    const isArrayBuffer = context.responseType === 'arraybuffer'

    this.context = context
    this.config = config
    this.callbacks = callbacks
    this.request = this.fetchSetup(context, initParams)
    self.clearTimeout(this.requestTimeout)
    config.timeout = 5000 // config.loadPolicy.maxTimeToFirstByteMs
    this.requestTimeout = self.setTimeout(() => {
      this.abortInternal()
      callbacks.onTimeout(stats, context, this.response)
    }, config.timeout)

    const options = getFetchOptions(this.request)
    if (isArrayBuffer) options.responseType = ResponseType.Binary
    else if (context.responseType === 'json')
      options.responseType = ResponseType.JSON
    else options.responseType = ResponseType.Text
    console.log(this.request);

    client.get<any>(this.request.url, options)
      .then((response): Promise<string | ArrayBuffer> => {
        this.response = this.loader = response
        console.log(response);
        
        const first = Math.max(self.performance.now(), stats.loading.start)

        self.clearTimeout(this.requestTimeout)
        config.timeout = 10000 // config.loadPolicy.maxLoadTimeMs
        this.requestTimeout = self.setTimeout(() => {
          this.abortInternal()
          callbacks.onTimeout(stats, context, this.response)
        }, 10000 /*config.loadPolicy.maxLoadTimeMs*/ - (first - stats.loading.start))

        if (!response.ok) {
          const { status } = response
          throw new FetchError('fetch, bad network response', status, response)
        }
        stats.loading.first = first

        stats.total = getContentLength(response.headers) || stats.total

        // if (onProgress && Number.isFinite(config.highWaterMark)) {
        //   return this.loadProgressively(
        //     response,
        //     stats,
        //     context,
        //     config.highWaterMark,
        //     onProgress
        //   )
        // }

        if (isArrayBuffer) {
          return response.data
        }
        if (context.responseType === 'json') {
          return response.data
        }

        return response.data
      })
      .then((responseData: string | ArrayBuffer) => {
        const { response } = this
        self.clearTimeout(this.requestTimeout)
        stats.loading.end = Math.max(
          self.performance.now(),
          stats.loading.first
        )
        const total =
          typeof responseData === 'string'
            ? responseData.length
            : responseData.byteLength
        if (total) {
          stats.loaded = stats.total = total
        }

        const loaderResponse: LoaderResponse = {
          url: response.url,
          data: responseData,
          // code: response.status,
        }

        if (onProgress && !Number.isFinite(config.highWaterMark)) {
          onProgress(stats, context, responseData, response)
        }

        callbacks.onSuccess(loaderResponse, stats, context, response)
      })
      .catch(error => {
        console.log("error:", error);

        self.clearTimeout(this.requestTimeout)
        if (stats.aborted) {
          return
        }
        // CORS errors result in an undefined code. Set it to 0 here to align with XHR's behavior
        // when destroying, 'error' itself can be undefined
        const code: number = !error ? 0 : error.code || 0
        const text: string = !error ? null : error.message
        callbacks.onError(
          { code, text },
          context,
          error ? error.details : null,
          stats
        )
      })
  }

  getCacheAge(): number | null {
    let result: number | null = null
    if (this.response) {
      const headers = new Headers(this.response.headers)
      const ageHeader = headers.get('age')
      result = ageHeader ? parseFloat(ageHeader) : null
    }
    return result
  }

  getResponseHeader(name: string): string | null {
    const headers = new Headers(this.response.headers)
    return this.response ? headers.get(name) : null
  }

  // private loadProgressively(
  //   response: Response<any>,
  //   stats: LoaderStats,
  //   context: LoaderContext,
  //   highWaterMark = 0,
  //   onProgress: LoaderOnProgress<LoaderContext>
  // ): Promise<ArrayBuffer> {
  //   const chunkCache = new ChunkCache()
  //   const reader = (response.body as ReadableStream).getReader()

  //   const pump = (): Promise<ArrayBuffer> => {
  //     return reader
  //       .read()
  //       .then(data => {
  //         if (data.done) {
  //           if (chunkCache.dataLength) {
  //             onProgress(stats, context, chunkCache.flush(), response)
  //           }

  //           return Promise.resolve(new ArrayBuffer(0))
  //         }
  //         const chunk: Uint8Array = data.value
  //         const len = chunk.length
  //         stats.loaded += len
  //         if (len < highWaterMark || chunkCache.dataLength) {
  //           // The current chunk is too small to to be emitted or the cache already has data
  //           // Push it to the cache
  //           chunkCache.push(chunk)
  //           if (chunkCache.dataLength >= highWaterMark) {
  //             // flush in order to join the typed arrays
  //             onProgress(stats, context, chunkCache.flush(), response)
  //           }
  //         } else {
  //           // If there's nothing cached already, and the chache is large enough
  //           // just emit the progress event
  //           onProgress(stats, context, chunk, response)
  //         }
  //         return pump()
  //       })
  //       .catch(() => {
  //         /* aborted */
  //         return Promise.reject()
  //       })
  //   }

  //   return pump()
  // }
}

function getByteRangeLength(byteRangeHeader: string): number | undefined {
  const result = BYTERANGE.exec(byteRangeHeader)
  if (result) {
    return parseInt(result[2]) - parseInt(result[1]) + 1
  }
}

function getContentLength(init: HeadersInit): number | undefined {
  const headers = new Headers(init)
  const contentRange = headers.get('Content-Range')
  if (contentRange) {
    const byteRangeLength = getByteRangeLength(contentRange)
    if (Number.isFinite(byteRangeLength)) {
      return byteRangeLength
    }
  }
  const contentLength = headers.get('Content-Length')
  if (contentLength) {
    return parseInt(contentLength)
  }
}

function getRequest(context: LoaderContext, initParams: any): Request {
  return new self.Request(context.url, initParams)
}

class FetchError extends Error {
  public code: number
  public details: any
  constructor(message: string, code: number, details: any) {
    super(message)
    this.code = code
    this.details = details
  }
}

function getRequestParameters(context: LoaderContext, signal: any): any {
  const initParams: any = {
    method: 'GET',
    mode: 'cors',
    credentials: 'same-origin',
    signal,
    headers: new self.Headers(Object.assign({}, context.headers)),
  }

  if (context.rangeEnd) {
    initParams.headers.set(
      'Range',
      'bytes=' + context.rangeStart + '-' + String(context.rangeEnd - 1)
    )
  }

  return initParams
}

/** Convert a browser `fetch` request to Tauri  */
function getFetchOptions(request: Request): FetchOptions {
  return {
    method: request.method as HttpVerb,
    headers: {
      ...request.headers, "User-Agent": "PostmanRuntime/7.29.2",
      "Accept-Encoding": "gzip, deflate, br",
      "Host": "google.com",
      "Accept": "*/*"
    },
  }
}
