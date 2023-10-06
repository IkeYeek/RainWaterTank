import type {Track} from "$lib/data";

export async function Collect(trackEntity: Track) {
    const res = await fetch("/library/sync/collect?" + new URLSearchParams({
        track: trackEntity.permalink_url,
    }));
    trackEntity.synced = res.ok;
}

export async function Evaporate(trackEntity: Track) {
    await fetch("/library/sync/evaporate?" + new URLSearchParams({
        track: trackEntity.permalink_url,
    }));
    trackEntity.synced = false;
}