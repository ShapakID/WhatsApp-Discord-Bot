const axios = require('axios');

module.exports = {
    name: 'donate',
    aliases: ['donasi', 'sedekah'],
    category: 'menu',
    description: 'Donasi untuk mendukung bot via Pakasir',
    execute: async (hydro, m, args, text) => {
        if (!global.activeDonationsWA) global.activeDonationsWA = new Set();
        if (global.activeDonationsWA.has(m.sender)) {
            return hydro.sendMessage(m.chat, { text: '❌ *Sabar ya!* Kamu masih memiliki QRIS donasi yang belum dibayar. Silakan bayar dulu atau tunggu 15 menit hingga QRIS sebelumnya kadaluarsa.' }, { quoted: m });
        }

        const amount = parseInt(args[0]);
        const SLUG = global.pakasirSlug;
        const API_KEY = global.pakasirApiKey;

        if (!amount || isNaN(amount) || amount < 1000) {
            return hydro.sendMessage(m.chat, { text: '❌ Masukkan nominal donasi yang valid! Contoh: `.donate 10000` (minimal 1000)' }, { quoted: m });
        }
        if (amount > 10000000) {
            return hydro.sendMessage(m.chat, { text: '❌ Nominal terlalu besar! Maksimal donasi dalam 1x transaksi adalah Rp 10.000.000 untuk mencegah spam.' }, { quoted: m });
        }

        global.activeDonationsWA.add(m.sender);
        const orderId = `DONASI-WA-${Date.now()}`;

        try {
            // Mencoba generate QRIS via API
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: SLUG,
                order_id: orderId,
                amount: amount,
                api_key: API_KEY
            });

            if (response.data && response.data.payment) {
                const payment = response.data.payment;
                const qrString = payment.payment_number;

                // Gunakan QuickChart untuk bikin gambar QR code
                const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrString)}&size=400`;

                const caption = `🙏 *Terima Kasih atas Niat Baikmu!*\n\nSilakan scan QRIS di atas untuk berdonasi sebesar *Rp ${payment.total_payment.toLocaleString('id-ID')}*.\n\nAtau kamu juga bisa klik link ini untuk bayar dengan metode lain (E-Wallet/VA):\n🔗 https://app.pakasir.com/pay/${SLUG}/${amount}?order_id=${orderId}\n\n_Order ID: ${orderId}_`;

                const sentMessage = await hydro.sendMessage(m.chat, {
                    image: { url: qrImageUrl },
                    caption: caption
                }, { quoted: m });

                // Polling status transaksi tiap 3 detik
                const checkInterval = setInterval(async () => {
                    try {
                        const statusRes = await axios.get(`https://app.pakasir.com/api/transactiondetail?project=${SLUG}&amount=${amount}&order_id=${orderId}&api_key=${API_KEY}`);
                        if (statusRes.data && statusRes.data.transaction) {
                            const status = statusRes.data.transaction.status;
                            if (status === 'completed') {
                                clearInterval(checkInterval);
                                global.activeDonationsWA.delete(m.sender);
                                // Hapus pesan QRIS
                                await hydro.sendMessage(m.chat, { delete: sentMessage.key });
                                // Kirim pesan berhasil
                                await hydro.sendMessage(m.chat, {
                                    text: `✅ *Donasi Berhasil Diterima!*\n\nTerima kasih banyak atas donasimu sebesar *Rp ${amount.toLocaleString('id-ID')}*! ❤️\n\n_Order ID: ${orderId}_`
                                });


                            } else if (status === 'failed' || status === 'expired' || status === 'canceled') {
                                clearInterval(checkInterval);
                                global.activeDonationsWA.delete(m.sender);
                                await hydro.sendMessage(m.chat, { delete: sentMessage.key });
                                await hydro.sendMessage(m.chat, {
                                    text: `❌ *Donasi Dibatalkan / Kadaluarsa*\n\nPembayaran donasi sebesar *Rp ${amount.toLocaleString('id-ID')}* tidak diselesaikan.\n\n_Order ID: ${orderId}_`
                                });
                            }
                        }
                    } catch (err) {
                        // Abaikan jika API error, lanjut cek nanti
                    }
                }, 3000);

                // Berhenti polling setelah 15 menit
                setTimeout(() => {
                    clearInterval(checkInterval);
                    global.activeDonationsWA.delete(m.sender);
                }, 15 * 60 * 1000);

                return sentMessage;
            }
        } catch (error) {
            global.activeDonationsWA.delete(m.sender);
            console.error('Pakasir API WA Error:', error.response ? error.response.data : error.message);

            // Fallback kalau API error atau project slug belum diisi/salah
            const paymentUrl = `https://app.pakasir.com/pay/${SLUG}/${amount}?order_id=${orderId}`;
            const fallbackCaption = `🙏 *Terima Kasih atas Niat Baikmu!*\n\nSilakan klik link di bawah ini untuk melanjutkan pembayaran donasi sebesar *Rp ${amount.toLocaleString('id-ID')}*:\n\n🔗 ${paymentUrl}\n\nSetiap donasi sangat berarti untuk kelangsungan bot ini. ❤️\n\n_Order ID: ${orderId}_`;

            return hydro.sendMessage(m.chat, { text: fallbackCaption }, { quoted: m });
        }
    }
};
