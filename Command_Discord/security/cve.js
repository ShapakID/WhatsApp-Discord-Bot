// Command_Discord/security/cve.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');

async function translateToId(text) {
    try {
        // Potong max 1000 karakter biar aman dari limit URL
        const safeText = text.substring(0, 1000);
        const res = await axios.get('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=id&dt=t&q=' + encodeURIComponent(safeText));
        if (res.data && res.data[0]) {
            return res.data[0].map(s => s[0]).join('');
        }
    } catch (e) {
        console.error('Error translate:', e.message);
    }
    return text.substring(0, 1000) + '...'; // fallback
}

module.exports = {
    name: 'cve',
    async execute(message, args) {
        const isOwner = message.author.id === '1202397666835701830';
        const isAdmin = message.member && message.member.permissions.has(PermissionsBitField.Flags.Administrator);
        if (!isOwner && !isAdmin) {
            return message.reply('❌ Command ini cuma bisa dipake sama Admin server atau Owner bot!');
        }

        if (!args || args.length === 0) {
            return message.reply('Harap berikan ID CVE! Contoh: `.cve CVE-2021-44228`');
        }

        const cveId = args[0].toUpperCase();
        if (!cveId.startsWith('CVE-')) {
            return message.reply('Format ID CVE salah. Harus berawalan "CVE-". Contoh: `CVE-2021-44228`');
        }

        const loadingMsg = await message.reply(`🔍 Mencari informasi untuk **${cveId}**...`);

        try {
            const response = await axios.get(`https://cveawg.mitre.org/api/cve/${cveId}`);
            const data = response.data;

            if (!data || data.error || !data.containers) {
                return loadingMsg.edit(`❌ Informasi untuk **${cveId}** tidak ditemukan atau belum dipublikasi.`);
            }

            const cna = data.containers?.cna || {};
            const adp = data.containers?.adp || [];

            // Nama CVE / Title
            const cveTitle = cna.title || "Tidak ada judul spesifik";

            // Deskripsi
            const descriptions = cna.descriptions || [];
            let description = 'Tidak ada deskripsi.';
            const enDesc = descriptions.find(d => d.lang === 'en');
            if (enDesc) {
                description = enDesc.value;
            } else if (descriptions.length > 0) {
                description = descriptions[0].value;
            }

            // Translate Deskripsi
            const translatedDesc = await translateToId(description);

            // CVSS Score (cari dari adp metrics atau cna metrics)
            let cvssMetrics = null;
            for (const item of adp) {
                if (item.metrics) {
                    const m = item.metrics.find(metric => metric.cvssV3_1 || metric.cvssV3_0 || metric.cvssV2_0 || metric.cvssV4_0);
                    if (m) {
                        cvssMetrics = m.cvssV4_0 || m.cvssV3_1 || m.cvssV3_0 || m.cvssV2_0;
                        break;
                    }
                }
            }
            if (!cvssMetrics && cna.metrics) {
                const m = cna.metrics.find(metric => metric.cvssV3_1 || metric.cvssV3_0 || metric.cvssV2_0 || metric.cvssV4_0);
                if (m) {
                    cvssMetrics = m.cvssV4_0 || m.cvssV3_1 || m.cvssV3_0 || m.cvssV2_0;
                }
            }

            const baseScore = cvssMetrics?.baseScore || 'N/A';
            const severity = cvssMetrics?.baseSeverity || 'N/A';

            // Referensi
            const references = cna.references || [];
            let refsText = references.slice(0, 5).map((r, i) => `[Referensi ${i + 1}](${r.url})`).join(' | ');
            if (!refsText) refsText = 'Tidak ada referensi.';

            let embedColor = '#808080';
            const sev = severity.toUpperCase();
            if (sev === 'CRITICAL') embedColor = '#ff0000';
            else if (sev === 'HIGH') embedColor = '#ff8c00';
            else if (sev === 'MEDIUM') embedColor = '#ffff00';
            else if (sev === 'LOW') embedColor = '#00ff00';

            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(`🚨 CVE ALERTS`)
                .setURL(`https://nvd.nist.gov/vuln/detail/${cveId}`)
                .addFields(
                    { name: '🏷️ Nama CVE', value: `**${cveId}**\n${cveTitle}`, inline: false },
                    { name: '📊 Scor', value: `**${baseScore}** (${severity})`, inline: true },
                    { name: '📖 Penjelasan (Biar bisa baca)', value: translatedDesc, inline: false },
                    { name: '🔗 Referensi', value: refsText, inline: false }
                )
                .setFooter({ text: 'Data dari MITRE CVE API • Diterjemahkan Otomatis' })
                .setTimestamp();

            await loadingMsg.edit({ content: null, embeds: [embed] });

        } catch (error) {
            console.error('CVE Command Error:', error);
            if (error.response && error.response.status === 404) {
                loadingMsg.edit(`❌ CVE **${cveId}** tidak ditemukan di database.`);
            } else {
                loadingMsg.edit('Waduh, ada error pas ngambil data CVE nih. Coba lagi nanti ya!');
            }
        }
    }
};
