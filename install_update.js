const fs = require('fs');

let c = fs.readFileSync('WhatsApp/hydro.js', 'utf8');

c = c.replace(/switch \(command\) \{[\s\S]*?\} \/\/ End Switch/g, `
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
                } catch(err) { 
                    console.error(err); 
                    reply(\`Error: \${err.message}\`); 
                } 
            } 
        }
`);

// Add the custom session initializations
const sessionVars = `
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
`;

c = c.replace(/if \(\!global\.db\.settings\) global\.db\.settings = \{\}/, sessionVars);

fs.writeFileSync('WhatsApp/hydro.js', c);


let indexJs = fs.readFileSync('WhatsApp/index.js', 'utf8');

// Add command loader
if (!indexJs.includes('require(\'../lib/handler\')')) {
    indexJs = indexJs.replace(/require\(['"]\.\/settings['"]\)/, 'require(\'../settings\');\nconst { loadCommands } = require(\'../lib/handler\');');
}
if (!indexJs.includes('loadCommands(hydro)')) {
    indexJs = indexJs.replace(/hydro\.ev\.on\('creds\.update', saveCreds\)/, 'hydro.ev.on(\'creds.update\', saveCreds);\n    loadCommands(hydro);');
}

fs.writeFileSync('WhatsApp/index.js', indexJs);

console.log('Update complete!');
