const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'help',
    async execute(message, args) {
        const commands = message.client.commands;
        const categories = {};

        const isOwner = message.author.id === '1202397666835701830';
        const isAdmin = message.member && message.member.permissions.has('Administrator');
        const canSeeSecurity = isOwner || isAdmin;

        // Mengelompokkan command berdasarkan kategori (nama folder)
        for (const [name, cmd] of commands.entries()) {
            const category = cmd.category ? cmd.category.toUpperCase() : 'UNCATEGORIZED';

            if (category === 'SECURITY' && !canSeeSecurity) continue;
            if (category === 'OWNER' && !isOwner) continue;
            if (category === 'PREDIKSI' && !isOwner) continue;
            if (category === 'COOLYEAH' && !isOwner) continue;

            if (!categories[category]) categories[category] = [];
            categories[category].push(name);
        }

        const categoryList = Object.keys(categories).sort();
        const ITEMS_PER_PAGE = 5;
        const pages = [];

        for (let i = 0; i < categoryList.length; i += ITEMS_PER_PAGE) {
            const currentCategories = categoryList.slice(i, i + ITEMS_PER_PAGE);
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📚 Menu Command Bot')
                .setDescription(`Halo <@${message.author.id}>! Berikut adalah daftar command yang bisa kamu gunakan.\n\n*Halaman ${Math.floor(i / ITEMS_PER_PAGE) + 1} dari ${Math.ceil(categoryList.length / ITEMS_PER_PAGE)}*`)
                .setFooter({ text: 'Gunakan prefix sebelum command (misal: .play)' })
                .setTimestamp();

            for (const category of currentCategories) {
                const commandList = categories[category].sort().map(cmd => {
                    const commandObj = commands.get(cmd);
                    let text = `\`${cmd}\``;
                    if (commandObj && commandObj.aliases && commandObj.aliases.length > 0) {
                        text += ` (alias: ${commandObj.aliases.map(a => `\`${a}\``).join(', ')})`;
                    }
                    return text;
                }).join(', ');

                let emoji = '📂';
                if (category === 'MUSIC') emoji = '🎵';
                else if (category === 'SECURITY') emoji = '🛡️';
                else if (category === 'GENERAL') emoji = '🛠️';
                else if (category === 'OWNER') emoji = '👑';
                else if (category === 'MODERATION') emoji = '🔨';
                else if (category === 'PREDIKSI') emoji = '📊';
                else if (category === 'DOWNLOAD') emoji = '📥';
                else if (category === 'COOLYEAH') emoji = '😎';

                embed.addFields({ name: `${emoji} ${category}`, value: commandList, inline: false });
            }
            pages.push(embed);
        }

        if (pages.length === 1) {
            return message.reply({ embeds: [pages[0]] });
        }

        let currentPage = 0;

        const getRow = (page) => {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev_help')
                        .setLabel('◀ Prev')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next_help')
                        .setLabel('Next ▶')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === pages.length - 1)
                );
        };

        const sentMessage = await message.reply({
            embeds: [pages[currentPage]],
            components: [getRow(currentPage)]
        });

        const filter = i => i.isButton() && i.user.id === message.author.id;
        const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'prev_help') {
                currentPage--;
            } else if (interaction.customId === 'next_help') {
                currentPage++;
            }

            await interaction.update({
                embeds: [pages[currentPage]],
                components: [getRow(currentPage)]
            });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('prev_help').setLabel('◀ Prev').setStyle(ButtonStyle.Primary).setDisabled(true),
                    new ButtonBuilder().setCustomId('next_help').setLabel('Next ▶').setStyle(ButtonStyle.Primary).setDisabled(true)
                );
            sentMessage.edit({ components: [disabledRow] }).catch(() => { });
        });
    }
};
