import type { SoundcloudTrackV2 } from 'soundcloud.ts';
import type { Track } from '$lib/data';
import { TracksModel } from '$lib/data';

const SCToRWTTrack = async (track: SoundcloudTrackV2): Promise<Track | null> => {
	return await TracksModel.findOne({
		permalink_url: track.permalink_url
	}).exec();
};

export { SCToRWTTrack };
