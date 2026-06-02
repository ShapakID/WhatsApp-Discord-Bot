module.exports = {
    name: 'addadminbot',
    execute: async (hydro, m, args, text, { isOwner, command }) => {
        if (!isOwner) return hydro.sendMessage(m.chat, { text: "Khusus Owner!" });
        let t = m.message.extendedTextMessage?.contextInfo?.participant || m.mentionedJid?.[0] || args[0] + '@s.whatsapp.net';
        if (!t || t === '@s.whatsapp.net') return hydro.sendMessage(m.chat, { text: "Reply atau tag orangnya!" });
        
        if (command === 'addadminbot') {
            if (!global.adminbot.includes(t)) global.adminbot.push(t);
            hydro.sendMessage(m.chat, { text: `  Berhasil menambahkan @${t.split('@')[0]} sebagai Admin Bot.`, mentions: [t] });
        } else if (command === 'removeadminbot') {
            global.adminbot = global.adminbot.filter(v => v !== t);
            hydro.sendMessage(m.chat, { text: `  Berhasil menghapus @${t.split('@')[0]} dari daftar Admin Bot.`, mentions: [t] });
        }
    }
};