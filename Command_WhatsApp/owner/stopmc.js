const { exec } = require('child_process');

module.exports = {
    name: 'stopmc',
    execute: async (hydro, m, args, text, { isOwner }) => {
        if (!isOwner) return hydro.sendMessage(m.chat, { text: "Eits, cuma Shapak yang boleh matiin server!" }, { quoted: m });

        exec('screen -list | grep mcserver', (err, stdout) => {
            if (!stdout) return hydro.sendMessage(m.chat, { text: 'Server MC emang lagi mati kok.' }, { quoted: m });

            exec("screen -S mcserver -p 0 -X eval 'stuff \"stop\"\\015'", (error) => {
                if (error) return hydro.sendMessage(m.chat, { text: `Gagal mematikan: ${error.message}` }, { quoted: m });
                hydro.sendMessage(m.chat, { text: 'Perintah stop terkirim, server MC sedang dimatikan dengan aman! 🛑' }, { quoted: m });
            });
        });
    }
};