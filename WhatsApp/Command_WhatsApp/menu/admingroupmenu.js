module.exports = {
    name: 'admingroupmenu',
    execute: async (hydro, m, args, text, { isGroupAdmins, isOwner, prefix }) => {
        if (!m.isGroup) return hydro.sendMessage(m.chat, { text: "Command ini khusus di dalam grup!" }, { quoted: m });
        if (!isGroupAdmins && !isOwner) return hydro.sendMessage(m.chat, { text: "Command ini khusus Admin Grup!" }, { quoted: m });
        let helpText = `  [ *ADMIN GROUP* ]  \n`;
        helpText += `  *${prefix}lockgc* - Menutup grup (Hanya admin yg bisa chat)\n`;
        helpText += `  *${prefix}unlockgc* - Membuka grup (Semua bisa chat)\n`;
        helpText += `  *${prefix}addadmin* - Jadikan member admin\n`;
        helpText += `  *${prefix}removeadmin* - Cabut admin member\n\n`;
        hydro.sendMessage(m.chat, { text: helpText }, { quoted: m });
    }
};