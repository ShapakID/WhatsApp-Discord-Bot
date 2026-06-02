// Command_Discord/music/stop.js

module.exports = {
    name: 'stop',
    execute(message) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('Kamu harus di dalem voice channel buat nyetop lagu!');

        const player = message.client.shoukaku?.players.get(message.guild.id);
        if (!player) return message.reply('Lagi nggak ada lagu yang muter cuy!');

        const queue = message.client.musicQueues?.get(message.guild.id);
        if (queue) queue.tracks = []; // Bersihin antrean biar beneran stop

        player.stopTrack();
        message.reply('⏹️ Musik berhasil dihentikan!');
    }
};