import type {RequestHandler} from "../../../../../.svelte-kit/types/src/routes/library/$types";
import * as fs from "fs";
import SoundcloudWrapper from "$lib/SoundcloudWrapper";
import {error} from "@sveltejs/kit";
import {TracksModel} from "$lib/data";
import {switchSyncStatus} from "$lib/Model";

export const GET: RequestHandler = async ({url}) => {
    const downloadDirectory = "tracks";
    const permalink = url.searchParams.get("track");
    if (permalink === null) throw error(400, {
        message: "Bad API usage",
    })
    const track = await TracksModel.findOne({
        permalink_url: permalink,
    }).exec();
    if (track === null)
        throw error(404, {
            message: `Track with permalink ${permalink} not found in database`
        });
    if (track.synced)
        await switchSyncStatus(track);
    const fname = ((downloadDirectory.length > 0 ? './' + downloadDirectory + '/' : './') + track.title + ".mp3");
    if (fs.existsSync(fname)) {
        fs.unlinkSync(fname);
        return new Response(JSON.stringify({"message": `Track ${track.title} from ${track.artist} deleted`}));
    }
    throw error(404, {
        message: `Track ${track.title} from ${track.artist} not found in crates`
    });
}