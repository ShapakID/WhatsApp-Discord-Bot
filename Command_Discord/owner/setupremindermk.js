const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');

async function checkAndSend(client, channelId, targetMoment, isImmediate = false) {
    const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const namaHari = daysMap[targetMoment.day()];
    const dateStr = targetMoment.format('YYYY-MM-DD');

    // 1. Cek Libur Nasional
    let isLiburNasional = false;
    let namaLibur = '';
    try {
        const res = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${targetMoment.year()}/ID`);
        const holiday = res.data.find(h => h.date === dateStr);
        if (holiday) {
            isLiburNasional = true;
            namaLibur = holiday.localName || holiday.name;
        }
    } catch (e) {
        console.error('Gagal cek libur nasional:', e.message);
    }

    // 2. Cek Libur Kampus
    let isLiburKampus = false;
    if (global.db.libur_kampus && global.db.libur_kampus.includes(dateStr)) {
        isLiburKampus = true;
        namaLibur = 'Libur Kampus (Kustom)';
    }

    const channel = client.channels.cache.get(channelId);
    if (!channel) return;

    const labelWaktu = isImmediate ? 'Besok' : 'Hari ini';

    if (isLiburNasional || isLiburKampus) {
        const embedLibur = new EmbedBuilder()
            .setColor('#ffaa00')
            .setTitle(`🏖️ PENGUMUMAN: ${labelWaktu} Libur!`)
            .setDescription(`${labelWaktu} tanggal **${dateStr}** adalah **${namaLibur}**.\nJadwal kuliah dan praktikum ditiadakan/tidak diingatkan.`);

        channel.send({ embeds: [embedLibur] }).catch(() => { });
        return;
    }

    // 3. Cari jadwal
    const mkData = global.db.mk_si_2025 || [];
    let adaJadwal = false;
    let listTeks = ``;

    mkData.forEach(mk => {
        if (mk.hari && mk.hari.toLowerCase() === namaHari.toLowerCase()) {
            adaJadwal = true;
            listTeks += `◦ [${mk.jam}] **${mk.singkatan}**\n  ${mk.nama}\n  📍 ${mk.ruangan} | 👨‍🏫 ${mk.dosen}\n\n`;
        }
        if (mk.praktikum && mk.praktikum.hari && mk.praktikum.hari !== '-' && mk.praktikum.hari.toLowerCase() === namaHari.toLowerCase()) {
            adaJadwal = true;
            listTeks += `◦ [${mk.praktikum.jam}] **Praktikum ${mk.singkatan}**\n  📍 ${mk.praktikum.ruangan}\n\n`;
        }
    });

    if (adaJadwal) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`📚 Pengingat Jadwal Kuliah ${labelWaktu}!`)
            .setDescription(`Jadwal untuk ${labelWaktu.toLowerCase()} hari **${namaHari}**, ${dateStr}:\n\n${listTeks}`)
            .setFooter({ text: 'Bot Pengingat Jadwal | Semangat Kuliahnya!' });

        channel.send({ content: '<@1202397666835701830>', embeds: [embed] }).catch(() => { });
    } else if (isImmediate) {
        // Kalau immediate dan kebetulan gak ada jadwal (hari libur/kosong)
        channel.send(`ℹ️ **Info:** ${labelWaktu} hari **${namaHari}** (${dateStr}) tidak ada jadwal kelas/praktikum sama sekali. Selamat bersantai!`).catch(() => { });
    }
}

module.exports = {
    name: 'setupremindermk',
    aliases: ['setremindermk', 'setreminder'],
    category: 'owner',
    description: 'Set channel untuk pengingat jadwal MK besok',
    async execute(message, args) {
        if (message.author.id !== '1202397666835701830') return message.reply('Khusus owner bot!');

        if (!global.db) global.db = {};
        if (!global.db.reminder_mk_channels) {
            global.db.reminder_mk_channels = [];
            // Migrasi dari single channel sebelumnya
            if (global.db.reminder_mk_channel) {
                global.db.reminder_mk_channels.push(global.db.reminder_mk_channel);
                delete global.db.reminder_mk_channel;
            }
        }

        const action = args[0] ? args[0].toLowerCase() : '';
        const channel = message.mentions.channels.first();

        if (action === 'add' || action === 'tambah') {
            if (!channel) return message.reply('❌ Tag channel yang mau ditambah! Contoh: `.setupremindermk add #general`');
            if (global.db.reminder_mk_channels.includes(channel.id)) return message.reply('ℹ️ Channel ini sudah ada di daftar pengingat.');

            global.db.reminder_mk_channels.push(channel.id);
            try {
                fs.writeFileSync(path.join(__dirname, '../../database/database.json'), JSON.stringify(global.db, null, 2));
            } catch (e) { console.error(e); }

            await message.reply(`✅ Channel <#${channel.id}> berhasil ditambahkan ke daftar pengingat jadwal MK.\nBot akan mengecek jadwal secara otomatis setiap jam **06:00 WITA** untuk hari tersebut.\n\n⏳ Mengecek jadwal untuk **BESOK**...`);

            // Langsung kasih tau jadwal besok
            const besok = moment().tz('Asia/Makassar').add(1, 'days');
            checkAndSend(message.client, channel.id, besok, true);
            return;
        }
        else if (action === 'remove' || action === 'hapus') {
            if (!channel) return message.reply('❌ Tag channel yang mau dihapus! Contoh: `.setupremindermk remove #general`');
            if (!global.db.reminder_mk_channels.includes(channel.id)) return message.reply('ℹ️ Channel ini tidak ada di daftar pengingat.');

            global.db.reminder_mk_channels = global.db.reminder_mk_channels.filter(id => id !== channel.id);
            try {
                fs.writeFileSync(path.join(__dirname, '../../database/database.json'), JSON.stringify(global.db, null, 2));
            } catch (e) { console.error(e); }
            return message.reply(`✅ Channel <#${channel.id}> berhasil dihapus dari daftar pengingat jadwal MK.`);
        }
        else {
            const list = global.db.reminder_mk_channels.map(id => `◦ <#${id}>`).join('\n') || 'Belum ada channel.';
            return message.reply(`**Cara Penggunaan:**\n\`.setupremindermk add #channel\`\n\`.setupremindermk remove #channel\`\n\n**Daftar Channel Pengingat Saat Ini:**\n${list}`);
        }
    },

    init: function (client) {
        if (global.mkReminderInterval) {
            clearInterval(global.mkReminderInterval);
        }

        global.mkReminderInterval = setInterval(async () => {
            if (!global.db || !global.db.reminder_mk_channels || global.db.reminder_mk_channels.length === 0) return;

            const now = moment().tz('Asia/Makassar');
            const todayStr = now.format('YYYY-MM-DD');

            // Cek di jam 06:00 - 06:05 WITA
            if (now.hour() === 6 && now.minute() >= 0 && now.minute() <= 5) {
                if (global.lastReminderSent === todayStr) return; // Sudah ngirim hari ini

                // Set flag supaya gak dobel ngirim
                global.lastReminderSent = todayStr;

                const targetMoment = moment().tz('Asia/Makassar'); // HARI INI

                for (const channelId of global.db.reminder_mk_channels) {
                    checkAndSend(client, channelId, targetMoment, false);
                }
            }
        }, 60 * 1000); // Tiap 1 menit ngecek waktu
    }
};
