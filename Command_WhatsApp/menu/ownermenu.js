module.exports = {
    name: 'ownermenu',
    execute: async (hydro, m, args, text, { isOwner, prefix }) => {
        if (!isOwner) return hydro.sendMessage(m.chat, { text: "Command ini eksklusif khusus Owner bot." }, { quoted: m });
        let textOwn = `  [ *OWNER SYSTEM* ]  \n`;
        textOwn += `  *${prefix}listuser* - Lihat data mahasiswa register\n`;
        textOwn += `  *${prefix}setpp* - Ubah foto profil bot\n`;
        textOwn += `  *${prefix}setsticker* - Buat stiker wm Shapak\n`;
        textOwn += `  *${prefix}addadminbot* - Tambah Admin Bot\n`;
        textOwn += `  *${prefix}removeadminbot* - Hapus Admin Bot\n`;
        textOwn += `  *${prefix}addowner* - Tambah Owner\n`;
        textOwn += `  *${prefix}removeowner* - Hapus Owner\n`;
        textOwn += `  *${prefix}getjid* - Cek JID Target/Grup\n`;
        textOwn += `  *${prefix}ping* - Cek status jaringan & server\n`;
        hydro.sendMessage(m.chat, { text: textOwn }, { quoted: m });
    }
};