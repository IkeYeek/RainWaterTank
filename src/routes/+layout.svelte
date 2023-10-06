<script>
	import { AppShell, Loader, ShellSection, SvelteUIProvider } from '@svelteuidev/core';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	const loadingStore = writable();
	let loading = false;
	loadingStore.set(false);
	loadingStore.subscribe((val) => {
		loading = val;
	});
	setContext('loading', loadingStore);
</script>

<SvelteUIProvider withGlobalStyles themeObserver="dark">
	<AppShell>
		<ShellSection grow>
			{#if loading}
				<div id="loader">
					<Loader />
				</div>
			{:else}
				<slot />
			{/if}
		</ShellSection>
	</AppShell>
</SvelteUIProvider>

<style>
	#loader {
		position: absolute;
		left: 50%;
		top: 50%;
		-webkit-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
	}
</style>
