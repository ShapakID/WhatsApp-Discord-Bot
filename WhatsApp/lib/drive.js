const { google } = require('googleapis');
const stream = require('stream');
const fs = require('fs');

const KEYFILEPATH = './credentials.json';
const TOKENPATH = './token.json';

function getDrive() {
    try {
        const credsRaw = fs.readFileSync(KEYFILEPATH);
        const creds = JSON.parse(credsRaw);
        const { client_secret, client_id, redirect_uris } = creds.installed || creds.web;

        const authClient = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0] || 'urn:ietf:wg:oauth:2.0:oob'
        );

        const tokenRaw = fs.readFileSync(TOKENPATH);
        const token = JSON.parse(tokenRaw);
        authClient.setCredentials(token);

        return google.drive({ version: 'v3', auth: authClient });
    } catch (err) {
        console.error("❌ Gagal membuat instance Google Drive:", err.message);
        throw err;
    }
}

/**
 * Upload file ke Google Drive dari Buffer
 */
async function uploadToDrive(bufferData, fileName, mimeType, folderId = null) {
    try {
        const drive = getDrive();
        const bufferStream = new stream.PassThrough();
        bufferStream.end(bufferData);
        const fileMetadata = { name: fileName };
        if (folderId) fileMetadata.parents = [folderId];

        const media = { mimeType: mimeType, body: bufferStream };
        const file = await drive.files.create({ resource: fileMetadata, media: media, fields: 'id' });
        await drive.permissions.create({ fileId: file.data.id, requestBody: { role: 'reader', type: 'anyone' } });
        const result = await drive.files.get({ fileId: file.data.id, fields: 'webViewLink' });

        return result.data.webViewLink;
    } catch (error) { throw error; }
}

/**
 * Bikin folder baru di Google Drive
 */
async function createFolder(folderName, parentId = null) {
    const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentId) fileMetadata.parents = [parentId];
    try {
        const drive = getDrive();
        const file = await drive.files.create({
            resource: fileMetadata,
            fields: 'id',
        });
        return file.data.id;
    } catch (error) { throw error; }
}

// Fungsi jeda anti-limit Google
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Bikin otomatis banyak folder (Auto-Folder)
 */
async function setupSemesterFolders(semesterStr, mkList, rootId) {
    try {
        let semId = await createFolder(`Semester ${semesterStr}`, rootId);
        await delay(1000); // Tahan nafas biar ga dilimit Google
        let materiId = await createFolder("Materi", semId);
        await delay(1000);
        let tugasId = await createFolder("Tugas", semId);

        for (let mk of mkList) {
            await delay(1000);
            await createFolder(mk.singkatan, materiId);
            await createFolder(mk.singkatan, tugasId);

            if (mk.praktikum && mk.praktikum.hari !== '-') {
                await delay(1000);
                await createFolder(`Praktikum ${mk.singkatan}`, materiId);
                await createFolder(`Praktikum ${mk.singkatan}`, tugasId);
            }
        }
        return { success: true, link: `https://drive.google.com/drive/folders/${semId}` };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = { uploadToDrive, createFolder, setupSemesterFolders };