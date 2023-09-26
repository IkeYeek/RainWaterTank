import SoundcloudWrapper from "$lib/SoundcloudWrapper";
import {syncLibrary} from "$lib/Model";

export async function load() {
    const api = SoundcloudWrapper();
    console.log(await api.retrieveLikedTracks());
    //const data = await api.retrieveAllData();
    //await syncLibrary(data.playlists, data.tracks, data.likedTracks, await api.raw.me.getV2());
    return {
        data: ""
    };
}