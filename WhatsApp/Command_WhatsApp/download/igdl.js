const { modul } = require('../../lib/module');
const { axios } = modul;

module.exports = {
    name: 'igdl', 
    execute: async (hydro, m, args, text, { prefix }) => {
        const url = args.find(v => v && v.startsWith('http'));
        if (!url) return hydro.sendMessage(m.chat, { text: `Kirim linknya!` }, { quoted: m });
        
        hydro.sendMessage(m.chat, { text: `_Mengunduh media Instagram..._` }, { quoted: m });

        try {
            // 1. Ambil link CDN dari Botcahx (Pakai encodeURIComponent biar rapi)
            let apiUrl = `https://api.botcahx.eu.org/api/dowloader/igdowloader?url=${encodeURIComponent(url)}&apikey=${global.btc}`;
            
            let res = await axios.get(apiUrl, { 
                headers: { 'User-Agent': 'Mozilla/5.0' },
                validateStatus: () => true // Anti-crash biar kelihatan kalau API yang error
            });
            
            if (res.status !== 200) {
                // Kalau errornya dari Botcahx, bakal muncul teks "Botcahx Error"
                throw new Error(`Botcahx Error: ${JSON.stringify(res.data)}`);
            }

            let result = res.data.result;
            if (!result) throw new Error("Media tidak ditemukan di Botcahx.");
            
            let mediaUrls = Array.isArray(result) ? result : [result];

            // 2. Download dari CDN dengan mode penyamaran browser penuh
            for (let item of mediaUrls) {
                let link = item.url || item;
                if (!link) continue;
                
                try {
                    let media = await axios.get(link, { 
                        responseType: 'arraybuffer',
                        headers: { 
                            // Ini kunci utamanya biar nggak diblokir CDN
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Referer': 'https://www.instagram.com/'
                        }
                    });
                    
                    let isVideo = media.headers['content-type']?.includes('video');
                    
                    if (isVideo) {
                        await hydro.sendMessage(m.chat, { video: media.data, caption: `Done by ${global.botname}` }, { quoted: m });
                    } else {
                        await hydro.sendMessage(m.chat, { image: media.data, caption: `Done by ${global.botname}` }, { quoted: m });
                    }
                } catch (cdnError) {
                    // Kalau masih gagal, bakal ketahuan errornya dari CDN
                    throw new Error(`CDN Error: ${cdnError.message}`);
                }
            }
        } catch (err) {
            hydro.sendMessage(m.chat, { text: `Error: ${err.message}` }, { quoted: m });
        }
    }
};