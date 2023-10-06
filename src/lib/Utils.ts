import type {SoundcloudTrackV2} from "soundcloud.ts";
import type {Track} from "$lib/data";

const SCToRWTTrack = (track: SoundcloudTrackV2): Track => {
    return {
        title: track.title,
        artist: track.user.username,
        genre: track.genre,
        tags: track.tag_list,
        permalink_url: track.permalink_url,
        description: track.description || "",
        synced: false,
    };
}

export {
    SCToRWTTrack,
}