const fs = require('fs');
const PDFDocument = require('pdfkit');

async function run() {
    try {
        const buffer = fs.readFileSync('media/menu.jpg');
        const resultBuffer = await new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 0, size: 'A4' });
            let chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            try {
                doc.image(buffer, 0, 0, { fit: [595.28, 841.89], align: 'center', valign: 'center' });
            } catch (imgErr) {
                reject(new Error("Format gambar rusak atau tidak bisa diproses PDFKit."));
            }
            doc.end();
        });
        console.log("PDF Created successfully, size:", resultBuffer.length);
    } catch (e) {
        console.error("FAILED:", e);
    }
}
run();
