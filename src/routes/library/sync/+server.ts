import SoundcloudWrapper from '$lib/SoundcloudWrapper';
import { syncLibrary } from '$lib/Model';

export async function GET() {
	const api = SoundcloudWrapper();
	const me = await api.me;
	const libraryData = await api.retrieveAllData();
	await syncLibrary(libraryData.playlists, libraryData.tracks, libraryData.likedTracks, me);
	return new Response(
		JSON.stringify({
			synced: true
		}),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
}
