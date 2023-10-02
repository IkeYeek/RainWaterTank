import {Collection, MongoClient, ObjectId} from "mongodb";
import type { WithId } from "mongodb";
import type {SoundcloudPlaylistV2, SoundcloudTrackV2, SoundcloudUser} from "soundcloud.ts";

type SyncData = {
    date: Date,
    stats: LibraryStats,
}

type LibraryStats = {
    libraryStats: number,
    userTracksStats: number,
    likedTracksStats: number,
    total: number,
}

export type Track = {
    title: string,
    description: string,
    artist: string,
    genre: string,
    tags: string,
    permalink_url: string,
    synced: boolean,
}

type SCPlaylistRaw = {
    title: string,
    description: string,
    permalink_url: string,
    author: string,
    track_count: number,
    tracks: Array<ObjectId>,
}

export type SCPlaylist = {
    title: string,
    description: string,
    permalink_url: string,
    author: string,
    track_count: number,
    tracks: Array<Track>,
}

const connectToDatabase = async () => {
    const client = new MongoClient("mongodb://root:toor@mongo:27017/");
    await client.connect();
    return client.db("RainWaterTank");
}

const getStats = (library: Array<SoundcloudPlaylistV2>, userTracks: Array<SoundcloudTrackV2>, likedTracks: Array<SoundcloudTrackV2>): LibraryStats => {
    const libraryStats = library.reduce((total: number, currentValue: SoundcloudPlaylistV2) => total + currentValue.track_count, 0);
    const userTracksStats = userTracks.length;
    const likedTracksStats = likedTracks.length;
    return {
        libraryStats,
        userTracksStats,
        likedTracksStats,
        total: libraryStats + userTracksStats + likedTracksStats,
    }
}

const syncLibrary = async (library: Array<SoundcloudPlaylistV2>, userTracks: Array<SoundcloudTrackV2>, likedTracks: Array<SoundcloudTrackV2>, userMe: SoundcloudUser) => {
    const db = await connectToDatabase();
    const knownTracksPermas = new Map<string, ObjectId>();
    const ensureInserted = async (track: SoundcloudTrackV2) => {
        if (!knownTracksPermas.has(track.permalink_url)) {
            const castedTrack: Track = {
                title: track.title,
                artist: track.user.username,
                description: track.description || "",
                genre: track.genre,
                tags: track.tag_list,
                permalink_url: track.permalink_url,
                synced: false,
            }
            const id = await db.collection("tracks").insertOne(castedTrack);
            knownTracksPermas.set(castedTrack.permalink_url, id.insertedId);
            return id.insertedId;
        }
        return knownTracksPermas.get(track.permalink_url);
    }
    const collectionNames = [
        "likedTracks",
        "likedPlaylists",
        "likedAlbums",
        "playlists",
        "userTracks",
        "tracks",
        "syncdata"
    ];

    for (const collectionToDropName of (await db.listCollections().toArray())
        .map(collection => collection.name)
        .filter(name => collectionNames.includes(name))) {
        await db.dropCollection(collectionToDropName);
    }

    for (const collectionToCreateName of collectionNames) {
        await db.createCollection(collectionToCreateName);
    }

    await db.collection("syncdata").insertOne({
        date: new Date(),
        stats: getStats(library, userTracks, likedTracks)
    });

    for (const likedTrack of likedTracks) {
       const id = await ensureInserted(likedTrack);
       await db.collection("likedTracks").insertOne({
           track_id: id,
       });
    }

    for (const likedTrack of userTracks) {
        const id = await ensureInserted(likedTrack);
        await db.collection("userTracks").insertOne({
            track_id: id,
        });
    }

    for (const soundcloudPlaylistV2 of library) {
        let collection: Collection<SCPlaylistRaw>;
        if (soundcloudPlaylistV2.is_album) {
            collection = db.collection("likedAlbums");
        }
        else if (soundcloudPlaylistV2.user_id == userMe.id) {
            collection = db.collection("playlists");
        } else {
            collection = db.collection("likedPlaylists");
        }
        const tracks: Array<ObjectId> = [];
        for (const track of soundcloudPlaylistV2.tracks) {
            tracks.push((await ensureInserted(track))!);
        }
        const castedPlaylist: SCPlaylistRaw = {
            title: soundcloudPlaylistV2.title,
            author: soundcloudPlaylistV2.user.username,
            description: soundcloudPlaylistV2.description || "",
            permalink_url: soundcloudPlaylistV2.permalink_url,
            track_count: soundcloudPlaylistV2.track_count,
            tracks,
        }
        await collection.insertOne(castedPlaylist);
    }
}

const getLastSyncedLibraryData = async () => {
    const db = await connectToDatabase();
    return await db.collection("syncdata").findOne() as WithId<SyncData>
}

const getLastSyncedLibrary = async () => {
    const db = await connectToDatabase();

    const likedTracks = await db.collection("likedTracks").find().toArray() as WithId<{ track_id: ObjectId }>[];
    const likedAlbums = await db.collection("likedAlbums").find().toArray() as WithId<SCPlaylistRaw>[];
    const likedPlaylists = await db.collection("likedPlaylists").find().toArray() as WithId<SCPlaylistRaw>[];
    const playlists = await db.collection("playlists").find().toArray() as WithId<SCPlaylistRaw>[];
    const userTracks = await db.collection("userTracks").find().toArray() as WithId<{ track_id: ObjectId}>[];
    const tracks = await db.collection("tracks").find().toArray() as WithId<Track>[];
    return {
        likedTracks: likedTracks.map(trackRaw => {
            const raw = tracks.find(track => track._id.equals(trackRaw.track_id))!
            const ret: Track = {
                ...raw
            };
            return ret;
        }),
        userTracks: userTracks.map(trackRaw => {
            const raw = tracks.find(track => track._id.equals(trackRaw.track_id))!
            const ret: Track = {
                ...raw
            };
            return ret;
        }),
        likedAlbums: likedAlbums.map(likedAlbum => {
            const ret: SCPlaylist = {
                title: likedAlbum.title,
                author: likedAlbum.author,
                track_count: likedAlbum.track_count,
                description: likedAlbum.description,
                permalink_url: likedAlbum.permalink_url,
                tracks: likedAlbum.tracks.map(trackId => tracks.find(track => track._id.equals(trackId))!)
            }
            return ret;
        }),
        likedPlaylists: likedPlaylists.map(likedPlaylist => {
            const ret: SCPlaylist = {
                title: likedPlaylist.title,
                author: likedPlaylist.author,
                track_count: likedPlaylist.track_count,
                description: likedPlaylist.description,
                permalink_url: likedPlaylist.permalink_url,
                tracks: likedPlaylist.tracks.map(trackId => tracks.find(track => track._id.equals(trackId))!)
            }
            return ret;
        }),
        playlists: playlists.map(playlists => {
            const ret: SCPlaylist = {
                title: playlists.title,
                author: playlists.author,
                track_count: playlists.track_count,
                description: playlists.description,
                permalink_url: playlists.permalink_url,
                tracks: playlists.tracks.map(trackId => tracks.find(track => track._id.equals(trackId))!)
            }
            return ret;
        }),
    }
}

export {
    syncLibrary,
    getLastSyncedLibraryData,
    getLastSyncedLibrary
}
