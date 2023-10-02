<script lang="ts">
    import type {SCPlaylist} from "$lib/Model";
    import {Accordion, Title} from "@svelteuidev/core";
    import LibraryTracks from "./LibraryTracks.svelte";

    export let collection: Array<SCPlaylist>;
</script>

<Accordion>
    {#each collection as item}
        <Accordion.Item value={`playlist-${item.permalink_url}`}>
            <div slot="control">
                <Title order={4}>
                    { item.title }
                </Title>
            </div>
            <LibraryTracks collection={item.tracks}/>
        </Accordion.Item>
    {/each}
</Accordion>