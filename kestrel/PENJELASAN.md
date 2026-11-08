# Kestrel, dijelaskan untuk orang awam

## Singkatnya

**Kestrel adalah bot Telegram untuk membuat koin kripto cukup dengan satu pesan chat, sekaligus "label gizi" untuk setiap koin baru supaya orang tahu risikonya sebelum membeli.**

Namanya diambil dari *kestrel*, burung elang kecil yang bisa melayang diam di udara sambil mengawasi mangsa dari jauh. Dua sifat itu sama dengan fungsi produknya: **meluncur cepat** (launch koin) dan **mata tajam** (melihat risiko sebelum orang lain).

## Masalah yang diselesaikan

Bayangkan sebuah pasar baru yang setiap hari kedatangan ratusan pedagang baru.

1. **Membuka lapak itu ribet.** Untuk membuat koin di Ascend, orang harus paham wallet, kontrak, dan pengaturan teknis. Kebanyakan orang menyerah di tengah jalan.
2. **Pembeli tidak bisa membaca "label" produknya.** Informasi penting setiap koin sebenarnya terbuka: berapa fee-nya, apakah pembuatnya sudah memborong duluan, dan ke mana uang fee mengalir. Tapi semua itu tersimpan dalam bentuk kode, jadi orang biasa tidak bisa membacanya. Akibatnya banyak yang tertipu koin tiruan atau koin yang langsung dijual habis oleh pembuatnya.

## Cara kerja Kestrel

**Untuk pembuat koin:**
1. Buka bot Kestrel di Telegram.
2. Ketik alamat wallet kamu: `/wallet 0x...`
3. Ketik: `/launch KOPI Kopi Nusantara`
4. Tekan "Luncurkan". Selesai. Koin kamu langsung ada di Ascend.

Setiap kali orang membeli atau menjual koin kamu, kamu mendapat bagian fee secara otomatis.

**Untuk pembeli:**
- Kirim `/scan` diikuti alamat koin, atau buka halaman web Kestrel.
- Kestrel menampilkan kartu sederhana: 🟢 risiko rendah, 🟡 sedang, atau 🔴 tinggi, beserta alasannya dalam bahasa sehari-hari.
- Contoh alasannya: *"Pembuat koin sudah memborong 18% suplai, waspadai aksi jual"* atau *"Ticker meniru aset terkenal, kemungkinan koin tiruan."*

## Kenapa aman

- **Kestrel tidak pernah memegang uang kamu** dan tidak pernah meminta private key. Fee dari koin kamu langsung mengalir ke wallet kamu lewat kontrak Ascend.
- **Pengaturan bawaannya aman.** Bot tidak memborong koin di awal (tanpa *dev buy*), dan komunitas bisa mengambil alih koin kalau pembuatnya kabur.
- **Ada rem anti-spam.** Satu orang hanya bisa membuat satu koin per hari. Nama yang meniru aset terkenal (misalnya BTC atau HYPE) diblokir.
- **Setiap penilaian bisa dicek.** Semua label risiko diambil dari data on-chain (data publik di blockchain), bukan opini.

## Dari mana Kestrel dapat uang

Ascend punya fitur bernama *builder fee*. Aplikasi resmi yang membantu orang meluncurkan koin boleh mengambil potongan kecil, maksimal 1%, dari setiap transaksi koin yang ia luncurkan.

Makin banyak koin yang diluncurkan lewat Kestrel dan makin ramai diperdagangkan, makin besar pendapatan Kestrel. Pendapatan Ascend juga ikut naik, karena setiap transaksi membayar fee ke Ascend. **Kepentingan Kestrel dan Ascend searah.**

## Status saat ini

- ✅ Halaman web scanner sudah jadi. Sementara ini menampilkan contoh koin, lalu otomatis membaca data asli begitu alamat RPC mainnet Elysium dimasukkan.
- ✅ Kode bot Telegram sudah jadi dan teruji. Mode bawaannya *simulasi*, jadi tidak ada transaksi sungguhan sampai benar-benar diaktifkan.
- ⏳ Supaya bisa memungut builder fee, alamat Kestrel perlu disetujui Ascend. Ini salah satu alasan Kestrel mendaftar ke Ascend Builder Incubator.

*Kestrel memberikan analisis otomatis, bukan saran keuangan. Setiap keputusan membeli tetap tanggung jawab masing-masing.*
