try {
    const { setGlobalDispatcher, Agent } = require('undici');
    setGlobalDispatcher(new Agent({ connect: { rejectUnauthorized: false } }));
} catch (e) {
    // Ignore if undici isn't directly available
}

const readline = require("readline");
const colors = require('colors');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startMenu() {
    console.log(colors.cyan(`
=========================================
      PILIH BOT YANG INGIN DIJALANKAN      
=========================================
1. WhatsApp Saja
2. Discord Saja
3. Keduanya (WA & Discord)
=========================================`));

    const answer = await question(colors.yellow('Masukkan pilihan (1/2/3): '));

    if (answer === '1') {
        console.log(colors.green('\nMemulai WhatsApp Bot...'));
        require('./WhatsApp/index.js');
    } else if (answer === '2') {
        console.log(colors.green('\nMemulai Discord Bot...'));
        require('./Discord/index.js');
    } else if (answer === '3') {
        console.log(colors.green('\nMemulai Keduanya...'));
        require('./Discord/index.js');
        require('./WhatsApp/index.js');
    } else {
        console.log(colors.red('\nPilihan tidak valid! Memulai keduanya secara default...'));
        require('./Discord/index.js');
        require('./WhatsApp/index.js');
    }
}

startMenu();

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err)
});