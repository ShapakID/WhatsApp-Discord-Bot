const { modul } = require('../../lib/module');
const { os, exec } = modul;

module.exports = {
    name: 'server',
    execute: async (hydro, m, args, text, { isOwner }) => {
        if (!isOwner) return hydro.sendMessage(m.chat, { text: "Khusus Owner bot ya!" }, { quoted: m });

        // Fungsi buat format uptime
        const formatUptime = (seconds) => {
            const d = Math.floor(seconds / (3600 * 24));
            const h = Math.floor((seconds % (3600 * 24)) / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            return `${d}d ${h}h ${m}m`;
        };

        try {
            // Ambil suhu CPU (khusus Linux/Armbian)
            let cpuTemp = "N/A";
            try { cpuTemp = require('child_process').execSync('vcgencmd measure_temp').toString().replace('temp=', '').trim(); } catch {
                try { cpuTemp = (require('fs').readFileSync('/sys/class/thermal/thermal_zone0/temp') / 1000).toFixed(1) + "°C"; } catch { }
            }

            // Ambil Disk Usage Internal
            let diskUsage = "N/A";
            try { diskUsage = require('child_process').execSync("df -h / | awk 'NR==2 {print $3 \" of \" $2 \" (\" $5 \")\"}'").toString().trim(); } catch { }

            // Ambil Disk Usage SanDisk Eksternal
            let sandiskUsage = "Not Mounted";
            try { sandiskUsage = require('child_process').execSync("df -h /mnt/penyimpanan_eksternal | awk 'NR==2 {print $3 \" of \" $2 \" (\" $5 \")\"}'").toString().trim(); } catch { }

            // Detail Memory
            const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
            const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);
            const usedMem = (totalMem - freeMem).toFixed(2);
            const memPercent = Math.round((usedMem / totalMem) * 100);

            // Ambil IP (LAN & Tailscale/WAN)
            const nets = os.networkInterfaces();
            let ips = [];
            for (const name of Object.keys(nets)) {
                for (const net of nets[name]) {
                    if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
                }
            }

            let statusTeks = `v26.2 rolling for STB-Box running Armbian Linux

*Performance:*

◦ *Load:* ${os.loadavg()[0].toFixed(2)}%
◦ *Uptime:* ${formatUptime(os.uptime())}
◦ *CPU Temp:* ${cpuTemp}
◦ *Memory:* ${memPercent}% (${usedMem}G / ${totalMem}G)
◦ *Storage /:* ${diskUsage}
◦ *Storage SanDisk:* ${sandiskUsage}
◦ *Platform:* ${os.platform()} ${os.arch()}

*Networking:*
◦ *IP List:* ${ips.join(', ')}
`;

            hydro.sendMessage(m.chat, { text: statusTeks }, { quoted: m });
        } catch (e) {
            hydro.sendMessage(m.chat, { text: `Gagal ambil data server: ${e.message}` });
        }
    }
};