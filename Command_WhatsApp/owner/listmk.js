module.exports = {
    name: 'listmk',
    execute: async (hydro, m, args, text, { isOwner }) => {
        if (!isOwner) return hydro.sendMessage(m.chat, { text: "Khusus Owner bot ya!" }, { quoted: m });
        if (global.db.mk_si_2025.length === 0) return hydro.sendMessage(m.chat, { text: "Belum ada daftar Mata Kuliah yang ditambahkan." }, { quoted: m });

        const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        let list = `📚 *JADWAL KULIAH SEMESTER*\n────────────────────\n\n`;

        let groupedMk = {};
        let groupedPrak = {};

        // Pisahkan data MK dan Praktikum berdasarkan hari
        global.db.mk_si_2025.forEach((mk, i) => {
            let day = mk.hari.charAt(0).toUpperCase() + mk.hari.slice(1).toLowerCase();
            if (!groupedMk[day]) groupedMk[day] = [];
            groupedMk[day].push({ ...mk, id: i });

            if (mk.praktikum && mk.praktikum.hari !== '-') {
                let prakDay = mk.praktikum.hari.charAt(0).toUpperCase() + mk.praktikum.hari.slice(1).toLowerCase();
                if (!groupedPrak[prakDay]) groupedPrak[prakDay] = [];
                groupedPrak[prakDay].push({ ...mk, id: i });
            }
        });

        // 1. Render Jadwal Teori (MK Atas)
        list += `📚 *MATA KULIAH (TEORI)*\n\n`;
        daysOrder.forEach(day => {
            if (groupedMk[day] && groupedMk[day].length > 0) {
                list += `📅 *HARI ${day.toUpperCase()}*\n`;
                groupedMk[day].forEach(mk => {
                    list += `◦ [${mk.jam}] *ID: ${mk.id + 1}* - *${mk.singkatan}*\n  ${mk.nama}\n  📍 ${mk.ruangan} | 👨‍🏫 ${mk.dosen}\n\n`;
                });
            }
        });

        // 2. Render Jadwal Praktikum (Bawah)
        if (Object.keys(groupedPrak).length > 0) {
            list += `────────────────────\n\n🧪 *JADWAL PRAKTIKUM*\n\n`;
            daysOrder.forEach(day => {
                if (groupedPrak[day] && groupedPrak[day].length > 0) {
                    list += `📅 *HARI ${day.toUpperCase()}*\n`;
                    groupedPrak[day].forEach(mk => {
                        list += `◦ [${mk.praktikum.jam}] *ID: ${mk.id + 1}* - *${mk.singkatan}*\n  Praktikum ${mk.nama}\n  📍 ${mk.praktikum.ruangan}\n\n`;
                    });
                }
            });
        }

        list += `────────────────────`;
        hydro.sendMessage(m.chat, { text: list.trim() }, { quoted: m });
    }
};