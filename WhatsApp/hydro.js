/*
• SCRIPT INI GRATIS 100%
• BEBAS RECODE 
• JANGAN DI JUAL
*/

require('./settings');
require('./lib/listmenu');

// ====== REQUIRE AREA & LIB START ======

const {
    modul
} = require('./lib/module');
const {
    runtime,
    formatp,
    getSizeMedia,
    sleep,
    axiosss,
    getMenuList,
    assertInstalled,
    listbut2,
    supabase,
    HydroFitur,
    groupStatus,
    getRandom,
    getBuffer
} = require('./lib/function');
const {
    initDatabase,
    getLimitCost,
    checkLimit,
    useLimit,
    cmdRegister,
    cmdUnregister,
    cmdProfile,
    cmdSetDaftarMode
} = require('./lib/database');
const {
    makeBrat,
    makeBratVid,
    toSticker,
    makeQC,
    addExif,
    BALogo,
    makeStoryIG,
    makeIQC
} = require('./lib/maker');
const {
    searchDaerah
} = require('./lib/jadwalsholat');
const {
    antilinkDetector
} = require('./lib/protect');
const {
    gameCasinoSolo,
    gameTebakLagu,
    checkTebakLagu,
    gameTebakKata,
    checkTebakKata,
    gameTebakGambar,
    checkTebakGambar,
    gameTebakTokoh,
    checkTebakTokoh,
    gameTekaTeki,
    checkTekaTeki,
    gameAsahOtak,
    checkAsahOtak,
    gameCakLontong,
    checkCakLontong,
    gameFamily100,
    checkFamily100,
    gameSiapaAku,
    checkSiapaAku,
    gameSusunKata,
    checkSusunKata,
    gameTebakBendera,
    checkTebakBendera,
    gameTebakKabupaten,
    checkTebakKabupaten,
    gameTebakKalimat,
    checkTebakKalimat,
    gameTebakKimia,
    checkTebakKimia,
    gameTebakLirik,
    checkTebakLirik,
    gameTebakTebakan,
    checkTebakTebakan,
    gameChess,
    checkChess
} = require('./lib/games');
const {
    gameDaily
} = require('./lib/rpg')
const {
    antibot,
    antibotSettings,
    saveAntibot,
    saveAntibotSettings,
    handleAntibot,
    commandAntibot
} = require('./lib/antibot');
const {
    loadReseller,
    saveReseller,
    loadCadmin,
    saveCadmin,
    PLANS,
    PLAN_KEYS,
    getApi,
    sendServerPicker,
    checkOwnerPending,
    execCserver,
    execSpec,
    execCuser,
    execCadmin,
    checkCooldown,
    setCooldown
} = require('./lib/cpanel')
const {
    askGemini
} = require('./lib/aistudio');

// ====== LIB END & CONST START ======

const {
    axios,
    baileys,
    util,
    exec,
    performance,
    os,
    moment,
    crypto,
    fs,
    yts,
    path,
    chalk,
    QuickChart
} = modul;
const {
    BufferJSON,
    WA_DEFAULT_EPHEMERAL,
    generateWAMessageFromContent,
    downloadContentFromMessage,
    extractImageThumb,
    proto,
    generateWAMessageContent,
    generateWAMessage,
    prepareWAMessageMedia,
    areJidsSameUser,
    getContentType,
    generateForwardMessageContent
} = baileys;

// ====== MODULE END & SCRAPE START ======

const RemoveBG = () => { };
const tiktokDl = () => { };
const igdl = () => { };
const mathgpt = () => { };
const FeloClient = class { };
const chatex = () => { };
const ReactChannel = () => { };
const searchPinterestAPI = () => { };
const searchDafont = () => { };
const searchSpotify = () => { };
const ytmp3 = () => { };
const ytmp4 = () => { };
const spotifyScrape = () => { };
const hdvideo = () => { };
const hdr = () => { };
const capcutDownload = () => { };

// ====== SCRAPE END & REQUIRE AREA ======

if (!global.db) {
    if (fs.existsSync('./database/database.json')) {
        global.db = JSON.parse(fs.readFileSync('./database/database.json', 'utf-8'))
    } else {
        global.db = { users: {}, groups: {}, chats: {}, settings: {}, others: {} }
    }
}

