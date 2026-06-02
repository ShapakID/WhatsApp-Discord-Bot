const { PermissionsBitField } = require('discord.js');
const ms = require('ms'); // kita bisa pakai human-readable (tapi krn blm tau ada modul ms atau engga, aku bikin parse manual ntar kalo ga ada)

module.exports = {
    name: 'mute',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Kamu nggak punya izin untuk nge-mute (timeout) member!');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('Harap tag user yang mau di-mute. Contoh: `.mute @user 10m alasan`');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('User tersebut tidak ada di server ini.');
        }

        if (!targetMember.moderatable) {
            return message.reply('❌ Nggak bisa nge-mute user ini. Mungkin role-nya lebih tinggi dari bot.');
        }

        const timeRaw = args[1];
        if (!timeRaw) {
            return message.reply('Harap tentukan durasinya! (contoh: 10m, 1h, 1d)');
        }

        // Parsing waktu sederhana manual jaga-jaga kalau module ms gak di-require bener
        let timeMs = 0;
        if (timeRaw.endsWith('s')) timeMs = parseInt(timeRaw) * 1000;
        else if (timeRaw.endsWith('m')) timeMs = parseInt(timeRaw) * 60 * 1000;
        else if (timeRaw.endsWith('h')) timeMs = parseInt(timeRaw) * 60 * 60 * 1000;
        else if (timeRaw.endsWith('d')) timeMs = parseInt(timeRaw) * 24 * 60 * 60 * 1000;
        else timeMs = parseInt(timeRaw) * 60 * 1000; // default menit

        if (isNaN(timeMs) || timeMs <= 0) {
            return message.reply('Durasi tidak valid! Gunakan format s (detik), m (menit), h (jam), d (hari).');
        }

        let reason = args.slice(2).join(' ');
        if (!reason) reason = 'Tidak ada alasan.';

        try {
            await targetMember.timeout(timeMs, reason);
            message.channel.send(`🔇 **${targetUser.tag}** berhasil di-mute selama ${timeRaw}.\nAlasan: ${reason}`);
        } catch (error) {
            console.error(error);
            message.reply('Terjadi kesalahan saat mencoba nge-mute user ini.');
        }
    }
};
