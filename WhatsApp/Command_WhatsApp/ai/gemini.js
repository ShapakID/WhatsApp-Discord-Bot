
// MASUKKAN API KEY GEMINI KAMU YANG BARU DI SINI (Atau ambil dari settings.js)
const GEMINI_API_KEY = global.geminiApiKey || ""; 

module.exports = {
    name: 'gemini',
    execute: async (hydro, m, args, text, { prefix, command }) => {
        try {
            // Ambil pesan yang di-quote (di-reply) atau pesan aslinya
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message;
            
            // Cek apakah ada gambar
            const isImage = !!(quoted.imageMessage);

            // Validasi Input: Harus ada teks ATAU gambar
            if (!text && !isImage) {
                return hydro.sendMessage(m.chat, { 
                    text: `Halo kak! Teksnya mana?\nContoh: *${prefix}${command} siapa presiden indonesia?*\n\n_Bisa juga kirim/reply gambar dengan caption ${prefix}${command}_` 
                }, { quoted: m });
            }

            // Kirim pesan tunggu
            await hydro.sendMessage(m.chat, { text: global.mess?.wait || "*_Tunggu sebentar ya kak ^~^*" }, { quoted: m });

            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

            // ==========================================
            //  SIAPKAN DATA GAMBAR JIKA ADA
            // ==========================================
            let imageParts =[];
            let prompt = text;

            if (isImage) {
                const imageBuffer = await hydro.downloadMediaMessage(quoted.imageMessage);
                const mimeType = quoted.imageMessage.mimetype;
                
                // Prompt default jika hanya mengirim gambar tanpa teks
                prompt = text || "Tolong jelaskan gambar ini secara detail.";

                imageParts =[{
                    inlineData: {
                        data: imageBuffer.toString("base64"),
                        mimeType: mimeType
                    }
                }];
            }

            // ==========================================
            //  SISTEM AUTO-FALLBACK MODEL
            // ==========================================
            const modelsToTry =[
                "gemini-2.0-flash",
                "gemini-1.5-flash-latest",
                "gemini-flash",
                "gemini-1.5-flash",
                "gemini-1.5-pro-latest"
            ];

            let responseText = "";
            let success = false;
            let lastError = null;

            for (const modelName of modelsToTry) {
                try {
                    const model = genAI.getGenerativeModel({ model: modelName });
                    
                    if (isImage) {
                        const result = await model.generateContent([prompt, ...imageParts]);
                        responseText = result.response.text();
                    } else {
                        const result = await model.generateContent(text);
                        responseText = result.response.text();
                    }
                    
                    success = true;
                    break; 
                } catch (err) {
                    lastError = err;
                    if (err.status === 404 || (err.message && err.message.includes("not found"))) {
                        continue; // Coba model selanjutnya
                    } else {
                        throw err; // Lempar error limit / invalid key ke CATCH
                    }
                }
            }

            if (!success) {
                throw lastError || new Error("Semua model Gemini gagal diakses.");
            }

            // Kirim balasan hasil dari AI ke grup/PC
            await hydro.sendMessage(m.chat, { text: responseText }, { quoted: m });

        } catch (error) {
            console.error("[ GEMINI ERROR ]", error);
            
            let errorMsg = global.mess?.error?.fitur || "Waduh! AI-nya lagi pusing kak. Coba lagi nanti ya 🙏";
            
            // Tangkap tipe-tipe error khusus
            if (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID")) {
                errorMsg = "❌ API Key Gemini tidak valid! Owner harus mengecek file gemini.js.";
            } else if (error.message.includes("not found")) {
                errorMsg = "❌ Model AI tidak ditemukan di region atau API Key kamu.";
            } else if (error.status === 429 || error.message.includes("429") || error.message.includes("quota")) {
                errorMsg = "⏳ Waduh, limit penggunaan AI Google sedang habis/penuh (Terlalu banyak permintaan). Tunggu sekitar 1 menit dan coba lagi ya kak!";
            }

            await hydro.sendMessage(m.chat, { text: errorMsg }, { quoted: m });
        }
    }
};