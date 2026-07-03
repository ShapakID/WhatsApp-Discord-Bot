const fs = require('fs');
let google;
try {
    google = require('googleapis').google;
} catch (e) { }

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

module.exports = {
    name: 'authdrive',
    async execute(message, args) {
        const isOwner = message.author.id === '1202397666835701830';
        if (!isOwner) return; // silent

        if (!google) return message.reply("Fitur ini dinonaktifkan karena modul googleapis tidak tersedia (hemat storage).");

        if (!fs.existsSync(CREDENTIALS_PATH)) {
            return message.reply("❌ File credentials.json tidak ditemukan! Gagal melakukan autentikasi.");
        }

        const credsRaw = fs.readFileSync(CREDENTIALS_PATH);
        const credentials = JSON.parse(credsRaw);
        const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

        const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0] || 'urn:ietf:wg:oauth:2.0:oob'
        );

        if (args.length === 0) {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
                prompt: 'consent'
            });

            const replyText = `⚠️ **OTORISASI GOOGLE DRIVE DIPERLUKAN**\n\nSepertinya sesi Google Drive bot sudah kadaluarsa (error invalid_grant).\n\n**Langkah-langkah:**\n1. Buka link di bawah ini menggunakan browser kamu.\n2. Login ke Akun Google kamu dan berikan izin.\n3. Copy kode unik (authorization code) yang muncul.\n4. Kirim kembali kode tersebut ke bot dengan format:\n\`.authdrive [KODE]\`\n\n**Link Otorisasi:**\n${authUrl}`;

            return message.reply(replyText);
        }

        const code = args[0];
        const sent = await message.reply("Memproses kode akses...");

        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                console.error('Error mengambil access token', err);
                return sent.edit(`❌ Gagal memproses kode: ${err.message}\nPastikan kodenya benar dan belum pernah dipakai.`);
            }

            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) {
                    console.error(err);
                    return sent.edit(`❌ Gagal menyimpan token: ${err.message}`);
                }

                sent.edit(`✅ **SUKSES!** Token Google Drive berhasil diperbarui dan disimpan.\n\nSekarang kamu bisa menggunakan fitur \`.backupdb\` dan pengumpulan tugas kembali.`);
            });
        });
    }
};
