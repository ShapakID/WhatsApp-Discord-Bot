module.exports = {
    name: 'addowner',
    async execute(message, args) {
        const isOwner = message.author.id === '1202397666835701830';
        if (!isOwner) return message.reply("Khusus Owner!");

        let targetUser = message.mentions.users.first();
        if (!targetUser && args[0]) {
            try {
                targetUser = await message.client.users.fetch(args[0].replace(/[<@!>]/g, ''));
            } catch (e) {
                targetUser = null;
            }
        }

        if (!targetUser) return message.reply("Tag orangnya atau masukin ID Discord-nya!");

        const t = targetUser.id;
        const command = message.content.split(' ')[0].substring(1).toLowerCase(); // asumsi prefix ! atau / dll

        if (!global.ownerDiscord) global.ownerDiscord = [];

        if (command === 'addowner') {
            if (!global.ownerDiscord.includes(t)) global.ownerDiscord.push(t);
            message.reply(`Berhasil menambahkan <@${t}> sebagai Owner Bot sementara.`);
        } else if (command === 'removeowner') {
            global.ownerDiscord = global.ownerDiscord.filter(v => v !== t);
            message.reply(`Berhasil menghapus Owner sementara.`);
        }
    }
};
