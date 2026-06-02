const chalk = require("chalk")
const fs = require("fs")

// ======================== Default True/False ===================== \\

global.autosholat = true // true = aktif, false = mati, mengatur otomatis mengirim notif
global.welcome = true // true = aktif, false = mati, mengatur notif pesan ketika ada yang masuk grup
global.left = true // true = aktif, false = mati, mengatur notif pesan ketika ada yang keluar grup
global.groupinfo = true // true = aktif, false = mati, mengatur notif pesan ketika ada perubahan di grup (nama, deskripsi, foto)

// ======================== Setting Menu & Media ===================== \\

global.prefix = ['.']
global.channel = 'ISI_ID_CHANNEL_DISINI@newsletter' // GANTI DENGAN ID CHMU KALO ADA
global.channeln = 'ISI_NAMA_CHANNEL_DISINI' // GANTI DENGAN NAMA CH MU
global.thumbnail = './media/menu.mp4'
global.music = './media/menu.mp3'

// ======================== Info Owner ===================== \\
global.ownername = 'ISI_NAMA_OWNER_DISINI'
global.adminbot = ['ISI_NOMOR_ADMIN_DISINI']; // Isi nomor temanmu yang jadi admin bot
global.driveFolderId = 'ISI_ID_FOLDER_DRIVE_DISINI'; // ID folder paling luar di Drive kamu

global.owner = ['ISI_NOMOR_OWNER_DISINI']
global.ownernomer = 'ISI_NOMOR_OWNER_DISINI'
global.ownernumber = 'ISI_NOMOR_OWNER_DISINI'
global.ownerNumber = ["ISI_NOMOR_OWNER_DISINI@s.whatsapp.net"]
global.creator = "ISI_NOMOR_OWNER_DISINI@s.whatsapp.net"
global.ig = '@username_ig'
global.tele = 'username_tele'
global.ttowner = '@username_tt'
global.socialm = 'GitHub: -'
global.location = 'Indonesia'
global.ownerweb = "" // Ganti 

// ======================== Info Bot ===================== \\
global.botname = "Nama Bot Kamu"
global.botnumber = 'ISI_NOMOR_BOT_DISINI'
global.wagc = "https://chat.whatsapp.com/xxxxx"
global.saluran = "https://whatsapp.com/channel/xxxxx"
global.discordToken = 'ISI_TOKEN_DISCORD_DISINI'
global.themeemoji = '🏞️'
global.wm = "Nama Bot ||| WhatsApps Bots"
global.botscript = 'https://github.com/username/repo'
global.packname = "Nama Sticker Pack"
global.author = "\n\n\n\n\nDibuat Oleh Author\nNo hape/wa : ISI_NOMOR_DISINI"
global.sessionName = 'session_name'
global.hituet = 0

// ======================== API Keys ===================== \\
global.pakasirSlug = 'ISI_SLUG_PAKASIR_DISINI'; // Slug / nama project Pakasir
global.pakasirApiKey = 'ISI_API_KEY_PAKASIR_DISINI'; // API Key Pakasir
global.domain = 'https://panel.kamu.com'; // Domain Panel 
global.btc = 'shapak'
global.lolkey = 'ISI_API_KEY_LOLHUMAN_DISINI'
global.apikey = 'ISI_API_KEY_PTLA_DISINI'; // PLTA Panel
global.email = 'emailkamu@gmail.com' // Domain email user
global.egg = '15'; // ID Egg
global.nestid = '5'; // ID Nest
global.loc = '1'; // ID Location
global.nodeid1 = [1]; // ID Node
global.betabotzapi = 'ISI_API_KEY_BETABOTZ_DISINI';

// ======================== Respon Bot ===================== \\
global.mess = {
    wait: "*_Tunggu sebentar ya kak ^~^*",
    success: "Yay! Bot berhasil 🎉",
    on: "Yay! Nyala nih! 😝",
    off: "Ahh! Mati deh.. 😴",
    query: {
        text: "Teksnya mana? Aku kan gabisa baca pikiran kaka 😉",
        link: "Linknya dongg.. Aku gabisa tanpa link 😖",
        image: "Gambarnya mana nih? jahat banget engga ngasi:<"
    },
    error: {
        fitur: "Whoops! Eror nih.. laporkan ke owner agar diperbaiki 🙏",
    },
    only: {
        group: "Eh, Kak! Fitur ini bisanya buat grup nihh 🫂",
        private: "Eh, Kak! Fitur ini cuman bisa dipake chat pribadi! 🌚",
        owner: "Hanya untuk sang *Raja* 👑",
        admin: "Fitur ini cuman bisa dipake admin grup yah! 🥳",
        badmin: "Waduh! Aku butuh jadi admin agar bisa menggunakan fitur ini 🤯",
        premium: "Kak, ini fitur premium loh! 🤫",
    },
    replyimg: { // Ganti dengan gambar yang lain ya, sesuaikan dengan foto yang diinginkan
        tolak: "https://raw.githubusercontent.com/AhmadAkbarID/media/main/replytolak.png",
        query: "https://raw.githubusercontent.com/AhmadAkbarID/media/main/replyquery.png",
        success: "https://raw.githubusercontent.com/AhmadAkbarID/media/main/replysuccess.png",
        fail: "https://raw.githubusercontent.com/AhmadAkbarID/media/main/replyfail.png",
        wait: "https://raw.githubusercontent.com/AhmadAkbarID/media/main/replywait.png",
        limit: "https://raw.githubusercontent.com/AhmadAkbarID/media/main/replylimit.png"
    }
}

// ======================== Auto Reload File ===================== \\
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update '${__filename}'`))
    delete require.cache[file]
    require(file) // YEY
})
