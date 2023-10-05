import type {Track} from "$lib/data";

export async function Collect(trackEntity: Track) {
    await fetch("/library/sync/collect?" + new URLSearchParams({
        track: trackEntity.permalink_url,
    }));
    trackEntity.synced = true;
}

export async function Evaporate(track: Track) {
    return new Promise(resolve => setTimeout(resolve, 1000));
}