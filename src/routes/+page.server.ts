import SoundcloudWrapper from "$lib/SoundcloudWrapper";
import ffmpeg from 'fluent-ffmpeg';
import * as fs from "fs";

export async function load() {
    const downloadDirectory = "tracks";


    const track = await SoundcloudWrapper().raw.tracks.getV2('acidpach/acidpach-tenma');
    const downloadedTrackPath = await SoundcloudWrapper().raw.util.downloadTrack(track, downloadDirectory);
    const downloadedTrackExtension = downloadedTrackPath.split('.').pop()!;

    if (downloadedTrackExtension === "m4a") {
        console.log("NEEDS CONVERSION TO MP3")
        const command = ffmpeg();
        command.input(downloadedTrackPath);
        command.audioCodec("libmp3lame").format("mp3");
        command.output((downloadDirectory.length > 0 ? './' + downloadDirectory + '/' : './') + track.title + ".mp3");
        command.on('progress', function(progress) {
            console.log('Processing: ' + progress.percent + '% done');
        })
            .on('end', () => {
            console.log("FINISHED CONVERTING TO MP3");
            fs.unlinkSync(downloadedTrackPath);
        })
            .on('error', () => {
            console.log("UNKNOWN ERROR");
        })
            .run();
    }
}