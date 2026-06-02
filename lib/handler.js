const fs = require('fs');
const path = require('path');
const { modul } = require('./module'); 
const { chalk } = modul;

function loadCommands(hydro) {
    hydro.commands = new Map();
    const cmdDir = path.join(__dirname, '../Command_WhatsApp');

    if (!fs.existsSync(cmdDir)) fs.mkdirSync(cmdDir);

    fs.readdirSync(cmdDir).forEach(category => {
        const catPath = path.join(cmdDir, category);
        
        if (fs.statSync(catPath).isDirectory()) {
            const commandFiles = fs.readdirSync(catPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                loadSingleCommand(hydro, catPath, file);
            }

            // Pantau folder untuk deteksi file baru atau update
            fs.watch(catPath, (eventType, filename) => {
                if (filename && filename.endsWith('.js')) {
                    const filePath = path.join(catPath, filename);
                    
                    if (fs.existsSync(filePath)) {
                        // Cek apakah ini file baru (belum ada di cache)
                        if (!require.cache[require.resolve(filePath)]) {
                            console.log(chalk.greenBright(`[ NEW COMMAND ] Kedetect command baru nih: '${filename}'`));
                        } else {
                            console.log(chalk.yellowBright(`[ UPDATE COMMAND ] '${filename}'`));
                        }
                        loadSingleCommand(hydro, catPath, filename);
                    }
                }
            });
        }
    });
    
    console.log(`  Berhasil memuat ${hydro.commands.size} command!`);
}

function loadSingleCommand(hydro, catPath, file) {
    const filePath = path.join(catPath, file);
    try {
        if (require.cache[require.resolve(filePath)]) {
            delete require.cache[require.resolve(filePath)];
        }
        const command = require(filePath);
        if (command.name) {
            hydro.commands.set(command.name, command);
        }
    } catch (e) {
        console.log(`Error pas load/update ${file}:`, e.message);
    }
}

module.exports = { loadCommands };