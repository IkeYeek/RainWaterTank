import "dotenv/config";
import Soundcloud from "soundcloud.ts";
import type { SoundcloudUserV2, SoundcloudPlaylistV2, SoundcloudTrackV2 } from "soundcloud.ts";

type SoundcloudRawLibraryChunk = {
    collection: Array<SoundRawLibraryEntry | SoundcloudRawTrackEntry>,
    next_href: string
}

type SoundRawLibraryEntry = {
    created_at: Date,
    type: string,
    user: SoundcloudUserV2,
    uuid: string,
    playlist: {
        permalink_url: string
    },
}

type SoundcloudRawTrackEntry = {
    created_at: Date,
    track: SoundcloudTrackV2
}

const SoundcloudWrapper = () => {
    const soundcloud = new Soundcloud({
        oauthToken: process.env.OAUTH_TOKEN,
        clientId: process.env.CLIENT_ID,
    })

    const retrieveEndpointChunk = async (endpoint: string, offset='', limit=10) => {
        return await soundcloud.api.getV2(
            endpoint,
            {
                offset,
                limit
            }
        ) as SoundcloudRawLibraryChunk;
    }

    const retrieveRawLibrary = async (allCrates: Array<SoundRawLibraryEntry> = [], nextOffset: string | undefined = undefined): Promise<Array<SoundRawLibraryEntry>>  => {
        const retrievedCrates = await retrieveEndpointChunk("/me/library/all", nextOffset, 5);
        if (retrievedCrates.collection.length > 0) {
            retrievedCrates.collection.forEach(v => allCrates.push(v as SoundRawLibraryEntry));

            const nextOffsetURL = new URL(retrievedCrates.next_href);
            const offsetParam = nextOffsetURL.searchParams.get('offset');
            if (offsetParam !== null) {
                const decodedOffset = decodeURIComponent(offsetParam);
                return await retrieveRawLibrary(allCrates, decodedOffset)
            }
        }
        return allCrates;
    }

    const retrieveFilledLibrary = async (): Promise<Array<SoundcloudPlaylistV2>> => {
        const rawPlaylists = await retrieveRawLibrary();
        const playlists: Array<SoundcloudPlaylistV2> = [];
        for (const rawPlaylist of rawPlaylists) {
            playlists.push(await soundcloud.playlists.getV2(rawPlaylist.playlist.permalink_url));
        }
        return playlists;
    }

    const retrieveTracks = async () : Promise<Array<SoundcloudTrackV2>> => {
        return await soundcloud.users.tracksV2((await soundcloud.me.getV2()).id);
    }

    const retrieveLikedTracks = async (allLikedTracks: Array<SoundcloudTrackV2> = [], nextOffset: string | undefined = undefined) : Promise<Array<SoundcloudTrackV2>> => {
        const retrievedChunk = await retrieveEndpointChunk(`/users/${(await soundcloud.me.getV2()).id}/track_likes`, nextOffset);
        if (retrievedChunk.collection.length > 0) {
            const remapped = (retrievedChunk.collection as Array<SoundcloudRawTrackEntry>).map(entry => entry.track);
            allLikedTracks.push(...remapped);
            const nextOffsetURL = new URL(retrievedChunk.next_href);
            const offsetParam = nextOffsetURL.searchParams.get('offset');
            if (offsetParam !== null) {
                const decodedOffset = decodeURIComponent(offsetParam);
                return retrieveLikedTracks(allLikedTracks, decodedOffset);
            }
        }
        return allLikedTracks;
    }

    const retrieveAllData = async () => {
        return {
            likedTracks: await retrieveLikedTracks(),
            tracks: await retrieveTracks(),
            playlists: await retrieveFilledLibrary(),
        }
    }

    return {
        raw: soundcloud,
        retrievePlaylists: retrieveFilledLibrary,
        retrieveRawLibrary,
        retrieveTracks,
        retrieveLikedTracks,
        retrieveAllData,
        me: soundcloud.me.getV2()
    }
}



export default SoundcloudWrapper;