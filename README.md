# 🤖 Multi-Platform Bot: Traffic Prediction using SVR
*(Tugas Akhir Mata Kuliah Statistika dan Probabilitas)*

## 📖 Deskripsi Proyek
Proyek ini adalah bot multi-platform (beroperasi di **WhatsApp** dan **Discord**) yang dirancang tidak hanya sebagai asisten virtual biasa, tetapi secara khusus diintegrasikan dengan sistem **Pencatatan Trafik Interaksi Pengguna (Real-time Logger)**. 

Fokus utama dari bot ini adalah untuk memenuhi Tugas Akhir pada mata kuliah **Statistika dan Probabilitas**. Bot secara otomatis mengumpulkan data deret waktu (time series) dari setiap pesan yang masuk. Dataset interaksi tersebut kemudian dianalisis dan digunakan untuk melakukan peramalan (forecasting) menggunakan pendekatan algoritma **Support Vector Regression (SVR)**.

**Fokus Utama Tugas:**
Algoritma Support Vector Regression (SVR) di dalam sistem ini dibangun dan diterapkan untuk memprediksi jumlah interaksi pesan atau kepadatan trafik server pada waktu mendatang. Implementasi logika matematika regresi ini dilakukan langsung di dalam JavaScript (dan/atau bahasa opsional Python), menunjukkan secara riil bagaimana konsep statistika dan probabilitas diterapkan untuk menyelesaikan masalah prediksi sistem.

## ✨ Fitur Utama Bot
1. **Analisis Prediksi Statistika (SVR)**: Menghitung dan memproyeksikan kepadatan trafik bot berdasarkan rekam jejak dataset.
2. **Sistem Logger Real-time Otomatis**: Secara instan mencatat timestamp (waktu, tanggal, jam), ID pengguna, serta tipe obrolan (grup/pribadi) ke dalam file `traffic_log.csv`.
3. **Multi-Device Support**: Berjalan secara mulus di dua platform raksasa: WhatsApp (menggunakan protokol Baileys) dan Discord (menggunakan discord.js).
4. **Fitur Utilitas Ekstra**: Memiliki dukungan perintah pemutar musik, peringatan keamanan (CVE), konverter PDF, sistem donasi via Pakasir, serta sistem pengingat (reminder) jadwal kuliah.

---

## ⚙️ Panduan Instalasi (Detail Ekstra)

### 1. Kebutuhan Sistem (Prasyarat)
Sebelum memasang bot ini, pastikan PC atau VPS (Server) kamu sudah memenuhi kualifikasi berikut:
- **Node.js**: Wajib menggunakan versi **v18.x.x** atau **v20.x.x** (Direkomendasikan versi LTS terbaru).
- **Git**: Diperlukan untuk melakukan proses *cloning* repositori.
- **Python (Minimal v3.9)**: Opsional, sangat dibutuhkan jika mengeksekusi script regresi matematika melalui backend Python (Scikit-Learn/Pandas).
- **FFmpeg**: Dibutuhkan oleh node Discord agar bot bisa memutar atau merender audio/video.

### 2. Kloning Repositori
Buka terminal atau command prompt kamu, lalu jalankan perintah ini:
```bash
git clone https://github.com/UsernameKamu/NamaRepoKamu.git
cd NamaRepoKamu
```

### 3. Instalasi Modul Dependencies
Unduh semua pustaka (*library*) yang dibutuhkan Node.js untuk menjalankan proyek ini:
```bash
npm install
```

### 4. Konfigurasi Kredensial (`settings.js`)
Proyek ini mengamankan API Keys milikmu. Kamu harus melakukan pengaturan sebelum menyalakan bot:
1. Cari file bernama `settings.example.js` di dalam direktori utama.
2. Duplikat atau ubah namanya menjadi `settings.js`.
   ```bash
   cp settings.example.js settings.js
   ```
3. Buka `settings.js` di aplikasi teks editor kesukaanmu (seperti VS Code atau Notepad).
4. Isi bagian yang kosong:
   - `global.discordToken`: Masukkan token bot kamu yang didapat dari halaman Discord Developer Portal.
   - `global.owner`: Ganti dengan nomor WhatsApp kamu sebagai Owner.
   - Pengaturan API lain seperti `global.pakasirApiKey` silakan disesuaikan.

### 5. Menjalankan Bot
Jika semua konfigurasi sudah benar, luncurkan bot menggunakan instruksi:
```bash
npm start
```
*(Atau `node index.js`)*

- **Menautkan WhatsApp**: Pada peluncuran pertama, terminal akan memunculkan **QR Code**. Buka aplikasi WhatsApp di HP kamu, buka bagian *Perangkat Tertaut*, lalu arahkan kamera ke layar komputermu untuk menghubungkan sesi WhatsApp.
- **Menautkan Discord**: Bot otomatis berubah menjadi online di server Discord-mu.

---

## 📈 Cara Penggunaan (Khusus Prediksi)
Perintah bot dipanggil dengan menggunakan awalan titik (`.`). Berikut adalah fitur khusus yang dibuat untuk proyek Statistika dan Probabilitas:

### 1. `.prediksi`
- **Tujuan**: Menjalankan algoritma SVR secara instan untuk memperkirakan beban trafik (jumlah pesan masuk) di jam-jam atau hari berikutnya.
- **Sistem Kerja**: Begitu perintah dipanggil, program akan mengekstrak file `traffic_log.csv` sebagai training dataset. Model SVR lalu memproses data latih tersebut dan bot akan membalas di chat dengan rangkuman estimasi lalu lintas (misalnya: perkiraan trafik untuk 24 jam ke depan).

### 2. `.prediksidoc`
- **Tujuan**: Mencetak hasil prediksi statistik SVR menjadi dokumen lampiran resmi.
- **Sistem Kerja**: Bot akan melakukan proses pemodelan yang sama, lalu melakukan visualisasi (seperti merender grafik regresi/kurva). Bot tidak merespons dengan sekadar chat biasa, namun akan langsung merender dan mengirimkan sebuah file dokumen (seperti PDF/Gambar) ke pengguna. Laporan ini dapat dimanfaatkan langsung sebagai lampiran pada dokumen Tugas Akhir.

*(Catatan: Pastikan terdapat cukup data historis pada `traffic_log.csv` agar mesin SVR dapat melakukan kalkulasi model yang akurat).*

---

## 👨‍🎓 Identitas Penulis
**Tugas Akhir - Statistika dan Probabilitas**
- **Nama**: Shafairunizar Neirabista Ekazura
- **NIM**: F5212510018
- **Universitas**: Universitas Tadulako
- **Mata Kuliah**: Statistika dan Probabilitas

> _Repositori ini dibuat untuk membuktikan secara terapan bagaimana ilmu komputasi matematis dan statistika dapat diimplementasikan ke dalam teknologi bot server secara riil._

---

## 🙏 Apresiasi / Kredit
Terima kasih yang sebesar-besarnya kepada [AhmadAkbarID](https://github.com/AhmadAkbarID) atas repositori awal [hydromd](https://github.com/AhmadAkbarID/hydromd) yang menjadi basis pondasi kode (base-code) dalam pengembangan proyek ini. Kontribusi dan karya open-source tersebut sangat membantu dalam proses penyelesaian tugas akhir ini.
