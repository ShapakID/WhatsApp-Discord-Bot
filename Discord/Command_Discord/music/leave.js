// Command_Discord/music/leave.js

module.exports = {
    name: 'leave',
    execute(message) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('Kamu harus di dalem voice channel buat nyuruh bot keluar!');

        const player = message.client.shoukaku?.players.get(message.guild.id);
        if (!player) return message.reply('Botnya emang lagi nggak di voice channel cuy!');

        // Bersihkan antrean agar tidak nyangkut saat play lagi
        const queue = message.client.musicQueues?.get(message.guild.id);
        if (queue) {
            queue.tracks = [];
            queue.currentTrack = null;
            queue.isProcessing = false;

            // Matikan tombol di dashboard sebelumnya agar tidak diklik
            if (queue.dashboardMsg) {
                queue.dashboardMsg.edit({ components: [] }).catch(() => { });
                queue.dashboardMsg = null;
            }
        }

        // Disconnect dan bersihkan dari Lavalink
        message.client.shoukaku.leaveVoiceChannel(message.guild.id);
        message.reply('👋 Okee, pamit dulu ya!');
    }
};