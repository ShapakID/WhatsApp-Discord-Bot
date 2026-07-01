module.exports = {
    name: 'getjid',
    execute: async (hydro, m, args, text, { isOwner }) => {
        let qMsg = m.message.extendedTextMessage?.contextInfo?.participant;
        let targetJid = qMsg ? qMsg : m.chat;
        hydro.sendMessage(m.chat, { text: `🎯 JID Chat Ini: *${targetJid}*\n👤 JID Kamu (Sender): *${m.sender}*` }, { quoted: m });
    }
};