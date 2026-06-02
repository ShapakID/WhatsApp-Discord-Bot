// Command_Discord/music/play.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'play',
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('Kamu masuk voice channel dulu dong!');

        let query = args.join(' ');
        if (!query) return message.reply('Mana judul lagu atau linknya?');

        const shoukaku = message.client.shoukaku;
        if (!shoukaku) return message.reply('Sistem Lavalink belum siap!');

        const node = shoukaku.options.nodeResolver(shoukaku.nodes);
        if (!node) return message.reply('Waduh, server Lavalink gratisannya lagi pada mati/down nih. Coba lagi nanti ya!');

        // Bikin sistem antrean (queue) per server
        if (!message.client.musicQueues) message.client.musicQueues = new Map();
        let queue = message.client.musicQueues.get(message.guild.id);
        if (!queue) {
            queue = { tracks: [], currentTrack: null, dashboardMsg: null };
            message.client.musicQueues.set(message.guild.id, queue);
        }

        const loadingMsg = await message.reply(`🔍 Sabar Shapak, lagi ngecek lagu...`);

        try {
            let searchType = query.startsWith('http') ? query : `ytsearch:${query}`;
            const result = await node.rest.resolve(searchType);

            if (!result || !result.data || result.data.length === 0) {
                return loadingMsg.edit('Lagunya nggak ketemu di server Lavalink!');
            }

            // Kalau Playlist, masukin semua lagunya ke antrean!
            if (result.loadType === 'playlist') {
                for (const t of result.data.tracks) {
                    queue.tracks.push(t);
                }
                await loadingMsg.edit(`✅ **${result.data.tracks.length}** lagu dari playlist berhasil dimasukkan ke antrean!`);
            } else {
                // Kalau cuma 1 lagu, masukin lagu pertama
                const track = result.loadType === 'search' ? result.data[0] : result.data;
                queue.tracks.push(track);
                await loadingMsg.edit(`✅ **${track.info.title}** berhasil dimasukkan ke antrean!`);
            }

            let player = shoukaku.players.get(message.guild.id);

            if (!player) {
                player = await shoukaku.joinVoiceChannel({
                    guildId: message.guild.id,
                    channelId: voiceChannel.id,
                    shardId: 0
                });
                player.currentVolume = 100;
            } else if (message.guild.members.me.voice.channelId && message.guild.members.me.voice.channelId !== voiceChannel.id) {
                return loadingMsg.edit('Botnya udah nyanyi di channel lain cuy!');
            }

            // Fungsi utama buat muter lagu (otomatis ngambil dari antrean)
            const playNext = async () => {
                if (queue.isProcessing) return; // Mencegah double trigger
                queue.isProcessing = true;

                try {
                    if (queue.tracks.length === 0) {
                        queue.currentTrack = null;
                        queue.isProcessing = false;
                        if (queue.dashboardMsg) {
                            queue.dashboardMsg.delete().catch(() => { });
                            queue.dashboardMsg = null;
                        }
                        return message.channel.send('🎵 Semua antrean lagu udah habis cuy. Mau request lagi?').catch(() => { });
                    }

                    // Ambil lagu paling atas dari antrean
                    const track = queue.tracks.shift();
                    queue.currentTrack = track;

                    // Pastikan bot gak dalam keadaan pause dari lagu sebelumnya
                    if (player.paused) {
                        player.setPaused(false);
                    }

                    await player.playTrack({ track: { encoded: track.encoded } });

                    // --- BIKIN DASHBOARD LENGKAP ---
                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setTitle('🎶 Sedang Memutar')
                        .setDescription(`**${track.info.title}**\nVolume: ${player.currentVolume}%\nSisa Antrean: ${queue.tracks.length} lagu`)
                        .setFooter({ text: 'Powered by Lavalink', iconURL: 'https://i.imgur.com/qF08m0e.png' });

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('pause_resume').setEmoji('⏯️').setStyle(ButtonStyle.Primary),
                            new ButtonBuilder().setCustomId('skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId('leave').setEmoji('⏹️').setStyle(ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId('vol_down').setEmoji('🔉').setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId('vol_up').setEmoji('🔊').setStyle(ButtonStyle.Secondary)
                        );

                    const dashboardMsg = await message.channel.send({ embeds: [embed], components: [row] });

                    // Matiin tombol dashboard sebelumnya kalau ada
                    if (queue.dashboardMsg) {
                        queue.dashboardMsg.edit({ components: [] }).catch(() => { });
                    }
                    queue.dashboardMsg = dashboardMsg;

                    // Buat nangkep klik tombol dari dashboard
                    const filter = i => ['pause_resume', 'skip', 'leave', 'vol_down', 'vol_up'].includes(i.customId);
                    const collector = dashboardMsg.createMessageComponentCollector({ filter, time: 3600000 }); // Aktif 1 jam

                    collector.on('collect', async i => {
                        try {
                            if (!i.member.voice.channel) {
                                return i.reply({ content: 'Kamu harus di Voice Channel buat mencet ini!', ephemeral: true }).catch(() => { });
                            }

                            // Cegah error jika player keburu mati/disconnect
                            if (!message.client.shoukaku.players.has(message.guild.id)) {
                                collector.stop();
                                return i.reply({ content: '❌ Sesi player sudah berakhir/terputus!', ephemeral: true }).catch(() => { });
                            }

                            if (i.customId === 'pause_resume') {
                                player.setPaused(!player.paused);
                                await i.reply({ content: player.paused ? '⏸️ Lagu di-pause!' : '▶️ Lagu dilanjut!', ephemeral: true }).catch(() => { });

                            } else if (i.customId === 'skip') {
                                await i.reply({ content: '⏭️ Lagu di-skip, lanjut ke lagu berikutnya!', ephemeral: true }).catch(() => { });
                                collector.stop();
                                playNext(); // Langsung timpa lagu tanpa stopTrack biar nggak stuck!

                            } else if (i.customId === 'leave') {
                                queue.tracks = []; // Bersihin antrean
                                message.client.shoukaku.leaveVoiceChannel(message.guild.id);
                                await i.reply({ content: '👋 Oke pamit, bot keluar dari channel!', ephemeral: true }).catch(() => { });
                                await dashboardMsg.edit({ components: [] }).catch(() => { });
                                collector.stop();

                            } else if (i.customId === 'vol_down' || i.customId === 'vol_up') {
                                let newVol = i.customId === 'vol_down' ? player.currentVolume - 10 : player.currentVolume + 10;
                                if (newVol < 0) newVol = 0;
                                if (newVol > 200) newVol = 200;

                                player.currentVolume = newVol;
                                player.setGlobalVolume(newVol);

                                embed.setDescription(`**${track.info.title}**\nVolume: ${newVol}%\nSisa Antrean: ${queue.tracks.length} lagu`);
                                await dashboardMsg.edit({ embeds: [embed] }).catch(() => { });
                                await i.reply({ content: `Volume diubah jadi ${newVol}%`, ephemeral: true }).catch(() => { });
                            }
                        } catch (err) {
                            console.error('Error saat nangkep tombol dashboard:', err);
                        }
                    });
                } catch (err) {
                    console.error("Error di playNext:", err);
                    message.channel.send(`Waduh, lagu ini error dan dilewati: ${err.message}`).catch(() => { });
                    queue.isProcessing = false;
                    playNext(); // Paksa lanjut ke lagu berikutnya kalau lagu ini error!
                } finally {
                    queue.isProcessing = false;
                }
            };

            // Pastikan event listener 'end' cuma di-attach SEKALI biar lagunya nggak ngeloop ganda
            if (player.listeners('end').length === 0) {
                player.on('end', (data) => {
                    // Kalau lagu beres atau sengaja di skip (Shoukaku V4 kirim text lowercase 'finished'/'stopped')
                    const reason = data.reason?.toLowerCase();
                    if (reason === 'finished' || reason === 'stopped') {
                        playNext();
                    }
                });

                player.on('exception', (err) => {
                    console.error('Lavalink Player Exception:', err);
                    message.channel.send(`Waduh, lagu ini error dari Lavalink: ${err.exception?.message}`).catch(() => { });
                    playNext(); // Skip lagu yang error
                });
            }

            // Kalau bot lagi nggak muter apa-apa (antrean sedang kosong/idle), pancing buat play antrean
            if (!queue.currentTrack) {
                playNext();
            }

        } catch (error) {
            console.error("Lavalink Play Error:", error);
            loadingMsg.edit('Waduh error nih pas nyuruh server Lavalink muterin lagu.').catch(() => { });
        }
    }
};