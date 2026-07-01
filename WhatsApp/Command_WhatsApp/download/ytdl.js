const { modul } = require('../../lib/module');
const { axios } = modul;

module.exports = {
    name: 'ytdl',
    execute: async (hydro, m, args, text, { prefix }) => {
        const type = args[0];
        const url = args[1];
        if (!type || !url) return;

        hydro.sendMessage(m.chat, { text: `_Sedang memproses ${type.toUpperCase()} via Ryzendesu API..._` });

        try {
            let apiUrl = type === 'mp3' 
                ? `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(url)}`
                : `https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(url)}`;

            let res = await axios.get(apiUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });

            if (!res.data || !res.data.url) throw new Error(`Gagal mengambil data dari Ryzendesu API.`);

            let finalUrl = res.data.url;
            let title = res.data.title || res.data.title_audio || 'YouTube Video';
            let thumb = res.data.thumb || '';

            if (!finalUrl) throw new Error("Link file tidak ditemukan dalam respon API.");

            let cap = `*YouTube Downloader*\n\n◦ *Judul:* ${title}\n\n_Downloaded by ${global.botname}_`;

            if (type === 'mp3') {
                await hydro.sendMessage(m.chat, {
                    audio: { url: finalUrl },
                    mimetype: 'audio/mpeg',
                    fileName: `${title}.mp3`
                }, { quoted: m });
            } else {
                await hydro.sendMessage(m.chat, { video: { url: finalUrl }, caption: cap }, { quoted: m });
            }
        } catch (err) {
            let errMsg = err.message;
            if (err.response) errMsg = `Server Error: ${err.response.status}`;
            hydro.sendMessage(m.chat, { text: `Error: ${errMsg}` }, { quoted: m });
        }
    }
};