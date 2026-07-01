const { EmbedBuilder } = require('discord.js');
const os = require('os');
const { execSync } = require('child_process');
const fs = require('fs');

module.exports = {
    name: 'ping',
    async execute(message, args) {
        const isOwner = message.author.id === '1202397666835701830';

        const sent = await message.reply('Pinging server...');
        const latency = sent.createdTimestamp - message.createdTimestamp;
        const apiPing = Math.round(message.client.ws.ping);

        // Semua orang (termasuk owner) bakal lihat ini di grup/channel
        await sent.edit(`🏓 **Pong!**\nBot Latency: **${latency}ms** | API Latency: **${apiPing}ms**`);

        if (!isOwner) return;

        // Kalau yang ngetik adalah owner, kita kirim info detailnya via DM
        // Karena text command (!ping) gak bisa pakai fitur ephemeral "Only you can see this"
        const formatUptime = (seconds) => {
            const d = Math.floor(seconds / (3600 * 24));
            const h = Math.floor((seconds % (3600 * 24)) / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            return `${d}d ${h}h ${m}m`;
        };

        let cpuTemp = "N/A";
        try {
            cpuTemp = execSync('vcgencmd measure_temp', { encoding: 'utf-8', stdio: 'pipe' }).replace('temp=', '').trim();
        } catch {
            try {
                cpuTemp = (fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8') / 1000).toFixed(1) + "°C";
            } catch { }
        }

        let diskUsage = "N/A";
        try {
            if (os.platform() === 'win32') {
                diskUsage = "Windows OS";
            } else {
                diskUsage = execSync("df -h / | awk 'NR==2 {print $3 \" of \" $2 \" (\" $5 \")\"}'", { encoding: 'utf-8', stdio: 'pipe' }).trim();
            }
        } catch { }

        let sandiskUsage = "Not Mounted";
        try {
            if (os.platform() !== 'win32') {
                sandiskUsage = execSync("df -h /mnt/penyimpanan_eksternal | awk 'NR==2 {print $3 \" of \" $2 \" (\" $5 \")\"}'", { encoding: 'utf-8', stdio: 'pipe' }).trim();
            }
        } catch { }

        const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
        const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);
        const usedMem = (totalMem - freeMem).toFixed(2);
        const memPercent = Math.round((usedMem / totalMem) * 100);

        const nets = os.networkInterfaces();
        let ips = [];
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🏓 Pong! & Server Status')
            .setDescription('Detail latency Discord dan status server. (Dikirim via DM untuk privasi)')
            .addFields(
                { name: '⚡ Latency', value: `Bot Latency: **${latency}ms**\nAPI Latency: **${apiPing}ms**`, inline: false },
                { name: '🖥️ System Info', value: `v26.2 rolling for STB-Box running Armbian Linux\nPlatform: ${os.platform()} ${os.arch()}`, inline: false },
                { name: '📈 Performance', value: `◦ **Load:** ${os.loadavg()[0] ? os.loadavg()[0].toFixed(2) : 0}%\n◦ **Uptime:** ${formatUptime(os.uptime())}\n◦ **CPU Temp:** ${cpuTemp}\n◦ **Memory:** ${memPercent}% (${usedMem}G / ${totalMem}G)`, inline: false },
                { name: '💾 Storage', value: `◦ **Internal ( / ):** ${diskUsage}\n◦ **SanDisk:** ${sandiskUsage}`, inline: false },
                { name: '🌐 Networking', value: `◦ **IP List:** ${ips.join(', ')}`, inline: false }
            )
            .setTimestamp();

        try {
            await message.author.send({ embeds: [embed] });
        } catch (e) {
            // Kalau DM owner ditutup
            message.channel.send('⚠️ Gagal mengirim detail server ke DM kamu (Pastikan DM-mu terbuka!).').then(m => {
                setTimeout(() => m.delete().catch(() => { }), 5000);
            });
        }
    }
};