if (!global.db.settings) global.db.settings = {};
if (!global.db.mk_si_2025) global.db.mk_si_2025 = [];
if (!global.db.lists) global.db.lists = {};
if (!global.db.tugas) global.db.tugas = {};
if (!global.editSessions) global.editSessions = {};
if (!global.buatListSessions) global.buatListSessions = {};
if (!global.registerSessions) global.registerSessions = {};
if (!global.isiDataSessions) global.isiDataSessions = {};
if (!global.editListSessions) global.editListSessions = {};
if (!global.uploadSessions) global.uploadSessions = {};
if (!global.buatTugasSessions) global.buatTugasSessions = {};
if (!global.kumpulTugasSessions) global.kumpulTugasSessions = {};
if (!global.joinRequests) global.joinRequests = {};
if (!global.adminbot) global.adminbot = [];
if (!global.pdfSessions) global.pdfSessions = {};


// ==========================================================

module.exports = hydro = async (hydro, m, chatUpdate, store) => {
    try {
        if (!m || !m.message) return;

        m.chat = m.key.remoteJid || '';
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = m.key.fromMe ? (hydro.user.id.split(':')[0] + '@s.whatsapp.net' || hydro.user.id) : (m.key.participant || m.key.remoteJid || '');
        m.pushName = m.pushName || "Misterius";

        m.mtype = getContentType(m.message);
        if (m.mtype === 'ephemeralMessage' || m.mtype === 'viewOnceMessage' || m.mtype === 'viewOnceMessageV2') {
            m.message = m.message[m.mtype].message;
            m.mtype = getContentType(m.message);
        }

        // ----------------------------------------------------

        m.mtype = getContentType(m.message);
        if (m.mtype === 'ephemeralMessage' || m.mtype === 'viewOnceMessage' || m.mtype === 'viewOnceMessageV2') {
            m.message = m.message[m.mtype].message;
            m.mtype = getContentType(m.message);
        }

        // ----------------------------------------------------

        const msgHelper = require('./lib/src/message')(hydro, m, chatUpdate, store);
        m = msgHelper.m;
        const { reply, replytolak, replyquery, replysuccess, replyfail, replywait, appenTextMessage, react, replylimit, replywarn } = msgHelper;
        const rawContext = m.message?.[m.mtype]?.contextInfo;

        if (rawContext && rawContext.quotedMessage) {
            let qMsg = rawContext.quotedMessage;

            if (qMsg.viewOnceMessageV2) qMsg = qMsg.viewOnceMessageV2.message;
            else if (qMsg.viewOnceMessage) qMsg = qMsg.viewOnceMessage.message;
            else if (qMsg.viewOnceMessageV2Extension) qMsg = qMsg.viewOnceMessageV2Extension.message;

            let qType = getContentType(qMsg) || Object.keys(qMsg)[0];

            m.quoted = {
                key: {
                    remoteJid: m.chat,
                    fromMe: rawContext.participant === hydro.user.id.split(':')[0] + '@s.whatsapp.net',
                    id: rawContext.stanzaId,
                    participant: rawContext.participant
                },
                message: qMsg,
                mtype: qType,
                msg: qMsg[qType],
                sender: rawContext.participant,
                text: qMsg.conversation || qMsg[qType]?.text || qMsg[qType]?.caption || '',
                fakeObj: {
                    key: {
                        remoteJid: m.chat,
                        fromMe: rawContext.participant === hydro.user.id.split(':')[0] + '@s.whatsapp.net',
                        id: rawContext.stanzaId,
                        participant: rawContext.participant
                    },
                    message: qMsg
                },
                download: async () => {
                    let mediaType = qType.replace('Message', '');
                    let stream = await downloadContentFromMessage(qMsg[qType], mediaType);
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }
                    return buffer;
                }
            };
        }

        m.download = async () => {
            let mediaType = m.mtype.replace('Message', '');
            let stream = await downloadContentFromMessage(m.message[m.mtype], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            return buffer;
        };

        // ----------------------------------------------------

        const type = m.mtype;

        let body = '';
        if (m.mtype === 'interactiveResponseMessage' || m.message?.interactiveResponseMessage) {
            try {
                let interMsg = m.message.interactiveResponseMessage || m.message[m.mtype];
                body = JSON.parse(interMsg.nativeFlowResponseMessage.paramsJson).id;
            } catch (e) {
                body = '';
            }
        } else {
            body = (m.mtype === 'conversation') ? m.message.conversation :
                (m.mtype === 'imageMessage') ? m.message.imageMessage?.caption :
                    (m.mtype === 'videoMessage') ? m.message.videoMessage?.caption :
                        (m.mtype === 'extendedTextMessage') ? m.message.extendedTextMessage?.text :
                            (m.mtype === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage?.selectedButtonId :
                                (m.mtype === 'listResponseMessage') ? m.message.listResponseMessage?.singleSelectReply?.selectedRowId :
                                    (m.mtype === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage?.selectedId :
                                        m.text || '';
        }

        body = (typeof body === 'string') ? body : '';

        let budy = m.message.conversation || (m.message.extendedTextMessage && m.message.extendedTextMessage.text) || '';

        let groupSettings = m.isGroup ? global.db.groups[m.chat] : null;
        let activePrefixes = (groupSettings && groupSettings.prefix) ? groupSettings.prefix :
            (global.db.settings.prefix ? global.db.settings.prefix : global.prefix);

        if (!Array.isArray(activePrefixes)) activePrefixes = [activePrefixes];

        let matchedPrefix = activePrefixes.slice().sort((a, b) => b.length - a.length).find(p => body.startsWith(p));
        const prefix = matchedPrefix !== undefined ? matchedPrefix : activePrefixes[0];

        const isCmd = body.startsWith(prefix)
        const from = m.chat
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : ""
        const args = body.trim().split(/ +/).slice(1)

        const pushname = m.pushName
        const botNumber = await hydro.decodeJid(hydro.user.id)
        const Ahmad = [...(global.owner || []), global.ownernomer, global.botnumber]
            .map(v => {
                if (!v) return '';
                if (v.includes('@lid')) return v;
                return v.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            })
            .includes(m.sender);

        if (typeof global.db.settings.public === 'undefined') global.db.settings.public = true;
        if (typeof global.db.settings.onlygc === 'undefined') global.db.settings.onlygc = false;
        if (typeof global.db.settings.onlypc === 'undefined') global.db.settings.onlypc = false;
        if (typeof global.db.settings.whitelistMode === 'undefined') global.db.settings.whitelistMode = false;
        if (!Array.isArray(global.db.settings.whitelist)) global.db.settings.whitelist = [];

        const rawId = String(m.key.id || '');
        const baseId = rawId.split('-')[0];

        const isStatusMsg = (m.mtype === 'groupStatusMentionMessage' || m.mtype === 'groupStatusMessageV2');

        if (m.key.fromMe) return;

        if (!isStatusMsg) {
            if (baseId.startsWith('BAE5') || baseId.length === 16) return;

            const isAndroid = baseId.startsWith('3A');
            const isIphone = baseId.startsWith('3EB0');
            const isWeb = baseId.length === 32 && !baseId.match(/[^0-9A-F]/gi);
            const isOwner = Ahmad;

            const isValidUser = isAndroid || isIphone || isWeb || isOwner;
            if (!isValidUser) return;
        }

        if (!global.db.settings.public) {
            if (!Ahmad) return;
        }

        if (global.db.settings.onlygc && !m.isGroup && !Ahmad) return;
        if (global.db.settings.onlypc && m.isGroup && !Ahmad) return;
        if (m.isGroup) {
            if (!global.db.sewa) global.db.sewa = {};
            if (global.db.sewa[m.chat] && global.db.sewa[m.chat].status === 'pending') {
                global.db.sewa[m.chat].status = 'active';
                global.db.sewa[m.chat].expired = Date.now() + global.db.sewa[m.chat].duration;
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                hydro.sendMessage(m.chat, { text: `✅ Berhasil bergabung!\n\nWaktu sewa selama *${global.db.sewa[m.chat].hari} hari* resmi dimulai dari sekarang.` });
            }
        }

        if (global.db.settings.whitelistMode && m.isGroup && !Ahmad) {
            let isSewa = global.db.sewa && global.db.sewa[m.chat] && global.db.sewa[m.chat].status === 'active';
            if (!global.db.settings.whitelist.includes(m.chat) && !isSewa) return;
        }

        const text = args.join(" ")
        const q = text
        const quoted = m.quoted ? m.quoted : m
        const mime = (quoted.msg || quoted).mimetype || ''

        const isMedia = /image|video|sticker|audio/.test(mime)
        const isImage = (type == 'imageMessage')
        const isVideo = (type == 'videoMessage')
        const isAudio = (type == 'audioMessage')
        const isSticker = (type == 'stickerMessage')

        store.groupMetadata = store.groupMetadata || {};
        if (!global._groupFetchLastTime) global._groupFetchLastTime = 0;

        if (m.isGroup) {
            const now = Date.now();
            const cooldown = 5 * 60 * 1000; // 5 menit
            const shouldFetch = Object.keys(store.groupMetadata).length === 0 && (now - global._groupFetchLastTime > cooldown);

            if (shouldFetch) {
                try {
                    store.groupMetadata = await hydro.groupFetchAllParticipating();
                    global._groupFetchLastTime = now;
                } catch (e) {
                    console.log('groupFetchAllParticipating error:', e.message);
                }
            }
        }

        const groupMetadata = m.isGroup
            ? store.groupMetadata[m.chat]
            || (store.groupMetadata[m.chat] = await hydro.groupMetadata(m.chat).catch(e => { }))
            : '';

        const groupName = m.isGroup ? groupMetadata.subject : ''
        const participants = m.isGroup ? await groupMetadata.participants : ''

        if (m.isGroup && m.sender.endsWith("@lid")) {
            const matched = participants.find(p =>
                p.lid === m.sender ||
                p.lid === m.sender.split('@')[0] + '@lid'
            );
            const resolved = matched?.jid || matched?.id;
            if (resolved && resolved.endsWith('@s.whatsapp.net')) {
                m.sender = resolved;
            } else {
                return;
            }
        }

        const groupAdmins = m.isGroup ? participants.filter((v) => v.admin !== null).map((i) => i.jid || i.id) : [];
        const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
        const isGroupAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;
        const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;

        if (m.isGroup && isCmd) {
            if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {}
            if (global.db.groups[m.chat].mute && !isGroupAdmins && !Ahmad) {
                return
            }
        }

        const sender = m.sender
        const senderNumber = sender ? sender.split('@')[0] : ''

        const mentionUser = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
        const mentionByTag = type == 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo != null ? m.message.extendedTextMessage.contextInfo.mentionedJid : []
        const mentionByReply = type == 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo != null ? m.message.extendedTextMessage.contextInfo.participant || '' : ''

        const isChannel = m.chat.endsWith('@newsletter');

        if (fs.existsSync('./database/owner.json')) {
            let extraOwner = JSON.parse(fs.readFileSync('./database/owner.json'));
            extraOwner.forEach(num => {
                if (!global.owner.includes(num)) global.owner.push(num);
            });
        }

        if (m.message && !m.key.fromMe) {
            const timeLog = chalk.green(new Date().toISOString().slice(0, 19).replace('T', ' '));
            const msgLog = chalk.blue(budy || m.mtype);


            if (isChannel) {
                console.log(`
┌───────── [ CHANNEL CHAT LOG ] ─────────┐
│ 🕒 Time      : ${timeLog}
│ 📝 Message   : ${msgLog}
│ 📢 Channel   : ${chalk.magenta(pushname || 'Saluran')} (${chalk.cyan(m.chat)})
└────────────────────────────────────────┘
            `);
            } else if (m.isGroup) {
                console.log(`
┌────────── [ GROUP CHAT LOG ] ──────────┐
│ 🕒 Time      : ${timeLog}
│ 📝 Message   : ${msgLog}
│ 👤 Sender    : ${chalk.magenta(pushname)} (${chalk.cyan(m.sender)})
│ 🏠 Group     : ${chalk.yellow(groupName)} (${chalk.cyan(m.chat)})
└────────────────────────────────────────┘
            `);
            } else {
                console.log(`
┌───────── [ PRIVATE CHAT LOG ] ─────────┐
│ 🕒 Time      : ${timeLog}
│ 📝 Message   : ${msgLog}
│ 👤 Sender    : ${chalk.magenta(pushname)} (${chalk.cyan(m.sender)})
└────────────────────────────────────────┘
            `);
            }
        }

        // ====== FUNCTION AREA ======

        initDatabase(m, isChannel);
        await antilinkDetector(hydro, m, { budy, type, isAdmins, Ahmad, isBotAdmins, sender, senderNumber });
        await handleAntibot(hydro, m, { isAdmins, isBotAdmins, Ahmad, sleep, replyfail, react });
        await checkTebakLagu(hydro, m, budy, global.db);
        await checkTebakKata(hydro, m, budy, global.db);
        await checkTebakGambar(hydro, m, budy, global.db);
        await checkTekaTeki(hydro, m, budy, global.db);
        await checkAsahOtak(hydro, m, budy, global.db);
        await checkCakLontong(hydro, m, budy, global.db);
        await checkFamily100(hydro, m, budy, global.db);
        await checkSiapaAku(hydro, m, budy, global.db);
        await checkSusunKata(hydro, m, budy, global.db);
        await checkTebakBendera(hydro, m, budy, global.db, { replyfail, replyquery, replytolak, replysuccess });
        await checkTebakTokoh(hydro, m, budy, global.db, { replyfail, replyquery, replytolak, replysuccess });
        await checkTebakKabupaten(hydro, m, budy, global.db, { replyfail, replyquery, replytolak, replysuccess });
        await checkTebakKalimat(hydro, m, budy, global.db);
        await checkTebakKimia(hydro, m, budy, global.db);
        await checkTebakLirik(hydro, m, budy, global.db);
        await checkTebakTebakan(hydro, m, budy, global.db);
        await checkChess(hydro, m, budy, { replyfail, replytolak, replysuccess });
        const handledPending = await checkOwnerPending(hydro, m, { Ahmad, prefix, reply, replyfail, react });
        if (handledPending) return;



        // ====== FUNCTION AREA ======
        // ==============================================


        if (isCmd) {
            const cmd = hydro.commands.get(command);
            if (cmd) {
                try {
                    await cmd.execute(hydro, m, args, text, {
                        isGroupAdmins: isAdmins,
                        isOwner: Ahmad,
                        isAdminBot: Ahmad,
                        prefix,
                        pushname,
                        command,
                        store
                    });
                } catch (err) {
                    console.error(err);
                    reply(`Error: ${err.message}`);
                }
            }
        }


        if (budy.startsWith('<')) {
            if (!Ahmad) return;
            try {
                return reply(JSON.stringify(eval(budy.slice(1).trim()), null, '\t'));
            } catch (e) {
                reply(String(e));
            }
        }

        if (budy.startsWith('$')) {
            if (!Ahmad) return reply(global.mess.only.owner);
            exec(budy.slice(1).trim(), (err, stdout) => {
                if (err) return reply(err.toString());
                if (stdout) return reply(util.format(stdout));
            });
        }

        if (budy.startsWith('vv')) {
            if (!Ahmad) return;
            try {
                let evaled = await eval(budy.slice(2).trim());
                if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                await reply(evaled);
            } catch (err) {
                reply(String(err));
            }
        }

        if (budy.startsWith('>')) {
            if (!Ahmad) return;
            try {
                let evaled = await eval(budy.slice(1).trim());
                if (typeof evaled !== 'string') evaled = util.inspect(evaled);
                reply(util.format(evaled));
            } catch (e) {
                reply(util.format(e));
            }
        }

        if (budy.startsWith('uu')) {
            if (!Ahmad) return;
            let qur = budy.slice(2).trim();
            exec(qur, (err, stdout) => {
                if (err) return reply(`${err}`);
                if (stdout) return reply(stdout);
            });
        }

    } catch (err) {
        console.log(util.format(err))
    }
}

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err)
})

// ======================== Auto Reload File ===================== \\
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`[ UPDATE ] '${__filename}'`))
    delete require.cache[file]
    require(file)
})