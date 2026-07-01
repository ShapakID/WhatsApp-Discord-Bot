const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../../../Data/cve_channels.json');
const LAST_SEEN_PATH = path.resolve(__dirname, '../../../Data/cve_last_seen.json');

function loadDb() {
    if (!fs.existsSync(DB_PATH)) {
        try { fs.writeFileSync(DB_PATH, JSON.stringify([])); } catch { }
    }
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch {
        return [];
    }
}

function saveDb(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Failed to save CVE DB:', e.message);
    }
}

function loadLastSeen() {
    if (!fs.existsSync(LAST_SEEN_PATH)) {
        try { fs.writeFileSync(LAST_SEEN_PATH, JSON.stringify([])); } catch { }
    }
    try {
        return JSON.parse(fs.readFileSync(LAST_SEEN_PATH, 'utf8'));
    } catch {
        return [];
    }
}

function saveLastSeen(data) {
    try {
        fs.writeFileSync(LAST_SEEN_PATH, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Failed to save CVE last seen:', e.message);
    }
}

let intervalRef = null;

module.exports = {
    name: 'pingcve',

    // Init function automatically called by discord-handler.js
    init: function (client) {
        if (intervalRef) {
            clearInterval(intervalRef);
        }

        const checkCVE = async () => {
            const channels = loadDb();
            if (channels.length === 0) return; // No active subscriptions

            try {
                const res = await axios.get('https://cve.circl.lu/api/last');
                let cves = res.data;
                if (!cves || !Array.isArray(cves) || cves.length === 0) return;

                let lastSeenCves = loadLastSeen();

                if (lastSeenCves.length === 0) {
                    lastSeenCves = cves.map(c => c.cveMetadata?.cveId || c.id).filter(Boolean);
                    saveLastSeen(lastSeenCves);
                    return; // Initialize cache silently, no broadcast
                }

                const newCves = [];
                for (let c of cves) {
                    const id = c.cveMetadata?.cveId || c.id;
                    if (id && !lastSeenCves.includes(id)) {
                        newCves.push(c);
                    }
                }
                cves = newCves;

                if (cves.length > 0) {
                    // Update cache
                    for (let c of cves) {
                        const id = c.cveMetadata?.cveId || c.id;
                        if (id && !lastSeenCves.includes(id)) lastSeenCves.push(id);
                    }
                    saveLastSeen(lastSeenCves);

                    const cvesToSend = cves.slice(0, 5); // Max 5 per interval to avoid spam

                    for (let cve of cvesToSend) {
                        const cveId = cve.cveMetadata?.cveId || cve.id;
                        const cna = cve.containers?.cna || {};
                        const cveTitle = cna.title || "No specific title provided";

                        const descriptions = cna.descriptions || [];
                        let description = 'No description available.';
                        const enDesc = descriptions.find(d => d.lang === 'en');
                        if (enDesc) description = enDesc.value;
                        else if (descriptions.length > 0) description = descriptions[0].value;

                        // Ensure description is not too long for Discord Embeds
                        if (description.length > 1024) {
                            description = description.substring(0, 1020) + '...';
                        }

                        let baseScore = 'N/A';
                        let severity = 'N/A';

                        if (cve.containers?.adp) {
                            for (let adp of cve.containers.adp) {
                                if (adp.metrics) {
                                    for (let m of adp.metrics) {
                                        const cvss = m.cvssV4_0 || m.cvssV3_1 || m.cvssV3_0 || m.cvssV2_0;
                                        if (cvss && cvss.baseScore) {
                                            baseScore = cvss.baseScore;
                                            severity = cvss.baseSeverity || severity;
                                        }
                                    }
                                }
                            }
                        }
                        if (baseScore === 'N/A' && cna.metrics) {
                            for (let m of cna.metrics) {
                                const cvss = m.cvssV4_0 || m.cvssV3_1 || m.cvssV3_0 || m.cvssV2_0;
                                if (cvss && cvss.baseScore) {
                                    baseScore = cvss.baseScore;
                                    severity = cvss.baseSeverity || severity;
                                }
                            }
                        }

                        const references = cna.references || [];
                        let refsText = references.slice(0, 5).map((r, i) => `[Reference ${i + 1}](${r.url})`).join(' | ');
                        if (!refsText) refsText = 'No references available.';

                        let embedColor = '#808080';
                        const sev = (severity || '').toUpperCase();
                        if (sev === 'CRITICAL') embedColor = '#ff0000';
                        else if (sev === 'HIGH') embedColor = '#ff8c00';
                        else if (sev === 'MEDIUM') embedColor = '#ffff00';
                        else if (sev === 'LOW') embedColor = '#00ff00';

                        const embed = new EmbedBuilder()
                            .setColor(embedColor)
                            .setTitle(`🚨 NEW CVE ALERT: ${cveId}`)
                            .setURL(`https://nvd.nist.gov/vuln/detail/${cveId}`)
                            .addFields(
                                { name: '🏷️ CVE Title', value: cveTitle, inline: false },
                                { name: '📊 Score', value: `**${baseScore}** (${severity})`, inline: true },
                                { name: '📖 Description', value: description, inline: false },
                                { name: '🔗 References', value: refsText, inline: false }
                            )
                            .setFooter({ text: 'Data from MITRE CVE API' })
                            .setTimestamp();

                        // Broadcast to all subscribed channels
                        for (let chId of channels) {
                            const ch = client.channels.cache.get(chId);
                            if (ch) {
                                await ch.send({ content: '🔔 **NEW CVE DETECTED!**', embeds: [embed] }).catch(() => { });
                            }
                        }
                        await new Promise(r => setTimeout(r, 2000));
                    }
                }
            } catch (e) {
                if (e.response && (e.response.status === 503 || e.response.status === 502)) {
                    // Abaikan/sembunyikan error log kalau API servernya lagi down (supaya terminal ngga spam)
                } else if (e.message === 'aborted' || e.code === 'ECONNABORTED' || e.message.includes('timeout')) {
                    // Abaikan error aborted/timeout dari API CIRCL yang kadang lambat
                } else {
                    console.error("[PingCVE] Error interval:", e.message);
                }
            }
        };

        // Run immediately on startup to provide 1 initial proof notification
        checkCVE();
        // Check every 2 minutes
        intervalRef = setInterval(checkCVE, 2 * 60 * 1000);
    },

    async execute(message, args) {
        const isOwner = message.author.id === '1202397666835701830';
        const isAdmin = message.member && message.member.permissions.has(PermissionsBitField.Flags.Administrator);
        if (!isOwner && !isAdmin) {
            return message.reply('❌ This command is restricted to Server Admins or Bot Owner!');
        }

        if (!args || args.length === 0) {
            return message.reply('Use `.pingcve on [Channel_ID/#Channel]` to enable, or `.pingcve off [Channel_ID/#Channel]` to disable.');
        }

        const mode = args[0].toLowerCase();
        let targetChannelId = args[1] || message.channel.id;

        if (targetChannelId.startsWith('<#') && targetChannelId.endsWith('>')) {
            targetChannelId = targetChannelId.slice(2, -1);
        }

        const channels = loadDb();

        if (mode === 'off') {
            if (!channels.includes(targetChannelId)) {
                return message.reply(`Channel <#${targetChannelId}> is not subscribed to CVE notifications.`);
            }
            const updated = channels.filter(id => id !== targetChannelId);
            saveDb(updated);
            return message.reply(`🔕 Auto CVE notifications for <#${targetChannelId}> have been disabled.`);
        }

        if (mode === 'on') {
            if (channels.includes(targetChannelId)) {
                return message.reply(`🔔 Auto CVE notifications are already enabled for <#${targetChannelId}>!`);
            }

            const targetChannel = message.client.channels.cache.get(targetChannelId);
            if (!targetChannel) {
                return message.reply(`❌ Channel with ID **${targetChannelId}** not found or bot lacks access.`);
            }

            channels.push(targetChannelId);
            saveDb(channels);

            return message.reply(`🔔 Success! Auto CVE notifications enabled for <#${targetChannelId}>! The bot will check every 2 minutes and broadcast global updates.`);
        } else {
            return message.reply('Invalid option! Please use `on` or `off`.');
        }
    }
};
