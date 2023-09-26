import {Collection, MongoClient} from "mongodb";
import type {SoundcloudPlaylistV2, SoundcloudTrackV2, SoundcloudUser} from "soundcloud.ts";

const connectToDatabase = async () => {
    const client = new MongoClient("mongodb://root:toor@mongo:27017/");
    await client.connect();
    return client.db("RainWaterTank");
}

const syncLibrary = async (library: Array<SoundcloudPlaylistV2>, userTracks: Array<SoundcloudTrackV2>, likedTracks: Array<SoundcloudTrackV2>, userMe: SoundcloudUser) => {
    const db = await connectToDatabase();
    const collectionNames = [
        "likedTracks",
        "likedPlaylists",
        "likedAlbums",
        "playlists",
        "tracks",
    ];

    for (const collectionToDropName of (await db.listCollections().toArray())
        .map(collection => collection.name)
        .filter(name => collectionNames.includes(name))) {
        await db.dropCollection(collectionToDropName);
    }

    for (const collectionToCreateName of collectionNames) {
        await db.createCollection(collectionToCreateName);
    }

    likedTracks.forEach(likedTrack => db.collection("likedTracks").insertOne(likedTrack));
    userTracks.forEach(userTrack => db.collection("tracks").insertOne(userTrack));
    library.forEach(libraryEntry => {
        let collection: Collection<SoundcloudPlaylistV2>;
        if (libraryEntry.is_album) {
            collection = db.collection("likedAlbums");
        }
        else if (libraryEntry.user_id == userMe.id) {
            collection = db.collection("playlists");
        } else {
            collection = db.collection("likedPlaylists");
        }
        collection.insertOne(libraryEntry);
    })
}

export {
    syncLibrary
}
