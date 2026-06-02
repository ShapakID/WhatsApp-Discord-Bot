const { generateWAMessageFromContent, proto } = require('socketon');

module.exports = {
    name: 'buattugas',
    category: 'admin',
    desc: 'Membuat folder tugas baru di Google Drive',
    async execute(hydro, m, args, text, { prefix, isAdminBot }) {
        // 1. Cek izin Admin Bot
        if (!isAdminBot) return m.reply(global.mess.only.admin);

        // 2. Ambil daftar MK dari database
        const listMK = global.db.mk_si_2025 || [];
        if (listMK.length === 0) return m.reply("Waduh Shapak, daftar Mata Kuliah masih kosong nih!");

        // 3. Susun baris menu untuk List (Mata Kuliah & Praktikum)
        let rows = [];
        listMK.forEach((mk, index) => {
            // Tambahkan MK Reguler
            rows.push({
                title: `MK: ${mk.singkatan}`,
                description: mk.nama,
                id: `${prefix}bt_mk_${index}` // ID harus bt_mk_ supaya dibaca hydro.js
            });
            
            // Tambahkan Praktikum jika ada folder ID-nya
            if (mk.praktikum && mk.praktikum.tugasPrakFolderId) {
                rows.push({
                    title: `Prak: ${mk.singkatan}`,
                    description: `Praktikum ${mk.nama}`,
                    id: `${prefix}bt_prak_${index}` // ID harus bt_prak_ supaya dibaca hydro.js
                });
            }
        });

        // 4. Buat Pesan Interaktif (List/Button)
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        body: { text: "Silakan pilih Mata Kuliah yang akan dibuatkan folder tugasnya:" },
                        footer: { text: "Sistem Manajemen Tugas SI-A 2025" },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({
                                        title: "PILIH MK",
                                        sections: [{ title: "Daftar Mata Kuliah", rows: rows }]
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        }, { quoted: m });

        // 5. Kirim pesan & aktifkan sesi
        await hydro.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        
        // Inisialisasi sesi di global
        global.buatTugasSessions[m.sender] = { 
            step: 'pilih_mk', 
            id: msg.key.id 
        };
    }
};