// Command_Discord/music/skip.js

module.exports = {
    name: 'skip',
    execute(message) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('Kamu harus di dalem voice channel buat nge-skip lagu!');

        const player = message.client.shoukaku?.players.get(message.guild.id);
        if (!player) return message.reply('Lagi nggak ada lagu yang diputer cuy!');

        const queue = message.client.musicQueues?.get(message.guild.id);
        if (queue) {
            queue.isProcessing = false; // Buka gembok antrean paksa biar nggak nyangkut
        }

        player.stopTrack();
        message.reply('⏭️ Lagu di-skip! Lanjut ke lagu berikutnya...');
    }
};