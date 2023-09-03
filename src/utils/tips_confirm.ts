class TipsConfirm {
    _dom: HTMLDivElement;
    _scheduledId: any = null;
    _timerId: any = null;
    okCallback: () => void = () => { };
    cancelCallback: () => void = () => { };

    constructor(el: Element, options: any) {
        this._dom = this.createDom()
        el.appendChild(this._dom)
        this.okCallback = options.okCallback
        this.cancelCallback = options.cancelCallback
        this.initClickEvent()
    }


    createDom() {
        let dom = document.createElement("div")

        dom.setAttribute("class", 'tip-confirm')
        dom.innerHTML = ` <div class="content-box">
        <div class="left flex-row content"></div>
        <div class="right flex-row">
          <div class="action-btn ok">
            是(0s)
          </div>
          <div class="action-btn cancel">
            否
          </div>
        </div>
      </div>`
        return dom
    }


    initClickEvent() {
        let okEl: HTMLDivElement = this._dom.getElementsByClassName('ok')[0] as HTMLDivElement
        okEl.addEventListener('click', () => {
            console.log('ok');
            this.tipsEnd('ok')
        })


        let cancelEl: HTMLDivElement = this._dom.getElementsByClassName('cancel')[0] as HTMLDivElement
        cancelEl.addEventListener('click', () => {
            this.tipsEnd('cancel')
        })
    }


    newTipConfirm(content: string, leftTime: number) {
        let countDown = leftTime;
        let contentEl: any = this._dom.getElementsByClassName('content')[0]
        if (contentEl) {
            contentEl.innerText = content
        }
        let el: any = this._dom.getElementsByClassName('ok')[0]
        if (el) {
            if (countDown === -1) {
                el.innerText = `是`
            } else {
                el.innerText = `是(${countDown}s)`
            }
        }
        this.showDom()

        this.clearTimer()
        if (countDown !== -1) {
            this._scheduledId = setTimeout(() => {
                this.tipsEnd('ok')
            }, leftTime * 1000);

            this._timerId = setInterval(() => {
                countDown -= 1
                let el: any = this._dom.getElementsByClassName('ok')[0]
                if (el) {
                    el.innerText = `是(${countDown}s)`
                }
            }, 1000)
        }
    }


    tipsEnd(event: string) {
        if (event === 'ok') {
            this.okCallback()
        }
        if (event === 'cancel') {
            this.cancelCallback()
        }
        this.hideDom()
        this.clearTimer()
    }

    hideDom() {
        this._dom.style.display = 'none'
    }

    showDom() {
        this._dom.style.display = 'block'
    }

    clearTimer() {
        if (this._scheduledId) {
            clearTimeout(this._scheduledId)
            this._timerId && clearInterval(this._timerId)
        }
    }


    destroy() {
        this.clearTimer()
        this._dom.remove()
    }

}


export default TipsConfirm