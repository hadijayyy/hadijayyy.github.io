# 🤖 AI Automation Agency — Portfolio Website

Website portofolio profesional untuk **AI Automation Agency**, penyedia solusi otomatisasi berbasis kecerdasan buatan di Indonesia.

![Preview](https://img.shields.io/badge/status-live-brightgreen)
![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JS](https://img.shields.io/badge/JavaScript-ES6-yellow)

---

## 📋 Daftar Isi

- [Tentang](#tentang)
- [Fitur](#fitur)
- [Layanan](#layanan)
- [Teknologi](#teknologi)
- [Deployment ke GitHub Pages](#deployment-ke-github-pages)
- [Kustomisasi](#kustomisasi)
- [Lisensi](#lisensi)

---

## 🎯 Tentang

Website ini adalah portofolio profesional untuk freelancer AI automation yang menampilkan layanan, testimoni, dan formulir kontak. Dirancang dengan tema gelap modern dan aksen **ungu** serta **teal** yang profesional dan menarik bagi klien.

**Target Audiens:** Pemilik bisnis UKM, startup, dan perusahaan di Indonesia yang membutuhkan solusi otomatisasi AI.

---

## ✨ Fitur

- ✅ **Tema gelap modern** — dengan aksen ungu/teal premium
- ✅ **Fully responsive** — mobile, tablet, dan desktop
- ✅ **Animasi scroll** — fade-in yang halus
- ✅ **Formulir kontak** — terintegrasi dengan Formspree
- ✅ **Animated counters** — statistik yang hidup
- ✅ **Navigasi sticky** — dengan blur effect
- ✅ **Mobile menu** — navigasi hamburger yang mulus
- ✅ **Micro-interactions** — hover effects, tilt card
- ✅ **SEO friendly** — semantic HTML, meta tags
- ✅ **Semua teks dalam Bahasa Indonesia**

---

## 🛠️ Layanan yang Ditampilkan

| Layanan | Deskripsi |
|---------|-----------|
| **Web Scraping & Ekstraksi Data** | Kumpulkan data otomatis dari berbagai sumber web |
| **Generasi Konten dengan AI** | Buat konten berkualitas tinggi untuk blog, sosial media, email |
| **Otomatisasi Media Sosial** | Jadwalkan dan publish konten ke multi-platform |
| **Analisis Data & Visualisasi** | Dashboard interaktif dan laporan otomatis |

---

## 💻 Teknologi

- **HTML5** — Semantic markup
- **CSS3** — Variables, Grid, Flexbox, Animations
- **Vanilla JavaScript** — Intersection Observer, Fetch API
- **Font Awesome 6** — Icons
- **Google Fonts** — Inter & JetBrains Mono
- **Formspree** — Form backend (gratis)

---

## 🚀 Deployment ke GitHub Pages

### Prasyarat

- Akun GitHub ([daftar gratis](https://github.com/signup))
- Git terinstall di komputer Anda
- (Opsional) Nama domain kustom

### Langkah-langkah

#### 1. Buat Repository Baru di GitHub

1. Login ke [GitHub](https://github.com)
2. Klik tombol **"+"** di pojok kanan atas → **"New repository"**
3. Isi **Repository name**: `hadijayyy.github.io`
   > ⚠️ **Penting:** Ganti `hadijayyy` dengan username GitHub Anda. Repository harus bernama `username.github.io` untuk GitHub Pages user site.
4. Pilih **Public**
5. Jangan centang "Add a README" (kita sudah punya)
6. Klik **"Create repository"**

#### 2. Upload File ke Repository

**Opsi A — Via Terminal (Git CLI):**

```bash
# Clone repository kosong
git clone https://github.com/hadijayyy/hadijayyy.github.io.git
cd hadijayyy.github.io

# Copy semua file portfolio ke folder ini
cp -r /path/to/portfolio/* .

# Commit dan push
git add .
git commit -m "Deploy AI Automation Agency portfolio"
git push origin main
```

**Opsi B — Via GitHub Upload (lebih mudah):**

1. Buka repository Anda di GitHub
2. Klik **"Add file"** → **"Upload files"**
3. Drag & drop **semua file** berikut:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`
4. Scroll bawah, isi commit message: `Deploy portfolio website`
5. Pilih **"Commit directly to the main branch"**
6. Klik **"Commit changes"**

#### 3. Aktifkan GitHub Pages

1. Buka repository Anda di GitHub
2. Klik tab **"Settings"**
3. Di menu kiri, klik **"Pages"**
4. Di bagian **"Branch"**, pilih `main` dan folder `/ (root)`
5. Klik **"Save"**
6. Tunggu 1-2 menit, lalu buka `https://hadijayyy.github.io`

#### 4. (Opsional) Kustom Domain

1. Beli domain dari penyedia (Niagahoster, DomaiNesia, dll)
2. Di GitHub Pages settings, masukkan domain Anda di **"Custom domain"**
3. Di penyedia domain, tambahkan CNAME record ke `hadijayyy.github.io`
4. Centang **"Enforce HTTPS"** untuk keamanan SSL gratis

---

## ⚙️ Kustomisasi

### Mengganti Formulir Kontak (Formspree)

Website ini menggunakan **Formspree** untuk mengirim pesan dari formulir kontak.

1. Buka [Formspree.io](https://formspree.io) dan daftar gratis
2. Klik **"New Form"**, beri nama (misal: "Portfolio Contact")
3. Copy **Form ID** (contoh: `xyzabc12`)
4. Buka file `script.js` di folder ini
5. Cari baris:
   ```javascript
   const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
   ```
6. Ganti `YOUR_FORMSPREE_ID` dengan Form ID Anda
   ```javascript
   const response = await fetch('https://formspree.io/f/xyzabc12', {
   ```

### Mengganti Nomor WhatsApp

1. Buka `index.html`
2. Cari `6281234567890` (ada 2 tempat)
3. Ganti dengan nomor WhatsApp Anda dalam format internasional (tanpa `+`)

### Mengganti Email

1. Buka `index.html`
2. Cari `hello@aiautomation.id`
3. Ganti dengan email Anda

### Mengubah Warna Tema

Buka `style.css` dan edit variabel di bagian `:root`:

```css
:root {
    --accent-purple: #8b5cf6;  /* Ganti warna utama */
    --accent-teal: #14b8a6;    /* Ganti warna sekunder */
    /* ... */
}
```

---

## 📁 Struktur File

```
portfolio/
├── index.html          # Halaman utama website
├── style.css           # Semua styling (dark theme)
├── script.js           # Interaktivitas dan animasi
└── README.md           # Dokumentasi ini
```

---

## 📄 Lisensi

Hak cipta © 2024 AI Automation Agency. Dibuat dengan ❤️ di Indonesia.

Bebas digunakan untuk keperluan portofolio pribadi. Dilarang menjual kembali tanpa izin.

---

## 💬 Kontak

Ada pertanyaan? Hubungi kami:

- **Email:** hello@aiautomation.id
- **WhatsApp:** +62 812-3456-7890
- **Website:** [hadijayyy.github.io](https://hadijayyy.github.io)

---

_Build with ❤️ in Indonesia 🇮🇩_
