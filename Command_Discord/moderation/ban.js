const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'ban',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ Kamu nggak punya izin untuk nge-ban member!');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('Harap tag user yang mau di-ban. Contoh: `.ban @user alasan`');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (targetMember && !targetMember.bannable) {
            return message.reply('❌ Nggak bisa nge-ban user ini. Mungkin role-nya lebih tinggi dari bot atau bot kekurangan izin.');
        }

        let reason = args.slice(1).join(' ');
        if (!reason) reason = 'Tidak ada alasan.';

        try {
            await message.guild.members.ban(targetUser.id, { reason: reason });
            message.channel.send(`🔨 Berhasil nge-ban **${targetUser.tag}**.\nAlasan: ${reason}`);
        } catch (error) {
            console.error(error);
            message.reply('Terjadi kesalahan saat mencoba nge-ban user ini.');
        }
    }
};
