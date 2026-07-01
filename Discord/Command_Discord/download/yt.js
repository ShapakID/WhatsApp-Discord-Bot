const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const ytdl = require('@distube/ytdl-core');

module.exports = {
    name: 'yt',
    aliases: ['youtube', 'ytdl'],
    category: 'download',
    description: 'Download video/music dari YouTube tanpa API.',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply("Kirim link YouTube!\nContoh: `.yt https://youtu.be/...`");
        }

        const url = args[0];
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return message.reply("Ini bukan link YouTube woy!");
        }

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(`📥 Downloader - YouTube`)
            .setDescription(`Pilih format yang ingin didownload:\n${url}`)
            .setFooter({ text: 'YouTube Downloader Tanpa API' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('dl_video')
                    .setLabel('🎥 Video')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('dl_music')
                    .setLabel('🎵 Music')
                    .setStyle(ButtonStyle.Success)
            );

        const sentMsg = await message.reply({ embeds: [embed], components: [row] });

        const filter = i => i.user.id === message.author.id;
        const collector = sentMsg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            await i.deferUpdate();
            const format = i.customId === 'dl_video' ? 'video' : 'music';
            await i.editReply({ embeds: [new EmbedBuilder().setColor('#ffff00').setTitle('⏳ Sedang Memproses...').setDescription(`Mendownload ${format} dari YouTube, mohon tunggu...`)], components: [] });

            try {
                const info = await ytdl.getInfo(url);
                const title = info.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, '');

                if (format === 'music') {
                    const stream = ytdl(url, { quality: 'highestaudio', filter: 'audioonly' });
                    const attachment = new AttachmentBuilder(stream, { name: `${title}.mp3` });
                    await i.editReply({ content: `🎵 **${info.videoDetails.title}**`, embeds: [], files: [attachment] });
                } else {
                    const stream = ytdl(url, { quality: 'highest', filter: 'audioandvideo' });
                    const attachment = new AttachmentBuilder(stream, { name: `${title}.mp4` });
                    await i.editReply({ content: `🎥 **${info.videoDetails.title}**\n*(Note: Discord memiliki limit 8MB/25MB per file)*`, embeds: [], files: [attachment] });
                }
            } catch (err) {
                await i.editReply({ embeds: [new EmbedBuilder().setColor('#ff0000').setTitle('❌ Error').setDescription(`Gagal mendownload:\n\`${err.message}\``)] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                sentMsg.edit({ components: [] }).catch(() => { });
            }
        });
    }
};
