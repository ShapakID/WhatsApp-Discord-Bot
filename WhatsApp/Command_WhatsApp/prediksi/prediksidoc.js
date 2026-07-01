// Trigger Sync STB
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'prediksidoc',
    aliases: ['prediksidata'],
    category: 'prediksi',
    description: 'Mendownload dokumen Laporan Prediksi Trafik (PDF) dan dataset mentah (CSV)',
    execute: async (hydro, m, args, text, { prefix, isOwner }) => {
        if (!isOwner) return hydro.sendMessage(m.chat, { text: `⛔ Fitur ini hanya untuk Owner bot.` }, { quoted: m });

        const logFile = path.join(__dirname, '../../traffic_log.csv');
        if (!fs.existsSync(logFile)) {
            return hydro.sendMessage(m.chat, { text: `Belum ada data trafik yang terkumpul.` }, { quoted: m });
        }

        const { exec } = require('child_process');
        const scriptPath = path.join(__dirname, 'predict_svr.py');

        let stbLimit = 1000;
        let filterDate = null;

        // Deteksi argumen untuk limit STB dan filter tanggal (fitur keren)
        for (const arg of args) {
            if (arg.includes('-') && arg.length >= 8) {
                filterDate = arg; // Contoh: 2026-05-25
            } else if (!isNaN(arg)) {
                stbLimit = parseInt(arg);
            }
        }

        if (filterDate) {
            hydro.sendMessage(m.chat, { text: `_⏳ Memfilter data untuk tanggal *${filterDate}*..._` }, { quoted: m });
        } else {
            hydro.sendMessage(m.chat, { text: `_⏳ Sedang menyiapkan Dokumen Laporan (PDF) dan Backup Data (CSV)..._` }, { quoted: m });
        }

        // 1. Kirim File Excel (.xlsx) yang sudah diformat dengan Tabel
        const rawCsv = fs.readFileSync(logFile, 'utf-8');
        const lines = rawCsv.split('\n');

        let rowCount = 0;
        const excelRows = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const parts = lines[i].split(',');
            if (parts.length >= 5) {
                // parts = [timestamp, datetime, platform, sender, chat_type]
                const fullDateTime = parts[1];
                const datePart = fullDateTime.split(' ')[0]; // YYYY-MM-DD
                const timePart = fullDateTime.split(' ')[1]; // HH:mm:ss

                // Fitur pisah berdasarkan hari (filterDate)
                if (filterDate && datePart !== filterDate) continue;

                // Format Pengirim ID agar sesuai platform (dan mencegah Excel mengubahnya jadi E+12)
                let senderId = parts[3];
                if (parts[2] === 'WhatsApp') {
                    // Kalau belum ada buntutnya, kita tambahin
                    if (!senderId.includes('@')) {
                        senderId += (parts[4] === 'Grup') ? '@g.us' : '@s.whatsapp.net';
                    }
                } else if (parts[2] === 'Discord') {
                    // Pakai format mention discord <@id> biar gak diubah jadi angka ilmiah sama Excel
                    if (!senderId.startsWith('<@')) {
                        senderId = `<@${senderId}>`;
                    }
                }

                excelRows.push([datePart, timePart, parts[2], parts[4], senderId]);
                rowCount++;
            }
        }

        // Kalau data kosong gara-gara salah tanggal
        if (rowCount === 0 && filterDate) {
            return hydro.sendMessage(m.chat, { text: `⚠️ Tidak ada log trafik untuk tanggal ${filterDate}.` }, { quoted: m });
        }

        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Trafik Bot');

        // Buat tabel resmi di Excel dengan filter
        worksheet.addTable({
            name: 'TabelTrafik',
            ref: 'A1',
            headerRow: true,
            totalsRow: false,
            style: {
                theme: 'TableStyleMedium2',
                showRowStripes: true,
            },
            columns: [
                { name: 'Tanggal', filterButton: true },
                { name: 'Jam (WITA)', filterButton: true },
                { name: 'Platform Bot', filterButton: true },
                { name: 'Tipe Chat', filterButton: true },
                { name: 'Pengirim (ID)', filterButton: true }
            ],
            rows: excelRows
        });

        // Rapikan lebar kolom
        worksheet.columns.forEach((column, i) => {
            let maxLength = 0;
            column["eachCell"]({ includeEmpty: true }, function (cell) {
                var columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2;
        });

        const excelBuffer = await workbook.xlsx.writeBuffer();

        const fileName = filterDate ? `Dataset_Trafik_${filterDate}.xlsx` : 'Dataset_Trafik_Bot_Rapih.xlsx';
        const caption = filterDate
            ? `📂 *DATA TRAFIK HARIAN*\nMenampilkan data khusus tanggal *${filterDate}*.\nTotal: ${rowCount} pesan.\n_💡 Data dikemas dalam format Excel resmi (sudah termasuk Filter Otomatis)._`
            : `📂 *BACKUP DATA RIIL*\nIni adalah file dataset dari log trafik yang sudah dikemas jadi file Excel resmi.\n_💡 Tombol Filter sudah otomatis aktif di setiap kolom (klik tombol panah di judul kolom untuk memilah data/hari)._`;

        await hydro.sendMessage(m.chat, {
            document: excelBuffer,
            mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            fileName: fileName,
            caption: caption
        }, { quoted: m });

        // 2. Generate PDF via Python Output
        exec(`python3 "${scriptPath}" ${stbLimit}`, (error, stdout, stderr) => {
            if (error) {
                exec(`python "${scriptPath}" ${stbLimit}`, (err2, stdout2, stderr2) => {
                    if (err2) {
                        return hydro.sendMessage(m.chat, { text: `❌ Gagal memproses Python ML untuk PDF.\nError python3: ${error.message}\n\nError python: ${err2.message}` }, { quoted: m });
                    }
                    generatePdf(stdout2);
                });
                return;
            }
            generatePdf(stdout);
        });

        function generatePdf(outputStr) {
            try {
                const data = JSON.parse(outputStr);
                if (data.error) {
                    return hydro.sendMessage(m.chat, { text: `⚠️ ${data.error}` }, { quoted: m });
                }

                const n = data.n;
                const regAll = data.regAll;
                const a = regAll.a;
                const b = regAll.b;
                const avgMessages = regAll.avg.toFixed(2);
                const sumY = data.totalAll;

                const predict = (daysAhead) => {
                    let val = Math.round(a + (b * (n + daysAhead)));
                    return val > 0 ? val : Math.round(regAll.avg);
                };

                const PDFDocument = require('pdfkit');
                const doc = new PDFDocument({ margin: 50, size: 'A4' });
                let chunks = [];
                doc.on('data', chunk => chunks.push(chunk));

                doc.on('end', () => {
                    const resultBuffer = Buffer.concat(chunks);
                    hydro.sendMessage(m.chat, {
                        document: resultBuffer,
                        mimetype: 'application/pdf',
                        fileName: 'Laporan_Prediksi_SVR_Bot.pdf',
                        caption: '📄 *LAPORAN PDF SELESAI*\n\nSiap dilampirkan untuk tugasmu! (Proses menggunakan Python Scikit-Learn)'
                    }, { quoted: m });
                });

                doc.fontSize(18).text('LAPORAN STUDI KASUS MACHINE LEARNING (SVR)', { align: 'center', underline: true });
                doc.moveDown();
                doc.fontSize(14).text('Topik: Prediksi Load Trafik Pesan Bot Menggunakan Support Vector Regression', { align: 'center' });
                doc.moveDown(2);

                doc.fontSize(12).text('1. Latar Belakang');
                doc.fontSize(11).text('Dokumen ini berisi hasil analisis prediksi load trafik pada server chatbot berdasarkan rekaman data riil interaksi pengguna. Prediksi dilakukan menggunakan model Support Vector Regression (SVR) Linear Kernel dengan library scikit-learn (Python).');
                doc.moveDown();

                doc.fontSize(12).text('2. Statistik Data Riil (Dataset)');
                doc.fontSize(11).text(`- Total hari diobservasi (n) : ${n} hari`);
                doc.text(`- Total keseluruhan pesan (Y) : ${sumY} pesan`);
                doc.text(`- Rata-rata pesan per hari : ${avgMessages} pesan/hari`);
                doc.text(`- Tren Kenaikan (Slope / b) : ${b.toFixed(2)} pesan/hari`);
                doc.moveDown();

                doc.fontSize(12).text('3. Rumus dan Model Matematis SVR');
                doc.fontSize(11).text('Persamaan garis yang dihasilkan oleh Support Vectors: Y = a + bX');
                doc.text(`Nilai Bobot/Weight (b) : ${b.toFixed(4)}`);
                doc.text(`Nilai Bias/Intercept (a) : ${a.toFixed(4)}`);
                doc.text(`Sehingga persamaan linear SVR: Y = ${a.toFixed(2)} + ${b.toFixed(2)}X`);
                doc.moveDown();

                doc.fontSize(12).text('3. Grafik Analisis & Tren');
                if (data.plot_path && fs.existsSync(data.plot_path)) {
                    doc.image(data.plot_path, { width: 450, align: 'center' });
                    doc.moveDown(1);
                } else {
                    doc.fontSize(10).fillColor('red').text('(Grafik gagal di-generate oleh matplotlib)').fillColor('black');
                    doc.moveDown(1);
                }

                doc.fontSize(12).text('4. Hasil Prediksi ke Depan');
                doc.fontSize(11).text(`- Prediksi 1 hari ke depan: ${predict(1)} pesan`);
                doc.text(`- Prediksi 3 hari ke depan: ${predict(3)} pesan`);
                doc.text(`- Prediksi 1 minggu (7 hari): ${predict(7)} pesan`);
                doc.text(`- Prediksi 2 minggu (14 hari): ${predict(14)} pesan`);
                doc.text(`- Prediksi 1 bulan (30 hari): ${predict(30)} pesan`);
                doc.text(`- Prediksi 3 bulan (90 hari): ${predict(90)} pesan`);
                doc.text(`- Prediksi 6 bulan (180 hari): ${predict(180)} pesan`);
                doc.moveDown();

                doc.fontSize(12).text('5. Kesimpulan & Rekomendasi Hardware');
                doc.fontSize(11).text(`Berdasarkan analisis Machine Learning SVR, kami melakukan estimasi waktu kapan perangkat hosting (STB) perlu di-upgrade. Asumsi batas aman kapasitas STB saat ini adalah ${data.stbLimit} pesan/hari.`);

                if (b <= 0) {
                    doc.text(`Kesimpulan: Trafik saat ini cenderung stabil atau menurun. Belum diperlukan upgrade STB dalam waktu dekat.`);
                } else {
                    const targetX = (data.stbLimit - a) / b;
                    const daysRemaining = Math.ceil(targetX - n);

                    if (daysRemaining <= 0) {
                        doc.fillColor('red').text(`Kesimpulan: KRITIS! Load trafik saat ini telah melampaui kapasitas aman STB (${data.stbLimit} pesan/hari). Sangat direkomendasikan untuk SEGERA melakukan upgrade device hosting agar bot tidak mengalami lag/downtime.`).fillColor('black');
                    } else {
                        doc.text(`Kesimpulan: Load trafik diperkirakan akan menyentuh batas kapasitas aman STB dalam waktu kurang lebih ${daysRemaining} hari lagi (Terhitung dari observasi terakhir).`);
                        doc.text(`Rekomendasi: Disarankan untuk menyiapkan anggaran dan merencanakan upgrade STB atau migrasi VPS sebelum ${daysRemaining} hari ke depan untuk menjaga stabilitas bot.`);
                    }
                }
                doc.moveDown(2);

                doc.fontSize(10).fillColor('gray').text('Di-generate otomatis oleh Bot via Scikit-Learn Python SVR', { align: 'center' });

                doc.end();
            } catch (err) {
                hydro.sendMessage(m.chat, { text: `Gagal membuat dokumen PDF: ${err.message}` }, { quoted: m });
            }
        }
    }
};
