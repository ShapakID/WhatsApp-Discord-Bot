const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'setgoodbye',
    category: 'moderation',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('❌ Butuh permission **Manage Server** untuk pakai fitur ini!');
        }

        const channelMention = message.mentions.channels.first();
        if (!channelMention) {
            return message.reply(`**Cara Pakai Set Goodbye:**\n\`.setgoodbye <#channel> <Pesan Goodbye>\`\n\n**Tag Spesial yang bisa dipakai:**\n\`{user}\` = Nama member yang keluar\n\`{server}\` = Nama server Discord ini\n\`{memberCount}\` = Jumlah member sekarang\n\n**Contoh:**\n\`.setgoodbye #welcome Sayonara {user}... Semoga tenang di alam sana. Sisa member {server} tinggal {memberCount} orang.\``);
        }

        const textArgs = args.slice(1).join(' ');
        if (!textArgs) {
            return message.reply('❌ Harap masukkan pesan goodbye-nya!');
        }

        if (!global.db.discord) global.db.discord = {};
        if (!global.db.discord[message.guild.id]) global.db.discord[message.guild.id] = {};

        global.db.discord[message.guild.id].goodbye = {
            channel: channelMention.id,
            message: textArgs
        };

        // Simpan ke database JSON
        fs.writeFileSync(path.join(__dirname, '../../database/database.json'), JSON.stringify(global.db, null, 2));

        message.reply(`✅ **Berhasil set Goodbye Message!**\n\n📍 **Channel:** <#${channelMention.id}>\n💬 **Pesan:**\n${textArgs.replace(/{user}/g, message.author.username).replace(/{server}/g, message.guild.name).replace(/{memberCount}/g, message.guild.memberCount)}`);
    }
};
