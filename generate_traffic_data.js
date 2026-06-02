const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'traffic_log.csv');

// Bikin header kalau belum ada
if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, "timestamp,datetime,platform,sender_id,chat_type\n");
}

let content = "";
const now = new Date();
const days = 30; // 30 hari kebelakang
let baseTraffic = 50; // Mulai dari ~50 pesan/hari

for (let i = days; i >= 0; i--) {
    let currentDay = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // Bikin traffic naik turun dikit (ada noise) tapi trendnya naik
    let trafficToday = Math.floor(baseTraffic + (days - i) * 2.5 + (Math.random() * 20 - 10));
    if (trafficToday < 10) trafficToday = 10;

    for (let j = 0; j < trafficToday; j++) {
        // Acak waktu dalam hari tersebut
        const randomHour = Math.floor(Math.random() * 24);
        const randomMin = Math.floor(Math.random() * 60);
        const randomSec = Math.floor(Math.random() * 60);

        currentDay.setHours(randomHour, randomMin, randomSec);

        const timestamp = currentDay.getTime();
        const datetime = currentDay.toISOString().replace('T', ' ').split('.')[0];

        // Acak platform dan chat type
        const platform = Math.random() > 0.8 ? 'Discord' : 'WhatsApp';
        const chatType = Math.random() > 0.5 ? 'Grup' : 'Pribadi';
        const senderId = `628${Math.floor(Math.random() * 1000000000)}`;

        content += `${timestamp},${datetime},${platform},${senderId},${chatType}\n`;
    }
}

fs.appendFileSync(logFile, content);
console.log("Berhasil men-generate data sampel trafik riil selama 30 hari!");
