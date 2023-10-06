import type {RequestHandler} from "../../../../../.svelte-kit/types/src/routes/library/$types";
import * as fs from "fs";
import SoundcloudWrapper from "$lib/SoundcloudWrapper";
import {error} from "@sveltejs/kit";
export const GET: RequestHandler = async ({url}) => {
    const downloadDirectory = "tracks";
    const track = await SoundcloudWrapper().raw.tracks.getV2(url.searchParams.get("track") as string);
    const fname = ((downloadDirectory.length > 0 ? './' + downloadDirectory + '/' : './') + track.title + ".mp3");
    if (fs.existsSync(fname)) {
        fs.unlinkSync(fname);
        return new Response(JSON.stringify({"message": `Track ${track.title} from ${track.user.username} deleted`}));
    }
    throw error(404, {
        message: `Track ${track.title} from ${track.user.username} not found in crates`
    });
}