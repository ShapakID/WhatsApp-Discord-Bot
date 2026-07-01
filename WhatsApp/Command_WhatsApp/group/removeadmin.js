module.exports = {
    name: 'removeadmin',
    execute: async (hydro, m, args, text, { isGroupAdmins, isOwner }) => {
        if (!m.isGroup) return hydro.sendMessage(m.chat, { text: "Command ini khusus di dalam grup!" }, { quoted: m });
        if (!isGroupAdmins && !isOwner) return hydro.sendMessage(m.chat, { text: "Command ini khusus Admin Grup!" }, { quoted: m });
        let targetMember = m.message.extendedTextMessage?.contextInfo?.participant || m.mentionedJid?.[0];
        if (!targetMember) return hydro.sendMessage(m.chat, { text: "Silakan balas pesan (reply) atau tag orang yang mau dicabut hak adminnya!" }, { quoted: m });
        await hydro.groupParticipantsUpdate(m.chat, [targetMember], "demote");
        hydro.sendMessage(m.chat, { text: `  Berhasil menurunkan jabatan @${targetMember.split('@')[0]} dari Admin.`, mentions: [targetMember] }, { quoted: m });
    }
};