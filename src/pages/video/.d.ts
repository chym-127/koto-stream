interface VideoInfo {
    id: number,
    title: string,
    full_name?: string,
    poster_url?: string,
    fanart_url?: string,
    type?: number,
    area?: string,
    description?: string,
    release_date?: string,
    episodes?: Episode[],
    expand?: string,
    play_config?: VideoPlayConfig,
    score?: number,
}

interface VideoPlayConfig {
    auto_skip: boolean,//是否跳过片头片尾
    start_duration: number,//片头时长
    end_duration: number,//片尾时长
}


interface Episode {
    index: number,
    title: string,
    description?: string,
    release_date?: string,
    url: string,
    local_path: string,
    season: number,
}


interface SeasonItem {
    name: string,
    num: number;
    episodes: Episode[];
}