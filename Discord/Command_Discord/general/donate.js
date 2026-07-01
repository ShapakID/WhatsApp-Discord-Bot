const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'donate',
    aliases: ['donasi', 'sedekah'],
    category: 'general',
    description: 'Donasi untuk mendukung bot via Pakasir',
    async execute(message, args) {
        if (!global.activeDonations) global.activeDonations = new Set();
        if (global.activeDonations.has(message.author.id)) {
            return message.reply({ content: '❌ **Sabar ya!** Kamu masih memiliki QRIS donasi yang belum dibayar. Silakan bayar dulu atau tunggu 15 menit hingga QRIS sebelumnya kadaluarsa.' });
        }

        const amount = parseInt(args[0]);
        const SLUG = global.pakasirSlug;
        const API_KEY = global.pakasirApiKey;

        if (!amount || isNaN(amount) || amount < 1000) {
            return message.reply({ content: '❌ Masukkan nominal donasi yang valid! Contoh: `.donate 10000` (minimal 1000)' });
        }
        if (amount > 10000000) {
            return message.reply({ content: '❌ Nominal terlalu besar! Maksimal donasi dalam 1x transaksi adalah Rp 10.000.000 untuk mencegah spam.' });
        }

        global.activeDonations.add(message.author.id);
        const orderId = `DONASI-DC-${Date.now()}`;

        try {
            // Kita coba buat transaksi QRIS lewat API
            const response = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
                project: SLUG,
                order_id: orderId,
                amount: amount,
                api_key: API_KEY
            });

            if (response.data && response.data.payment) {
                const payment = response.data.payment;
                const qrString = payment.payment_number;

                // Menggunakan QuickChart API untuk mengubah QR string menjadi gambar
                const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrString)}&size=400`;

                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('🙏 Terima Kasih atas Niat Baikmu!')
                    .setDescription(`Silakan scan QRIS di bawah ini untuk berdonasi sebesar **Rp ${payment.total_payment.toLocaleString('id-ID')}**.\n\nAtau kamu juga bisa klik link ini untuk metode pembayaran lain (E-Wallet/VA):\n🔗 [Bayar via Web Pakasir](https://app.pakasir.com/pay/${SLUG}/${amount}?order_id=${orderId})`)
                    .setImage(qrImageUrl)
                    .setFooter({ text: `Order ID: ${orderId} | Kadaluarsa: ${new Date(payment.expired_at).toLocaleString('id-ID')}` });

                const sentMessage = await message.reply({ embeds: [embed] });

                // Polling status transaksi tiap 3 detik
                const checkInterval = setInterval(async () => {
                    try {
                        const statusRes = await axios.get(`https://app.pakasir.com/api/transactiondetail?project=${SLUG}&amount=${amount}&order_id=${orderId}&api_key=${API_KEY}`);
                        if (statusRes.data && statusRes.data.transaction) {
                            const status = statusRes.data.transaction.status;
                            if (status === 'completed') {
                                clearInterval(checkInterval);
                                global.activeDonations.delete(message.author.id);
                                const successEmbed = new EmbedBuilder()
                                    .setColor('#00ff00')
                                    .setTitle('✅ Donasi Berhasil Diterima!')
                                    .setDescription(`Terima kasih banyak atas donasimu sebesar **Rp ${amount.toLocaleString('id-ID')}**! ❤️`)
                                    .setFooter({ text: `Order ID: ${orderId}` });

                                await sentMessage.edit({ embeds: [successEmbed] });


                            } else if (status === 'failed' || status === 'expired' || status === 'canceled') {
                                clearInterval(checkInterval);
                                global.activeDonations.delete(message.author.id);
                                const failedEmbed = new EmbedBuilder()
                                    .setColor('#ff0000')
                                    .setTitle('❌ Donasi Dibatalkan / Kadaluarsa')
                                    .setDescription(`Pembayaran donasi sebesar **Rp ${amount.toLocaleString('id-ID')}** tidak diselesaikan.`)
                                    .setFooter({ text: `Order ID: ${orderId}` });

                                await sentMessage.edit({ embeds: [failedEmbed] });
                            }
                        }
                    } catch (err) {
                        // Abaikan jika API error, lanjut cek nanti
                    }
                }, 3000);

                // Berhenti polling setelah 15 menit (batas QRIS)
                setTimeout(() => {
                    clearInterval(checkInterval);
                    global.activeDonations.delete(message.author.id);
                }, 15 * 60 * 1000);

                return sentMessage;
            }
        } catch (error) {
            global.activeDonations.delete(message.author.id);
            // Kalau API error (misal karena slug salah), fallback pakai link web
            console.error('Pakasir API DC Error:', error.response ? error.response.data : error.message);

            const paymentUrl = `https://app.pakasir.com/pay/${SLUG}/${amount}?order_id=${orderId}`;

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🙏 Terima Kasih atas Niat Baikmu!')
                .setDescription(`Silakan klik link di bawah ini untuk melanjutkan pembayaran donasi sebesar **Rp ${amount.toLocaleString('id-ID')}**:\n\n🔗 [Bayar Donasi](${paymentUrl})\n\nSetiap donasi sangat berarti untuk kelangsungan bot ini. ❤️`)
                .setFooter({ text: `Order ID: ${orderId}` });

            return message.reply({ embeds: [embed] });
        }
    }
};
