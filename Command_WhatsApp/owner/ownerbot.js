module.exports = {
    name: 'addowner',
    execute: async (hydro, m, args, text, { isOwner, command }) => {
        if (!isOwner) return hydro.sendMessage(m.chat, { text: "Khusus Owner!" });
        let t = m.message.extendedTextMessage?.contextInfo?.participant || m.mentionedJid?.[0] || args[0] + '@s.whatsapp.net';
        if (!t || t === '@s.whatsapp.net') return hydro.sendMessage(m.chat, { text: "Reply atau tag orangnya!" });
        
        if (command === 'addowner') {
            if (!global.owner) global.owner = [];
            if (!global.owner.includes(t)) global.owner.push(t);
            hydro.sendMessage(m.chat, { text: `  Berhasil menambahkan @${t.split('@')[0]} sebagai Owner Bot sementara.`, mentions: [t] });
        } else if (command === 'removeowner') {
            if (global.owner) global.owner = global.owner.filter(v => v !== t);
            hydro.sendMessage(m.chat, { text: `  Berhasil menghapus Owner sementara.`, mentions: [t] });
        }
    }
};