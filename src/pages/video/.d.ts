interface VideoInfo {
    id: number,
    title: string,
    actor?: string,
    alias?: string,
    area?: string,
    class?: string,
    description?: string,
    director?: string,
    image?: string,
    otitle?: string,
    release_date?: string,
    episodes?: Episode[],
    expand?: VideoPlayConfig,
    score?: string,
    bg?: string,
}

interface VideoPlayConfig {
    auto_skip: boolean,//是否跳过片头片尾
    start_duration: number,//片头时长
    end_duration: number,//片尾时长
}


interface Episode {
    index: number,
    title: string,
    url: string,
    file_path: string,
}