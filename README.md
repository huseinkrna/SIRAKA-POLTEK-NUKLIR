# ⚛️ SIRAKA - Simulator Reaktor Kartini

![Status Proyek](https://img.shields.io/badge/status-pengembangan-yellow)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-4.0.0-646CFF?logo=vite)
![Lisensi](https://img.shields.io/badge/lisensi-belum_ditentukan-lightgrey)

**SIRAKA** (Simulator Reaktor Kartini) adalah sebuah platform simulasi berbasis web yang dirancang untuk memvisualisasikan dan memahami prinsip kerja serta parameter operasional Reaktor Kartini. Proyek ini dikembangkan sebagai sarana pembelajaran interaktif bagi mahasiswa di lingkungan **Politeknik Nuklir** (POLTEK NUKLIR).

🔗 **Demo Langsung**: [siraka.netlify.app](https://siraka.netlify.app/)

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Memulai Proyek (Getting Started)](#-memulai-proyek-getting-started)
- [Struktur Direktori](#-struktur-direktori)
- [Kontribusi](#-kontribusi)
- [Kontak Pengembang](#-kontak-pengembang)

---

## 🧪 Tentang Proyek

Reaktor Kartini merupakan salah satu reaktor nuklir riset yang berlokasi di Yogyakarta. Memahami dinamika operasional reaktor membutuhkan media visualisasi yang interaktif dan mudah dipahami.

**SIRAKA** hadir untuk menjembatani hal tersebut dengan menyediakan:
- Visualisasi kondisi terkini reaktor secara real-time (simulasi).
- Pengendalian parameter dasar seperti posisi batang kendali.
- Tampilan data numerik yang informatif (suhu, fluks neutron, daya, dll.).

Dengan antarmuka yang modern dan responsif, SIRAKA cocok digunakan sebagai alat bantu praktikum maupun demonstrasi di kelas.

---

## ✨ Fitur Utama

- 🎮 **Simulasi Interaktif** – Pengguna dapat menjalankan skenario operasi reaktor secara virtual.
- 📊 **Monitoring Parameter** – Menampilkan grafik dan indikator penting seperti suhu teras, level daya, dan fluks neutron.
- 🎨 **UI/UX Modern** – Dibangun dengan komponen React yang dinamis dan tata letak yang nyaman dilihat.
- ⚡ **Performa Cepat** – Menggunakan Vite untuk proses pengembangan dan build yang super cepat.
- 📱 **Responsif** – Dapat diakses dengan baik melalui desktop, tablet, maupun ponsel.

---

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun menggunakan teknologi-teknologi berikut:

- **[React](https://react.dev/)** - Library UI untuk membangun antarmuka pengguna.
- **[Vite](https://vitejs.dev/)** - Build tool modern yang cepat dan ringan.
- **JavaScript (ES6+)** - Logika utama simulasi dan interaksi.
- **CSS3** - Styling dan tata letak halaman (dengan pendekatan modular).
- **Netlify** - Platform deployment untuk hosting demo publik.

---

## 🚀 Memulai Proyek (Getting Started)

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini di lingkungan lokal Anda.

### Prasyarat

Pastikan Anda telah menginstal **Node.js** (versi 16 atau yang lebih baru) dan **npm** atau **yarn** di komputer Anda.

### Instalasi

1. **Clone repositori**
   ```bash
   git clone https://github.com/huseinkrna/SIRAKA-POLTEK-NUKLIR.git

2. **Masuk ke direktori proyek**
    ```bash
    cd SIRAKA-POLTEK-NUKLIR

3. **Instal dependensi**
    ```bash
    npm install

    atau jika menggunakan yarn:
    ```bash
    yarn install

3. **Jalankan server pengembangan**
    ```bash
    npm run dev
atau    
    ```bash
    yarn dev
    Buka di browser
    Aplikasi akan berjalan di http://localhost:5173 (atau port lain yang tertera di terminal).