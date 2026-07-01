module.exports = {
    name: 'listuser',
    execute: async (hydro, m, args, text, { isOwner }) => {
        if (!isOwner) return hydro.sendMessage(m.chat, { text: "Khusus Owner bot ya!" }, { quoted: m });
        let users = Object.values(global.db.users);
        if (users.length === 0) return hydro.sendMessage(m.chat, { text: "Belum ada user yang register." }, { quoted: m });

        let teks = `  *DAFTAR MAHASISWA TERDAFTAR*\nTotal: *${users.length}* Mahasiswa\n\n`;
        users.forEach((u, i) => {
            teks += `${i + 1}. *${u.namaLengkap}* (${u.nama})\n     NIM: ${u.nim}\n     WA: ${u.nomor}\n\n`;
        });
        hydro.sendMessage(m.chat, { text: teks.trim() }, { quoted: m });
    }
};