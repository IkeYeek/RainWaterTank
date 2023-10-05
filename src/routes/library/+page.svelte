<script lang="ts">
    import {
        Alert,
        Button,
        Container,
        Group,
        ThemeIcon,
        Title,
        Accordion,
        Flex,
        Center,
        Stack,
        Text, Skeleton, Space
    } from "@svelteuidev/core";
    import {Heart, InfoCircled, Layers, Play, Reload} from "radix-icons-svelte";
    import {getContext, onMount} from "svelte";
    import LibraryTracks from "./LibraryTracks.svelte";
    import LibraryPlaylists from "./LibraryPlaylists.svelte";

    let libraryData;

    const loading = getContext("loading");

    const sync = async () => {
        loading.set(true);
        await fetch("/library/sync");
        loading.set(false);
        window.location.href = window.location.href;
    }

    const isSynced = async () => {
        libraryData = (await (await fetch("/library")).json());
        if (libraryData.synced) {
            libraryStats = {
                likedAlbums: libraryData.likedAlbums.reduce((acc, curr) => acc + curr.tracks.length, 0),
                likedPlaylists: libraryData.likedPlaylists.reduce((acc, curr) => acc + curr.tracks.length, 0),
                playlists: libraryData.playlists.reduce((acc, curr) => acc + curr.tracks.length, 0),
                tracks: libraryData.userTracks.length,
                likedTracks: libraryData.likedTracks.length,
            }
        }
        return libraryData.synced;
    }

    let isSyncedPromise = isSynced();

    let libraryStats = null;
</script>
<Title order="3">My Library</Title>
{ #await isSyncedPromise}
    <Space h="xl"/>
    <Skeleton height={8} radius="xl" mb="xs"></Skeleton>
    <Skeleton height={8} radius="xl" mb="xs"></Skeleton>
    <Skeleton height={8} radius="xl" mb="xs"></Skeleton>
    <Skeleton height={8} radius="xl" mb="xs"></Skeleton>
    <Skeleton height={8} radius="xl" mb="xs"></Skeleton>
{:then synced}
{#if synced}
    <Accordion variant="filled" chevronPosition="left">
        <Accordion.Item value="Library">
            <div slot="control">
                <Flex>
                    <Center mr="lg">
                        <Layers size={24}/>
                    </Center>
                    <Stack>
                        <Title order={4} color="blue">Library</Title>
                        <Text size="sm" color="gray">Your whole songs collection - {Object.values(libraryStats).reduce((acc, curr) => acc + curr, 0)} tracks</Text>
                    </Stack>
                </Flex>
            </div>
            <Accordion chevronPosition="left">
                <Accordion.Item value="likedAlbums">
                    <div slot="control">
                        <Flex>
                            <Center mr="lg">
                                <Heart size={24}/>
                            </Center>
                            <Stack>
                                <Title order={4} color="blue">Liked Albums</Title>
                                <Text size="sm" color="gray">The albums you liked - {libraryStats.likedAlbums} tracks</Text>
                            </Stack>
                        </Flex>
                    </div>
                    <LibraryPlaylists collection={libraryData.likedAlbums}/>
                </Accordion.Item>
                <Accordion.Item value="likedPlaylists">
                    <div slot="control">
                        <Flex>
                            <Center mr="lg">
                                <Heart size={24}/>
                            </Center>
                            <Stack>
                                <Title order={4} color="blue">Liked Playlists</Title>
                                <Text size="sm" color="gray">The playlists you liked - {libraryStats.likedPlaylists} tracks</Text>
                            </Stack>
                        </Flex>
                    </div>
                    <LibraryPlaylists collection={libraryData.likedPlaylists} />
                </Accordion.Item>
                <Accordion.Item value="likedTracks">
                    <div slot="control">
                        <Flex>
                            <Center mr="lg">
                                <Heart size={24}/>
                            </Center>
                            <Stack>
                                <Title order={4} color="blue">Liked Tracks</Title>
                                <Text size="sm" color="gray">The tracks you liked - { libraryStats.likedTracks } tracks</Text>
                            </Stack>
                        </Flex>
                    </div>
                    <LibraryTracks collection={libraryData.likedTracks}/>
                </Accordion.Item>
                <Accordion.Item value="playlists">
                    <div slot="control">
                        <Flex>
                            <Center mr="lg">
                                <Layers size={24}/>
                            </Center>
                            <Stack>
                                <Title order={4} color="blue">Playlists</Title>
                                <Text size="sm" color="gray">Your playlists - {libraryStats.playlists} tracks</Text>
                            </Stack>
                        </Flex>
                    </div>
                    <LibraryPlaylists collection={libraryData.playlists}/>
                </Accordion.Item>
                <Accordion.Item value="tracks">
                    <div slot="control">
                        <Flex>
                            <Center mr="lg">
                                <Play size={24}/>
                            </Center>
                            <Stack>
                                <Title order={4} color="blue">Tracks</Title>
                                <Text size="sm" color="gray">Your Tracks - { libraryStats.tracks } tracks</Text>
                            </Stack>
                        </Flex>
                    </div>
                    <LibraryTracks collection={libraryData.userTracks}/>
                </Accordion.Item>
            </Accordion>
        </Accordion.Item>
    </Accordion>
{:else}
    <Container size={500}>
        <Alert icon={InfoCircled} title="Not Ready Yet" color="red">
            <Group>
                Your library has not been synced yet ! <Button color="grape" on:click={sync}>Sync library<ThemeIcon variant="grape"><Reload size="16"/></ThemeIcon></Button>
            </Group>
        </Alert>
    </Container>
{/if}
{:catch e}
    { e }
{/await}