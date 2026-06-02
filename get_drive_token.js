const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'token.json';

// Baca file credentials
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('❌ Error loading client secret file:', err);
    authorize(JSON.parse(content), getAccessToken);
});

function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0] || 'urn:ietf:wg:oauth:2.0:oob'
    );
    callback(oAuth2Client);
}

function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });
    
    console.log('\n======================================');
    console.log('AUTHORIZATION GOOGLE DRIVE DIBUTUHKAN');
    console.log('======================================');
    console.log('Authorize app ini dengan mengunjungi URL ini di browser:\n');
    console.log(authUrl);
    console.log('\n======================================\n');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    rl.question('Masukkan kode (authorization code) dari halaman tersebut ke sini: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('❌ Error mengambil access token', err);
            
            // Simpan token ke file
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('✅ Sukses! Token berhasil disimpan di', TOKEN_PATH);
                console.log('Silakan coba kembali fitur upload Google Drive di bot kamu.');
            });
        });
    });
}
