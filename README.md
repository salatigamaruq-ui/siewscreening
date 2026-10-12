[README_SIEW_Website.md](https://github.com/user-attachments/files/33340423/README_SIEW_Website.md)
# siewscreening# Website SIEW untuk Hotspot ESP32

Website ini adalah antarmuka lokal SIEW yang dibuka melalui hotspot Wi-Fi ESP32. File dipisah menjadi HTML, CSS, dan JavaScript agar mudah dibaca dan diedit.

## File
- `index.html` — struktur halaman monitoring dan formulir peserta.
- `style.css` — tampilan/responsif.
- `script.js` — komunikasi browser dengan API ESP32.
- `SIEW_ESP32_Hotspot_Website_Terpisah.ino` — sketch ESP32 yang menyajikan ketiga file tersebut dan menyediakan endpoint API.

## Cara menjalankan
1. Buka `SIEW_ESP32_Hotspot_Website_Terpisah.ino` di Arduino IDE.
2. Pastikan board ESP32 dan library yang dipakai proyek SIEW sudah dipilih/terpasang, lalu unggah sketch.
3. Buka Serial Monitor dengan baud rate yang sesuai sketch. Cari nama hotspot dan alamat IP yang tercetak.
4. Sambungkan ponsel/laptop ke hotspot **SIEW**. Password hotspot default pada sketch ini adalah **menang123** (ubah di sketch jika Anda menggantinya).
5. Buka alamat yang tercetak di Serial Monitor; biasanya `http://192.168.4.1/`.
6. Website memuat `/style.css` dan `/script.js` langsung dari ESP32, jadi ketiga file tidak perlu diunggah ke GitHub atau hosting terpisah.

## Fungsi halaman
- Memantau BPM, SpO₂, frekuensi napas, suhu, dan status gabungan dari endpoint `/api/data`.
- Memindai dan menyimpan jaringan Wi-Fi melalui `/api/wifi/scan` dan `/api/wifi/save`.
- Mengirim data peserta melalui `/api/participant` dan suhu melalui `/api/temperature`.
- Mengecek akses internet melalui `/api/internet` sebelum proses submit.

## Catatan penting
- File HTML/CSS/JS terpisah ini harus digunakan bersama sketch `SIEW_ESP32_Hotspot_Website_Terpisah.ino`. Sketch lama yang hanya memiliki `INDEX_HTML` inline tidak otomatis menyajikan `/style.css` dan `/script.js`.
- Hotspot ESP32 membuat jaringan lokal. Agar pengiriman ke Google Sheets bekerja, ESP32 juga perlu berhasil tersambung ke jaringan Wi-Fi yang memiliki akses internet, melalui bagian Konfigurasi Wi-Fi pada halaman.
- Hasil SIEW adalah prototipe skrining dan bukan diagnosis medis. Jaga kerahasiaan data peserta.
