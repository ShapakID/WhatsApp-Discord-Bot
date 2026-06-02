const { modul } = require('../../lib/module');
const { axios } = modul;

module.exports = {
    name: 'fb',
    execute: async (hydro, m, args, text, { prefix }) => {
        if (!args[0]) return hydro.sendMessage(m.chat, { text: `Kirim link Facebook-nya!\nContoh: *${prefix}fb https://fb.watch/xxxx*` }, { quoted: m });
        hydro.sendMessage(m.chat, { text: "  Sedang mengambil video Facebook via Botcahx..." }, { quoted: m });
        
        try {
            let apiKey = global.btc;
            if (!apiKey) throw new Error("Apikey Botcahx belum diisi.");

            let apiUrl = `https://api.botcahx.eu.org/api/dowloader/fbdown?url=${encodeURIComponent(args[0])}&apikey=${apiKey}`;
            let res = await axios.get(apiUrl);
            
            if (!res.data || !res.data.status) throw new Error(res.data.message || "Gagal mendapatkan respon dari API.");
            
            let result = res.data.result;
            let videoUrl = result.HD || result.Normal_video || result.url;
            if (Array.isArray(videoUrl)) videoUrl = videoUrl[0];

            await hydro.sendMessage(m.chat, { video: { url: videoUrl }, caption: `_Downloaded by ${global.botname}_` }, { quoted: m });
        } catch (err) {
            let errMsg = err.response?.data?.message || err.message;
            hydro.sendMessage(m.chat, { text: `  Waduh gagal download:\n\n*Alasan:* ${errMsg}` }, { quoted: m });
        }
    }
};