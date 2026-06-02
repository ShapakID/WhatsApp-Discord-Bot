const play = require('play-dl');

async function getAuth() {
    console.log("Membuat autentikasi untuk play-dl...");
    try {
        await play.authorization();
        console.log("\nSelesai! Sekarang restart bot kamu.");
    } catch (e) {
        console.error("Gagal buat auth:", e);
    }
}
getAuth();
