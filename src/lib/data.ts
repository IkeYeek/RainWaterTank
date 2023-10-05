import mongoose from 'mongoose';
const { Schema } = mongoose;
interface SCMandatoryMetadata {
    title: string,
    permalink_url: string,
    description?: string,
}

interface Track extends SCMandatoryMetadata {
    artist: string,
    genre: string,
    tags: string,
    synced: boolean,
}

interface Playlist extends SCMandatoryMetadata {
    author: string,
    track_count: number,
    tracks: Array<Track>
}
const TrackSchema = new Schema<Track>({
    artist: String,
    title: String,
    description: String,
    permalink_url: String,
    genre: String,
    tags: String,
    synced: Boolean,
});

const TrackRepositorySchema = new Schema({
   track_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Track'}
});

const PlaylistSchema = new Schema<Playlist>({
    title: String,
    description: String,
    permalink_url: String,
    author: String,
    track_count: Number,
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }]
});

const SyncDataSchema = new Schema({
    date: Date,
});

const TrackModel = mongoose.model('tracks', TrackSchema, 'tracks');
const UserTracksModel = mongoose.model('userTracks', TrackRepositorySchema, 'userTracks')
const SyncDataModel = mongoose.model('syncdata', SyncDataSchema, 'syncdata', 'syncdata');
const UserPlaylistsModel = mongoose.model('userPlaylists', PlaylistSchema, 'userPlaylists');
const LikedTracksModel = mongoose.model('likedTracks', TrackRepositorySchema, 'likedTracks');
const LikedPlaylistsModel = mongoose.model('likedPlaylists', PlaylistSchema, 'likedPlaylists');
const LikedAlbumsModel = mongoose.model('likedAlbums', PlaylistSchema, 'likedAlbums');

export type {
    Track,
    Playlist,
}

export {
    TrackSchema,
    TrackRepositorySchema,
    PlaylistSchema,

    TrackModel,
    UserTracksModel,
    SyncDataModel,
    UserPlaylistsModel,
    LikedTracksModel,
    LikedPlaylistsModel,
    LikedAlbumsModel,
}

