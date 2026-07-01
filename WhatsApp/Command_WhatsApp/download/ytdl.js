const { modul } = require('../../lib/module');
const { axios } = modul;

module.exports = {
    name: 'ytdl',
    execute: async (hydro, m, args, text, { prefix }) => {
        const type = args[0];
        const url = args[1];
        if (!type || !url) return;

        hydro.sendMessage(m.chat, { text: `_Sedang memproses ${type.toUpperCase()} via Botcahx..._` });

        try {
            let apiKey = global.btc;
            // Fix pakai URL yang persis sama kayak yang kamu temuin
            let apiUrl = `https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(url)}&apikey=${apiKey}`;

            let res = await axios.get(apiUrl);
            if (!res.data || !res.data.status) throw new Error(`Gagal memproses link dari Botcahx.`);

            let result = res.data.result;

            // Tangkap link MP3 atau MP4 dari result
            let finalUrl = '';
            if (type === 'mp3') {
                finalUrl = result.mp3 || result.audio || (result.url && result.url.mp3);
            } else {
                finalUrl = result.mp4 || result.video || (result.url && result.url.mp4);
            }

            // Jaga-jaga kalau ternyata cuma ngasih satu string langsung atau array
            if (!finalUrl && typeof result === 'string') finalUrl = result;
            if (Array.isArray(finalUrl)) finalUrl = finalUrl[0];

            if (!finalUrl) {
                console.log("Isi Respon API:", result); // Biar gampang nge-track di terminal kalau gagal
                throw new Error("Link file tidak ditemukan dalam respon API.");
            }

            let cap = `*YouTube Downloader*\n\n◦ *Judul:* ${result.title || 'YouTube Video'}\n\n_Downloaded by ${global.botname}_`;

            if (type === 'mp3') {
                await hydro.sendMessage(m.chat, {
                    audio: { url: finalUrl },
                    mimetype: 'audio/mpeg',
                    fileName: `${result.title || 'audio'}.mp3`
                }, { quoted: m });
            } else {
                await hydro.sendMessage(m.chat, { video: { url: finalUrl }, caption: cap }, { quoted: m });
            }
        } catch (err) {
            let errMsg = err.response?.status === 404 ? "API Endpoint tidak ditemukan (404)" : (err.response?.data?.message || err.message);
            hydro.sendMessage(m.chat, { text: `Error: ${errMsg}` }, { quoted: m });
        }
    }
};