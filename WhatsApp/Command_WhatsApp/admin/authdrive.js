const fs = require('fs');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

module.exports = {
    name: 'authdrive',
    execute: async (hydro, m, args, text, { isAdminBot, prefix }) => {
        if (!isAdminBot) {
            return hydro.sendMessage(m.chat, { text: "❌ Maaf, command ini khusus Admin Bot!" }, { quoted: m });
        }

        if (!fs.existsSync(CREDENTIALS_PATH)) {
            return hydro.sendMessage(m.chat, { text: "❌ File credentials.json tidak ditemukan! Gagal melakukan autentikasi." }, { quoted: m });
        }

        const credsRaw = fs.readFileSync(CREDENTIALS_PATH);
        const credentials = JSON.parse(credsRaw);
        const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

        const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0] || 'urn:ietf:wg:oauth:2.0:oob'
        );

        // Jika tidak ada argumen kode, kirimkan URL Auth
        if (args.length === 0) {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
                prompt: 'consent'
            });

            const replyText = `⚠️ *OTORISASI GOOGLE DRIVE DIPERLUKAN*\n\nSepertinya sesi Google Drive bot sudah kadaluarsa (error invalid_grant).\n\n*Langkah-langkah:*\n1. Buka link di bawah ini menggunakan browser kamu.\n2. Login ke Akun Google kamu dan berikan izin.\n3. Copy kode unik (authorization code) yang muncul.\n4. Kirim kembali kode tersebut ke bot dengan format:\n*${prefix}authdrive [KODE]*\n\n*Link Otorisasi:*\n${authUrl}`;

            return hydro.sendMessage(m.chat, { text: replyText }, { quoted: m });
        }

        // Jika ada argumen, proses sebagai kode auth
        const code = args[0];
        hydro.sendMessage(m.chat, { text: "Memproses kode akses..." }, { quoted: m });

        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                console.error('Error mengambil access token', err);
                return hydro.sendMessage(m.chat, { text: `❌ Gagal memproses kode: ${err.message}\nPastikan kodenya benar dan belum pernah dipakai.` }, { quoted: m });
            }

            // Simpan token ke file
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) {
                    console.error(err);
                    return hydro.sendMessage(m.chat, { text: `❌ Gagal menyimpan token: ${err.message}` }, { quoted: m });
                }

                hydro.sendMessage(m.chat, { text: `✅ *SUKSES!* Token Google Drive berhasil diperbarui dan disimpan.\n\nSekarang kamu bisa menggunakan fitur *${prefix}backupdb* dan pengumpulan tugas kembali.` }, { quoted: m });
            });
        });
    }
};
