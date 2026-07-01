// Trigger Sync STB
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'prediksi',
    aliases: ['predict', 'prediksitrafik'],
    category: 'prediksi',
    description: 'Memprediksi load trafik bot WhatsApp dan Discord menggunakan Regresi Linear',
    execute: async (hydro, m, args, text, { prefix, isOwner }) => {
        if (!isOwner) return hydro.sendMessage(m.chat, { text: `⛔ Fitur ini hanya untuk Owner bot.` }, { quoted: m });

        const scriptPath = path.join(__dirname, 'predict_svr.py');
        const stbLimit = args[0] && !isNaN(args[0]) ? parseInt(args[0]) : 1000;

        hydro.sendMessage(m.chat, { text: `_⏳ Memproses Machine Learning SVR (Support Vector Regression) dari Awal (From Scratch) pakai Javascript Murni..._` }, { quoted: m });

        try {
            const LinearSVR = require('../../lib/svr');
            const csvPath = path.join(__dirname, '../../traffic_log.csv');

            if (!fs.existsSync(csvPath)) {
                return hydro.sendMessage(m.chat, { text: '❌ File traffic_log.csv tidak ditemukan.' }, { quoted: m });
            }

            const csvData = fs.readFileSync(csvPath, 'utf8').split('\n').filter(l => l.trim().length > 0);

            const daily_wa_dm = {};
            const daily_wa_gc = {};
            const daily_dc = {};
            const daily_all = {};
            const datesSet = new Set();

            // Skip header (i = 1)
            for (let i = 1; i < csvData.length; i++) {
                const cols = csvData[i].split(',');
                if (cols.length < 4) continue;

                const date = cols[1].split(' ')[0];
                const platform = cols[2].trim();
                const chatType = cols[4] ? cols[4].trim() : '';

                datesSet.add(date);
                daily_all[date] = (daily_all[date] || 0) + 1;

                if (platform === 'WhatsApp' && chatType === 'Pribadi') {
                    daily_wa_dm[date] = (daily_wa_dm[date] || 0) + 1;
                } else if (platform === 'WhatsApp' && chatType === 'Grup') {
                    daily_wa_gc[date] = (daily_wa_gc[date] || 0) + 1;
                } else if (platform === 'Discord') {
                    daily_dc[date] = (daily_dc[date] || 0) + 1;
                }
            }

            const dates = Array.from(datesSet).sort();
            const n = dates.length;

            if (n <= 1) return hydro.sendMessage(m.chat, { text: '❌ Data masih kosong atau kurang dari 2 hari untuk diprediksi.' }, { quoted: m });

            const X = Array.from({ length: n }, (_, i) => i + 1);

            const trainSvr = (series) => {
                const y = dates.map(d => series[d] || 0);
                const sum = y.reduce((a, b) => a + b, 0);
                if (sum === 0) return { a: 0, b: 0, avg: 0 };

                // Menggunakan C=100.0, epsilon=0.1, lr=0.001, epochs=10000
                const svr = new LinearSVR(100.0, 0.1, 0.001, 10000);
                svr.fit(X, y);
                return {
                    a: svr.intercept,
                    b: svr.coef,
                    avg: sum / n
                };
            };

            const regWA_DM = trainSvr(daily_wa_dm);
            const regWA_GC = trainSvr(daily_wa_gc);
            const regDC = trainSvr(daily_dc);
            const regAll = trainSvr(daily_all);

            const recentDates = dates.slice(-10);

            const predict = (reg, daysAhead) => {
                let val = Math.round(reg.a + reg.b * (n + daysAhead));
                return val > 0 ? val : Math.round(reg.avg);
            };

            const formatNum = (num) => {
                if (num < 10) return ` ${num} `;
                if (num < 100) return ` ${num}`;
                if (num < 1000) return `${num}`;
                return `${num}`;
            };

            let dataHarian = '';
            recentDates.forEach(d => {
                const shortDate = d.split('-')[2] + '/' + d.split('-')[1];
                const dm = daily_wa_dm[d] || 0;
                const gc = daily_wa_gc[d] || 0;
                const dc = daily_dc[d] || 0;
                const tot = dm + gc + dc;
                dataHarian += `│${shortDate}│${formatNum(dm)}│${formatNum(gc)}│${formatNum(dc)}│${formatNum(tot)}│\n`;
            });

            let txt = `📊 *ANALISIS TRAFIK BOT — SVR (From Scratch JS)*\n`;
            txt += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            txt += `📋 *DATA RIIL PENGGUNAAN BOT*\n`;
            txt += `Periode: ${dates[0]} s/d ${dates[n - 1]} (${n} hari)\n`;
            txt += `Total: ${Object.values(daily_all).reduce((a, b) => a + b, 0)} pesan\n\n`;

            txt += `📅 *Rekap Harian (${recentDates.length} hari terakhir):*\n`;
            txt += "```\n";
            txt += "┌─────┬───┬───┬───┬───┐\n";
            txt += "│ Tgl │ DM│ GC│ DC│Tot│\n";
            txt += "├─────┼───┼───┼───┼───┤\n";
            txt += dataHarian;
            txt += "└─────┴───┴───┴───┴───┘\n";
            txt += "```\n";
            txt += `_DM=Pribadi, GC=Grup, DC=Discord_\n\n`;

            txt += `📈 *HASIL REGRESI SVR LINEAR (Math From Scratch)*\n`;
            txt += `• WA DM   → Y = ${regWA_DM.a.toFixed(2)} + ${regWA_DM.b.toFixed(2)}X (avg: ${regWA_DM.avg.toFixed(1)}/hari)\n`;
            txt += `• WA Grup → Y = ${regWA_GC.a.toFixed(2)} + ${regWA_GC.b.toFixed(2)}X (avg: ${regWA_GC.avg.toFixed(1)}/hari)\n`;
            txt += `• Discord → Y = ${regDC.a.toFixed(2)} + ${regDC.b.toFixed(2)}X (avg: ${regDC.avg.toFixed(1)}/hari)\n`;
            txt += `• Total   → Y = ${regAll.a.toFixed(2)} + ${regAll.b.toFixed(2)}X (avg: ${regAll.avg.toFixed(1)}/hari)\n\n`;

            txt += `🔮 *PREDIKSI KE DEPAN:*\n`;
            txt += "```\n";
            txt += "┌──────┬───┬───┬───┬───┐\n";
            txt += "│Waktu │ DM│ GC│ DC│Tot│\n";
            txt += "├──────┼───┼───┼───┼───┤\n";
            const rentang = [
                ['1 hari', 1], ['3 hari', 3], ['1 mngg', 7],
                ['2 mngg', 14], ['1 bln ', 30], ['3 bln ', 90], ['6 bln ', 180]
            ];
            rentang.forEach(([label, d]) => {
                const pdm = formatNum(predict(regWA_DM, d));
                const pgc = formatNum(predict(regWA_GC, d));
                const pdc = formatNum(predict(regDC, d));
                const ptot = formatNum(predict(regAll, d));
                txt += `│${label}│${pdm}│${pgc}│${pdc}│${ptot}│\n`;
            });
            txt += "└──────┴───┴───┴───┴───┘\n";
            txt += "```\n\n";

            txt += `🖥️ *PREDIKSI UPGRADE SERVER (STB)*\n`;
            txt += `Batas kapasitas aman STB: *${stbLimit} pesan/hari*\n`;

            if (regAll.b <= 0) {
                txt += `Status: 🟢 Aman (Trafik cenderung stabil/menurun, belum butuh upgrade).\n\n`;
            } else {
                const targetX = (stbLimit - regAll.a) / regAll.b;
                const daysRemaining = Math.ceil(targetX - n);

                if (daysRemaining <= 0) {
                    txt += `Status: 🔴 KRITIS! Trafik saat ini sudah melampaui batas aman STB. Segera upgrade!\n\n`;
                } else {
                    txt += `Status: 🟡 Waspada!\n`;
                    txt += `Diperkirakan batas limit akan tercapai dalam *${daysRemaining} hari* lagi.\n`;
                    txt += `_(Rekomendasi: Mulai siapkan dana upgrade bulan depan)_.\n\n`;
                }
            }

            txt += `_💡 Algoritma: Pegasos SVR with Gradient Descent (Vanilla JS)_\n`;
            txt += `_📌 Ketik *${prefix}prediksidoc* untuk download Laporan PDF (Plot by Python)_`;

            hydro.sendMessage(m.chat, { text: txt }, { quoted: m });

        } catch (e) {
            console.error(e);
            hydro.sendMessage(m.chat, { text: `❌ Terjadi error saat memproses JS SVR: ${e.message}` }, { quoted: m });
        }
    }
};
