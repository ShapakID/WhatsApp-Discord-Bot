// Command_Discord/music/playlist.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'playlist',
    aliases: ['queue', 'q', 'list'],
    execute(message, args) {
        const queue = message.client.musicQueues?.get(message.guild.id);

        if (!queue || (!queue.currentTrack && queue.tracks.length === 0)) {
            return message.reply('❌ Saat ini tidak ada lagu yang sedang diputar atau antrean kosong.');
        }

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🎶 Antrean Musik / Playlist')
            .setTimestamp()
            .setFooter({ text: `Diminta oleh ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

        let description = '';

        // Tampilkan lagu yang sedang diputar saat ini
        if (queue.currentTrack) {
            description += `**🎵 Sedang Diputar:**\n[${queue.currentTrack.info.title}](${queue.currentTrack.info.uri})\n\n`;
        }

        // Tampilkan daftar antrean selanjutnya
        if (queue.tracks.length > 0) {
            description += `**⬇️ Selanjutnya:**\n`;

            // Batasi tampilan maksimal 10 lagu agar pesan Discord tidak kepanjangan
            const maxTracks = 10;
            const tracksToShow = queue.tracks.slice(0, maxTracks);

            tracksToShow.forEach((track, index) => {
                description += `**${index + 1}.** [${track.info.title}](${track.info.uri})\n`;
            });

            if (queue.tracks.length > maxTracks) {
                description += `\n*...dan ${queue.tracks.length - maxTracks} lagu lainnya.*`;
            }
        } else {
            description += `*Belum ada lagu lain di antrean. Tambahkan dengan \`.play\`!*`;
        }

        embed.setDescription(description);

        message.reply({ embeds: [embed] });
    }
};
