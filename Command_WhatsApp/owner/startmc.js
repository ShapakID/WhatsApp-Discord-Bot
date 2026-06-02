// File: Command_WhatsApp/owner/startmc.js
const { exec } = require('child_process');

module.exports = {
    name: 'startmc',
    execute: async (hydro, m, args, text, { isOwner }) => {
        if (!isOwner) return hydro.sendMessage(m.chat, { text: "Cuma Shapak yang bisa nyalain server!" }, { quoted: m });

        exec('screen -list | grep mcserver', (err, stdout) => {
            if (stdout) return hydro.sendMessage(m.chat, { text: 'Server MC udah menyala, Shapak!' }, { quoted: m });

            exec('screen -dmS mcserver bash -c "cd /mnt/sandisk/mc && ./start.sh"', (error) => {
                if (error) return hydro.sendMessage(m.chat, { text: `Gagal menyalakan: ${error.message}` }, { quoted: m });
                hydro.sendMessage(m.chat, { text: 'Server Minecraft berhasil dinyalakan di background! 🚀' }, { quoted: m });
            });
        });
    }
};