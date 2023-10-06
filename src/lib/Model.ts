import type {SoundcloudPlaylistV2, SoundcloudTrackV2, SoundcloudUser} from "soundcloud.ts";
import type {Playlist, Track} from "$lib/data";
import {
    LikedAlbumsModel,
    LikedPlaylistsModel,
    LikedTracksModel,
    SyncDataModel,
    TracksModel,
    UserPlaylistsModel,
    UserTracksModel
} from "$lib/data";
import mongoose, {connect} from "mongoose";

let DB: typeof mongoose | null = null;

const connectToDatabase = async () => {
    if (DB === null) {
        DB = await connect("mongodb://root:toor@mongo:27017/RainWaterTank?authSource=admin");
    }
    return DB;
}

const syncLibrary = async (library: Array<SoundcloudPlaylistV2>, userTracks: Array<SoundcloudTrackV2>, likedTracks: Array<SoundcloudTrackV2>, userMe: SoundcloudUser) => {
    const db = await connectToDatabase();
    const knownTracksPermas = new Map<string,  mongoose.Document<unknown, object, Track> & Track & {_id: mongoose.Types.ObjectId}>();
    const ensureInserted = async (track: SoundcloudTrackV2) => {
        if (!knownTracksPermas.has(track.permalink_url)) {
            const castedTrack = new TracksModel({
                title: track.title,
                artist: track.user.username,
                description: track.description || "",
                genre: track.genre,
                tags: track.tag_list,
                permalink_url: track.permalink_url,
                synced: false,
            });

            await castedTrack.save();
            knownTracksPermas.set(castedTrack.permalink_url, castedTrack);
            return castedTrack;
        }
        return knownTracksPermas.get(track.permalink_url)!;
    }
    const collectionNames = [
        "likedTracks",
        "likedPlaylists",
        "likedAlbums",
        "userPlaylists",
        "userTracks",
        "tracks",
        "syncdata"
    ];

    for (const collectionToDropName of (await db.connection.db!.listCollections().toArray())
        .map(collection => collection.name)
        .filter(name => collectionNames.includes(name))) {
        await db.connection.db!.dropCollection(collectionToDropName);
    }

    await new SyncDataModel({
        date: Date(),
    }).save();

    for (const likedTrack of likedTracks) {
       const t = await ensureInserted(likedTrack);
       const track = new LikedTracksModel({
          track_id: t.id,
       });
       await track.save();
    }

    for (const userTrack of userTracks) {
        const t = await ensureInserted(userTrack);
        const track = new UserTracksModel({
            track_id: t.id,
        })
        await track.save();
    }

    for (const soundcloudPlaylistV2 of library) {
        let collection: typeof LikedPlaylistsModel | typeof  UserPlaylistsModel | typeof LikedPlaylistsModel;
        if (soundcloudPlaylistV2.is_album) {
            collection = LikedAlbumsModel;
        }
        else if (soundcloudPlaylistV2.user_id == userMe.id) {
            collection = UserPlaylistsModel;
        } else {
            collection = LikedPlaylistsModel;
        }
        const tracks: Array<Track> = [];
        for (const track of soundcloudPlaylistV2.tracks) {
            tracks.push((await ensureInserted(track))!);
        }
        const castedPlaylist: Playlist = {
            title: soundcloudPlaylistV2.title,
            author: soundcloudPlaylistV2.user.username,
            description: soundcloudPlaylistV2.description || "",
            permalink_url: soundcloudPlaylistV2.permalink_url,
            track_count: soundcloudPlaylistV2.track_count,
            tracks,
        }
        await new collection(castedPlaylist).save();
    }
}

const getLastSyncedLibraryData = async () => {
    const db = await connectToDatabase();
    return await db.connection.db!.collection("syncdata").findOne();
}

const getLastSyncedLibrary = async () => {
    const db = await connectToDatabase();


    const likedTracks = await db.connection.db!.collection("likedTracks").find().toArray();
    const likedAlbums = await db.connection.db!.collection("likedAlbums").find().toArray();
    const likedPlaylists = await db.connection.db!.collection("likedPlaylists").find().toArray();
    const userPlaylists = await db.connection.db!.collection("userPlaylists").find().toArray();
    const userTracks = await db.connection.db!.collection("userTracks").find().toArray();
    const tracks = await db.connection.db!.collection("tracks").find().toArray();
    return {
        likedTracks: likedTracks.map(trackRaw => {
            const raw = tracks.find(track => track._id.equals(trackRaw.track_id))!
            return {
                ...raw
            };
        }),
        userTracks: userTracks.map(trackRaw => {
            const raw = tracks.find(track => track._id.equals(trackRaw.track_id))!
            return {
                ...raw
            };
        }),
        likedAlbums: likedAlbums.map(likedAlbum => {
            const ret: Playlist = {
                title: likedAlbum.title,
                author: likedAlbum.author,
                track_count: likedAlbum.track_count,
                description: likedAlbum.description,
                permalink_url: likedAlbum.permalink_url,
                tracks: likedAlbum.tracks.map((trackId: mongoose.Types.ObjectId) => tracks.find(track => track._id.equals(trackId))!)
            }
            return ret;
        }),
        likedPlaylists: likedPlaylists.map(likedPlaylist => {
            const ret: Playlist = {
                title: likedPlaylist.title,
                author: likedPlaylist.author,
                track_count: likedPlaylist.track_count,
                description: likedPlaylist.description,
                permalink_url: likedPlaylist.permalink_url,
                tracks: likedPlaylist.tracks.map((trackId: mongoose.Types.ObjectId) => tracks.find(track => track._id.equals(trackId))!)
            }
            return ret;
        }),
        playlists: userPlaylists.map(playlists => {
            const ret: Playlist = {
                title: playlists.title,
                author: playlists.author,
                track_count: playlists.track_count,
                description: playlists.description,
                permalink_url: playlists.permalink_url,
                tracks: playlists.tracks.map((trackId: mongoose.Types.ObjectId) => tracks.find(track => track._id.equals(trackId))!)
            }
            for (const t of playlists.tracks) {
                const found = tracks.find(track => track._id.equals(t));
                if (found === undefined)
                    console.log(t)
            }
            return ret;
        }),
    }
}

const switchSyncStatus = async (track: Track) => {
    const newStatus = !track.synced;
    const db = await connectToDatabase();
    const collection = db.connection.db!.collection("tracks");
    await collection.updateOne({
        permalink_url: track.permalink_url
    }, {
        $set: {
            synced: newStatus,
        }
    });
}

export {
    syncLibrary,
    getLastSyncedLibraryData,
    getLastSyncedLibrary,
    switchSyncStatus,
}
