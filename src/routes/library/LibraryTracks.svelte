<script lang="ts">
	import { Button, Space, Stack, Text, Divider, Loader } from '@svelteuidev/core';
	import { Download, Trash } from 'radix-icons-svelte';
	import { Collect, Evaporate } from '$lib/Tank';
	import type { Track } from '$lib/data';

	export let collection: Array<Track>;
	let syncingTracks = [];
	const switchSyncStatus = async (track: Track) => {
		syncingTracks = [...syncingTracks, track];
		if (track.synced) {
			await Evaporate(track);
		} else {
			await Collect(track);
		}
		syncingTracks = syncingTracks.filter((t) => t !== track);
	};
</script>

<Stack>
	<Divider />
	{#each collection as track}
		<div style="display: flex">
			<Text>-</Text>
			<Space w="xl" />
			<Text size="xs">{track.title}</Text>
			<Space w="xs" />
			<Text size="xs">-</Text>
			<Space w="xs" />
			<Text size="xs">{track.artist}</Text>
			<div style="margin-left: auto">
				{#if syncingTracks.includes(track)}
					<Button radius="xl" disabled variant="filled" size="lg" color="transparent">
						<Loader variant="bars" />
					</Button>
				{:else if track.synced}
					<Button
						radius="xl"
						on:click={async () => await switchSyncStatus(track)}
						variant="filled"
						size="lg"
						color="green"
					>
						<Trash />
					</Button>
				{:else}
					<Button
						radius="xl"
						on:click={async () => await switchSyncStatus(track)}
						variant="filled"
						size="lg"
						color="yellow"
					>
						<Download />
					</Button>
				{/if}
			</div>
		</div>
		<Divider />
	{/each}
</Stack>
