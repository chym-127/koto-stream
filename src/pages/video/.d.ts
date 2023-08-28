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
    score?: string,
    bg?: string,
}

interface Episode {
    title: string,
    url: string,
    file_path: string,
}