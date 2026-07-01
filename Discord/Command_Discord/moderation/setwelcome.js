const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'setwelcome',
    category: 'moderation',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('❌ Butuh permission **Manage Server** untuk pakai fitur ini!');
        }

        const channelMention = message.mentions.channels.first();
        if (!channelMention) {
            return message.reply(`**Cara Pakai Set Welcome:**\n\`.setwelcome <#channel> <Pesan Welcome>\`\n\n**Tag Spesial yang bisa dipakai:**\n\`{user}\` = Tag member yang baru masuk\n\`{server}\` = Nama server Discord ini\n\`{memberCount}\` = Jumlah member sekarang\n\n**Contoh:**\n\`.setwelcome #welcome Halo {user}! Selamat datang di {server}, sekarang kita punya {memberCount} member!\``);
        }

        const textArgs = args.slice(1).join(' ');
        if (!textArgs) {
            return message.reply('❌ Harap masukkan pesan welcome-nya!');
        }

        if (!global.db.discord) global.db.discord = {};
        if (!global.db.discord[message.guild.id]) global.db.discord[message.guild.id] = {};

        global.db.discord[message.guild.id].welcome = {
            channel: channelMention.id,
            message: textArgs
        };

        // Simpan ke database JSON
        fs.writeFileSync(path.join(__dirname, '../../../Data/database.json'), JSON.stringify(global.db, null, 2));

        message.reply(`✅ **Berhasil set Welcome Message!**\n\n📍 **Channel:** <#${channelMention.id}>\n💬 **Pesan:**\n${textArgs.replace(/{user}/g, `<@${message.author.id}>`).replace(/{server}/g, message.guild.name).replace(/{memberCount}/g, message.guild.memberCount)}`);
    }
};
