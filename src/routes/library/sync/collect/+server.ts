import type { RequestHandler } from '../../../../../.svelte-kit/types/src/routes/library/$types';
import SoundcloudWrapper from '$lib/SoundcloudWrapper';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import { switchSyncStatus } from '$lib/Model';
import { SCToRWTTrack } from '$lib/Utils';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const downloadDirectory = 'tracks';

	const track = await SoundcloudWrapper().raw.tracks.getV2(url.searchParams.get('track') as string);
	const localTrack = await SCToRWTTrack(track);
	if (localTrack === null)
		throw error(404, {
			message: "Couldn't find requested track in db, please do resync"
		});
	const downloadedTrackPath = await SoundcloudWrapper().raw.util.downloadTrack(
		track,
		downloadDirectory
	);
	const downloadedTrackExtension = downloadedTrackPath.split('.').pop()!;

	if (downloadedTrackExtension === 'm4a') {
		const command = ffmpeg();
		command.input(downloadedTrackPath);
		command.audioCodec('libmp3lame').format('mp3');
		command.output(
			(downloadDirectory.length > 0 ? './' + downloadDirectory + '/' : './') + track.title + '.mp3'
		);
		command
			.on('progress', function (progress) {
				console.log(`Processing file: ${progress.percent}% done`);
			})
			.on('end', async () => {
				fs.unlinkSync(downloadedTrackPath);
				await switchSyncStatus(localTrack);
			})
			.on('error', () => {
				return new Response('error during conversion');
			})
			.run();
		return new Response('Converting');
	} else {
		await switchSyncStatus(localTrack);
		return new Response('done without conversion');
	}
};
