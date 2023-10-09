# RainWaterTank
easily manage locally your soundcloud library !

With RainWaterTank, collect your tracks directly from the clouds so you can easily take your favorites songs out for djing.

I built this because I use SeratoDJ soundcloud integration everydays, but I felt it overkill to always download your song on the go in order to mix it. Now, I can search for tracks online, put them in playlists and then download them. 

## Current State
For the moment, this little app is still under development. You can use it to manage your library but it will download all the tracks in the same folder, and is pretty basic for the moment. More incoming

## How to use
1) Install Docker
2) Download the repo either by cloning / forking+cloning it or by directly downloading sources (not recommanded)
3) Make a .env from the .env.example. You will need __Soundcloud Go+__ in order to download songs.
4) Run `docker compose up`. That will pull the required images for the app + the database, and then serve the app on local port 5173 by default
5) Sync your library and have fun. Syncing takes time so be patient !

## Credits
[soundcloud.ts](https://github.com/Tenpi/soundcloud.ts)

[SvelteKit](https://kit.svelte.dev/)

[SvelteUI](https://svelteui.org)

[Radix UI icons](https://www.radix-ui.com/icons)

[Docker](https://www.docker.com/)

[MongoDB](https://www.mongodb.com/)

[Mongoose](https://mongoosejs.com/)