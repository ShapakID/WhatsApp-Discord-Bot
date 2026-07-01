module.exports = {
    name: 'lockgc',
    execute: async (hydro, m, args, text, { isGroupAdmins, isOwner }) => {
        if (!m.isGroup) return hydro.sendMessage(m.chat, { text: "Command ini khusus di dalam grup!" }, { quoted: m });
        if (!isGroupAdmins && !isOwner) return hydro.sendMessage(m.chat, { text: "Command ini khusus Admin Grup!" }, { quoted: m });

        await hydro.groupSettingUpdate(m.chat, 'announcement');
        hydro.sendMessage(m.chat, { text: "  Grup telah ditutup. Sekarang hanya Admin yang dapat mengirim pesan." }, { quoted: m });
    }
};