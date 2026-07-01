const { modul } = require('../../lib/module');
const { performance, os } = modul;

module.exports = {
    name: 'ping',
    execute: async (hydro, m, args, text, { isOwner }) => {
        if (!isOwner) return hydro.sendMessage(m.chat, { text: "Khusus Owner bot ya!" }, { quoted: m });

        const used = process.memoryUsage();
        let timestamp = performance.now();
        await hydro.sendMessage(m.chat, { text: '  Pinging server...' });
        let latensi = performance.now() - timestamp;

        hydro.sendMessage(m.chat, { text: `*Pong!*\nLatensi: ${latensi.toFixed(4)} ms\nRAM: ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB` });
    }
};