const fs = require('fs');
const path = require('path');

function logTraffic(platform, senderId, chatType) {
    // File csv akan otomatis dibuat di folder utama
    const logFile = path.join(__dirname, '../traffic_log.csv');
    const now = new Date();

    // Waktu dalam timestamp (milidetik) biar presisi
    const timestamp = now.getTime();

    // Gunakan moment-timezone agar reset hari sesuai jam WITA (UTC+8)
    const moment = require('moment-timezone');
    const datetime = moment(now).tz('Asia/Makassar').format('YYYY-MM-DD HH:mm:ss');

    // Bikin header kolom kalau file csv-nya belum ada
    if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, "timestamp,datetime,platform,sender_id,chat_type\n");
    }

    // Tulis log ke baris baru
    const csvLine = `${timestamp},${datetime},${platform},${senderId},${chatType}\n`;
    fs.appendFileSync(logFile, csvLine);
}

module.exports = { logTraffic };