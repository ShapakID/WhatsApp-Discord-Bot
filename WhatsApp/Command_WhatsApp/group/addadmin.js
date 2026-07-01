module.exports = {
    name: 'addadmin',
    execute: async (hydro, m, args, text, { isGroupAdmins, isOwner }) => {
        if (!m.isGroup) return hydro.sendMessage(m.chat, { text: "Command ini khusus di dalam grup!" }, { quoted: m });
        if (!isGroupAdmins && !isOwner) return hydro.sendMessage(m.chat, { text: "Command ini khusus Admin Grup!" }, { quoted: m });
        let targetMember = m.message.extendedTextMessage?.contextInfo?.participant || m.mentionedJid?.[0];
        if (!targetMember) return hydro.sendMessage(m.chat, { text: "Silakan balas pesan (reply) atau tag orang yang mau dijadikan admin!" }, { quoted: m });
        await hydro.groupParticipantsUpdate(m.chat, [targetMember], "promote");
        hydro.sendMessage(m.chat, { text: `  Berhasil menaikkan jabatan @${targetMember.split('@')[0]} menjadi Admin.`, mentions: [targetMember] }, { quoted: m });
    }
};