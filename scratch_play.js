const play = require('play-dl');
const fs = require('fs');

async function test() {
    try {
        const clientID = await play.getFreeClientID();
        play.setToken({ soundcloud: { client_id: clientID } });

        let scSearch = await play.search("Backstreet Boys Shape of My Heart", { limit: 1, source: { soundcloud: 'tracks' } });

        let url = scSearch[0]?.url;
        console.log("Streaming from API URL:", url);

        let stream = await play.stream(url);

        let chunks = 0;
        let bytes = 0;
        stream.stream.on('data', chunk => {
            chunks++;
            bytes += chunk.length;
        });
        stream.stream.on('end', () => {
            console.log(`Stream ended. Chunks: ${chunks}, Bytes: ${bytes}`);
        });
        stream.stream.on('error', err => {
            console.error("Stream error:", err);
        });

    } catch (e) {
        console.error("Error:", e);
    }
}
test();
