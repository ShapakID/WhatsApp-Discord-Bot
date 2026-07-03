const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
let tiktokDl;
try {
    tiktokDl = require('../../../lib/scrape/tiktok').tiktokDl;
} catch (e) { }
const axios = require('axios');

module.exports = {
    name: 'tt',
    aliases: ['tiktok', 'ttdl'],
    category: 'download',
    description: 'Download video/music dari TikTok tanpa API.',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply("Kirim link TikTok!\nContoh: `.tt https://vt.tiktok.com/...`");
        }

        if (!tiktokDl) return message.reply("❌ Fitur download TikTok Discord dinonaktifkan (hemat RAM STB). Gunakan bot WhatsApp untuk fitur ini!");

        const url = args[0];
        if (!url.includes('tiktok.com')) {
            return message.reply("Ini bukan link TikTok woy!");
        }

        const embed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle(`📥 Downloader - TikTok`)
            .setDescription(`Pilih format yang ingin didownload:\n${url}`)
            .setFooter({ text: 'TikTok Downloader Tanpa API' });

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
            await i.editReply({ embeds: [new EmbedBuilder().setColor('#ffff00').setTitle('⏳ Sedang Memproses...').setDescription(`Mendownload ${format} dari TikTok, mohon tunggu...`)], components: [] });

            try {
                let res = await tiktokDl(url);

                if (!res || !res.status) {
                    throw new Error(res.msg || "Gagal mendapatkan data TikTok dari sistem scraper.");
                }

                const axiosHeaders = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                    'Referer': 'https://www.tiktok.com/',
                    'Accept': '*/*'
                };

                if (format === 'music') {
                    let audioUrl = res.music_info?.url;
                    if (!audioUrl) throw new Error("Audio tidak ditemukan untuk video ini.");

                    try {
                        const audioBuffer = await axios.get(audioUrl, { responseType: 'arraybuffer', headers: axiosHeaders });
                        const attachment = new AttachmentBuilder(audioBuffer.data, { name: 'tiktok_audio.mp3' });
                        await i.editReply({ content: `🎵 **${res.music_info.title || 'TikTok Audio'}**`, embeds: [], files: [attachment] });
                    } catch (fetchErr) {
                        console.error("Gagal Buffer Audio:", fetchErr.message);
                        // Fallback jika diblokir Cloudflare/403
                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setLabel('Download Audio Manual').setStyle(ButtonStyle.Link).setURL(audioUrl)
                        );
                        await i.editReply({ content: `🎵 **${res.music_info.title || 'TikTok Audio'}**\n*(Gagal di-upload langsung ke Discord karena proteksi server, silakan klik tombol di bawah untuk download)*`, embeds: [], components: [row] });
                    }
                } else {
                    // Check if it is a slide (photos)
                    let isSlide = res.data.length > 0 && res.data[0].type === 'photo';

                    if (isSlide) {
                        try {
                            const files = await Promise.all(res.data.slice(0, 10).map(async (img, idx) => {
                                const imgBuffer = await axios.get(img.url, { responseType: 'arraybuffer', headers: axiosHeaders });
                                return new AttachmentBuilder(imgBuffer.data, { name: `image_${idx}.jpg` });
                            }));
                            await i.editReply({ content: `🖼️ **${res.title || 'TikTok Slide'}** (Max 10 images)`, embeds: [], files: files });
                        } catch (fetchErr) {
                            console.error("Gagal Buffer Slide:", fetchErr.message);
                            await i.editReply({ embeds: [new EmbedBuilder().setColor('#ff0000').setTitle('❌ Error').setDescription(`Gagal mendownload gambar:\n\`${fetchErr.message}\``)] });
                        }
                    } else {
                        let videoUrl = res.data[0]?.url;
                        if (!videoUrl) throw new Error("Video tidak ditemukan.");

                        try {
                            const videoBuffer = await axios.get(videoUrl, { responseType: 'arraybuffer', headers: axiosHeaders });
                            const attachment = new AttachmentBuilder(videoBuffer.data, { name: 'tiktok_video.mp4' });
                            await i.editReply({ content: `🎥 **${res.title || 'TikTok Video'}**\n*(Note: Discord limit file max 8MB/25MB)*`, embeds: [], files: [attachment] });
                        } catch (fetchErr) {
                            console.error("Gagal Buffer Video:", fetchErr.message);
                            const row = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setLabel('Download Video Manual').setStyle(ButtonStyle.Link).setURL(videoUrl)
                            );
                            await i.editReply({ content: `🎥 **${res.title || 'TikTok Video'}**\n*(Gagal di-upload langsung ke Discord karena limit size / proteksi server, silakan klik tombol di bawah)*`, embeds: [], components: [row] });
                        }
                    }
                }
            } catch (err) {
                console.error(err);
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
