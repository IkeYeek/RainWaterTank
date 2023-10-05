<script lang="ts">
    import type {Track} from "$lib/Model";
    import {Button, Space, Stack, Text, Divider} from "@svelteuidev/core";
    import {Download } from "radix-icons-svelte";
    import {Collect, Evaporate} from "$lib/Tank";

    export let collection: Array<Track>;
    let syncingTracks = [];
    const switchSyncStatus = async (track: Track) => {
        syncingTracks = [...syncingTracks, track]
        if (track.synced) {
            await Evaporate(track);
        } else {
            await Collect(track);
        }
        syncingTracks = syncingTracks.filter(t => t !== track);
    }
</script>

<Stack>
    <Divider />
    {#each collection as track}
        <div style="display: flex">
            <Text>-</Text>
            <Space w="xl"/>
            <Text size="xs">{track.title}</Text>
            <Space w="xs" />
            <Text size="xs">-</Text>
            <Space w="xs" />
            <Text size="xs">{track.artist}</Text>
            <div style="margin-left: auto">
                <Button radius="xl" on:click={async () => await switchSyncStatus(track)} variant="filled" size="lg" color={syncingTracks.includes(track) ? 'grape' : track.synced ? 'green' : 'yellow' }>
                    <Download />
                </Button>
            </div>
        </div>
        <Divider />
    {/each}
</Stack>