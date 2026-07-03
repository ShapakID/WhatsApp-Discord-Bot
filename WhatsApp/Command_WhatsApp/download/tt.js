const { modul } = require('../../lib/module');
const { axios } = modul;

module.exports = {
    name: 'tt',
    execute: async (hydro, m, args, text, { prefix }) => {
        if (!args[0]) return hydro.sendMessage(m.chat, { text: `Kirim link TikTok-nya!\nContoh: *${prefix}tt https://vt.tiktok.com/xxxx/*` }, { quoted: m });
        hydro.sendMessage(m.chat, { text: "  Sedang mengambil video TikTok via TikWM..." }, { quoted: m });

        try {
            let res = await axios.post("https://www.tikwm.com/api/", {
                url: args[0], count: 12, cursor: 0, web: 1, hd: 1
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (!res.data || res.data.code !== 0) throw new Error("Gagal mengambil data video dari server TikWM.");

            let result = res.data.data;
            let videoUrl = result.play || result.wmplay;

            // TikWM API sometimes returns relative URLs like /video/media/play/...
            if (videoUrl && !videoUrl.startsWith('http')) {
                videoUrl = 'https://www.tikwm.com' + videoUrl;
            }

            let title = result.title || 'TikTok Video';
            let cap = `  *Judul:* ${title}\n\n_Downloaded by ${global.botname}_`;

            if (!videoUrl) throw new Error("Link video tidak ditemukan.");

            await hydro.sendMessage(m.chat, { video: { url: videoUrl }, caption: cap }, { quoted: m });
        } catch (err) {
            let errMsg = err.message;
            hydro.sendMessage(m.chat, { text: `  Waduh gagal download:\n\n*Alasan:* ${errMsg}` }, { quoted: m });
        }
    }
};