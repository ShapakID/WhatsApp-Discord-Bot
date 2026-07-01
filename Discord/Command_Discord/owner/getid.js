module.exports = {
    name: 'getid',
    async execute(message, args) {
        let text = `**User ID lu:** \`${message.author.id}\`\n**Channel ID ini:** \`${message.channel.id}\``;

        if (message.guild) {
            text += `\n**Server/Guild ID:** \`${message.guild.id}\``;
        }

        if (message.mentions.users.size > 0) {
            const mentionedUser = message.mentions.users.first();
            text += `\n**Mentioned User ID (${mentionedUser.username}):** \`${mentionedUser.id}\``;
        }

        if (message.mentions.roles.size > 0) {
            const mentionedRole = message.mentions.roles.first();
            text += `\n**Mentioned Role ID (${mentionedRole.name}):** \`${mentionedRole.id}\``;
        }

        if (message.mentions.channels.size > 0) {
            const mentionedChannel = message.mentions.channels.first();
            text += `\n**Mentioned Channel ID (${mentionedChannel.name}):** \`${mentionedChannel.id}\``;
        }

        message.reply(text);
    }
};
