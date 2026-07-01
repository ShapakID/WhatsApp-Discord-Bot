module.exports = {
    name: 'getjid',
    execute: async (hydro, m, args, text, { isOwner }) => {
        if (!isOwner) return hydro.sendMessage(m.chat, { text: "Khusus Owner bot ya!" }, { quoted: m });

        let qMsg = m.message.extendedTextMessage?.contextInfo?.participant;
        let targetJid = qMsg ? qMsg : m.chat;
        hydro.sendMessage(m.chat, { text: `ID (JID) target:\n*${targetJid}*` }, { quoted: m });
    }
};