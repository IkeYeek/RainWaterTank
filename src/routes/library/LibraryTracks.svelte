<script lang="ts">
    import type {Track} from "$lib/Model";
    import {Space, Stack, Text, ThemeIcon} from "@svelteuidev/core";
    import {Download } from "radix-icons-svelte";

    export let collection: Array<Track>;
    console.log(collection)
</script>

<Stack>
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
                <ThemeIcon variant="filled" radius="lg" size="lg" color="{track.synced ? 'green' : 'yellow' }">
                    <Download />
                </ThemeIcon>
            </div>
        </div>
    {/each}
</Stack>