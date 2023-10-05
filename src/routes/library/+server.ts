import {getLastSyncedLibrary, getLastSyncedLibraryData} from "$lib/Model";

export async function GET() {
    const syncData = await getLastSyncedLibraryData();
    if (syncData === null) {
        return new Response(JSON.stringify({ synced: false }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } else {
        return new Response(JSON.stringify({
            synced: true,
            ...syncData,
            ...await getLastSyncedLibrary()
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}