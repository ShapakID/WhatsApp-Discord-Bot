const { modul } = require('../../lib/module');
const { axios } = modul;

module.exports = {
    name: 'tt',
    execute: async (hydro, m, args, text, { prefix }) => {
        if (!args[0]) return hydro.sendMessage(m.chat, { text: `Kirim link TikTok-nya!\nContoh: *${prefix}tt https://vt.tiktok.com/xxxx/*` }, { quoted: m });
        hydro.sendMessage(m.chat, { text: "  Sedang mengambil video TikTok via Botcahx..." }, { quoted: m });
        
        try {
            let apiKey = global.btc; 
            if (!apiKey) throw new Error("Apikey Botcahx belum diisi di settings.js");

            let apiUrl = `https://api.botcahx.eu.org/api/download/tiktok?url=${encodeURIComponent(args[0])}&apikey=${apiKey}`;
            let res = await axios.get(apiUrl);
            
            if (!res.data || !res.data.status) throw new Error(res.data.message || "Gagal mendapatkan respon dari API Botcahx.");
            
            let result = res.data.result;
            let videoUrl = result.video || result.nowm || result.no_watermark;
            
            // Fix untuk error "Received an instance of Array"
            if (Array.isArray(videoUrl)) {
                videoUrl = videoUrl[0]; // Ambil elemen pertama jika bentuknya array
            }

            let title = result.title || 'TikTok Video';
            let cap = `  *Judul:* ${title}\n\n_Downloaded by ${global.botname}_`;
            
            if (!videoUrl) throw new Error("Link video tidak ditemukan.");

            let vidBuffer = await axios.get(videoUrl, { 
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            await hydro.sendMessage(m.chat, { video: vidBuffer.data, caption: cap }, { quoted: m });
        } catch (err) {
            let errMsg = err.response?.data?.message || err.message;
            hydro.sendMessage(m.chat, { text: `  Waduh gagal download:\n\n*Alasan:* ${errMsg}` }, { quoted: m });
        }
    }
};