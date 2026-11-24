# 🚂 Choo-Choo Khitan Adventure — Faqih Al-Arif Billah

Website undangan digital interaktif bertema petualangan kereta api uap ceria untuk acara Walimatul Khitan ananda **Faqih Al-Arif Billah** (putra dari Bpk. Dede Nurjaya & Ibu Ruslinawati).

---

## 🌟 Fitur Utama Website Undangan

- 🎫 **Boarding Pass Ticket Hero**: Tiket kereta vintage dengan nama tamu dinamis, foto ananda Faqih, suara peluit kereta uap ("Tuut-Tuut!"), dan ekspor jadwal ke kalender (`.ics`).
- 🕌 **Cultural Blessing**: Sambutan doa dan kutipan ayat Al-Qur'an (QS. An-Nahl: 123).
- ⏰ **Station Countdown**: Hitung mundur jam stasiun menuju hari acara bahagia.
- 📍 **Venue & Rundown Stasiun**: Susunan acara terperinci dan peta Google Maps interaktif.
- 📸 **6 Gerbong Galeri Kenangan**: Galeri foto horizontal tumbuh kembang Faqih lengkap dengan lightbox modal.
- 🎁 **Loket Kado Digital**: Salin nomor rekening BSI, BCA, serta QRIS instan.
- 💌 **RSVP & Telegram Wishes**: Konfirmasi kehadiran dan buku tamu pesan ucapan.
- 🎵 **Latar Musik Ceria**: Pengiring lagu tema dengan tombol putar/jeda.

---

## 🔐 Halaman Khusus Admin (`/admin`)

Halaman admin dapat diakses melalui URL:
```
/admin
```
*(atau melalui tombol kecil "Panel Admin" di bagian footer undangan).*

### Fitur Dashboard Admin:
1. **Autentikasi Supabase**:
   - Login aman menggunakan Supabase Auth.
   - Tombol tampilkan / sembunyikan kata sandi.
   - Pembatasan otorisasi khusus akun Administrator terdaftar.
2. **Kelola Foto Galeri**:
   - Melihat seluruh foto gerbong yang aktif di website.
   - Unggah foto baru dari perangkat dengan live preview sebelum disimpan.
   - Mengubah judul, kategori gerbong, dan keterangan foto (caption).
   - Menghapus foto dengan dialog konfirmasi aman.
   - Otomatis tersimpan di Supabase Storage & tabel database.
3. **Kelola Informasi Undangan**:
   - Ubah nama anak, nama orang tua, tanggal acara, jam acara, tempat, dan alamat lengkap.
   - Ubah kalimat pesan sambutan undangan.
   - Ganti foto utama tiket kereta.
   - Live preview tampilan tiket langsung saat diedit.
4. **Kelola Musik Latar**:
   - Pemutar audio mini dengan durasi dan slider progres.
   - Unggah file lagu baru (MP3) langsung ke Supabase Storage.
   - Atur judul musik pengiring.
   - Sakelar aktif/nonaktif musik.

---

## 🛠️ Panduan Konfigurasi Supabase

### 1. Jalankan Skrip SQL di Supabase
1. Buka [Dashboard Supabase](https://supabase.com/dashboard).
2. Masuk ke proyek Anda, lalu buka menu **SQL Editor** &rarr; **New Query**.
3. Buka file `supabase-schema.sql` di proyek ini, salin seluruh isinya, dan klik **Run**.
4. Skrip ini akan membuat:
   - Tabel `invitation_info`, `gallery_photos`, `music_settings`, dan `admin_users`.
   - Kebijakan keamanan **Row Level Security (RLS)** (Publik hanya bisa membaca, Admin terautentikasi bisa menambah/mengubah/menghapus).
   - Storage bucket publik `invitation-assets` untuk file foto dan lagu.

### 2. Buat Akun Admin di Supabase Auth
1. Masuk ke menu **Authentication** &rarr; **Users** di Supabase.
2. Klik tombol **Add User** &rarr; **Create User**.
3. Masukkan Email dan Password untuk akun Admin Anda. Centang opsi *Auto Confirm User*.
4. (Opsional) Masukkan email admin tersebut ke tabel `admin_users` untuk pembatasan whitelist ketat.

### 3. Konfigurasi Environment Variables
Buat file `.env.local` pada folder root project:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
> **Catatan untuk Vercel**: Masukkan kedua variabel di atas pada menu **Vercel Dashboard &rarr; Project &rarr; Settings &rarr; Environment Variables**, lalu lakukan Redeploy.

---

## 🚀 Menjalankan Project Secara Lokal

```bash
# Menjalankan server development
npm run dev

# Memeriksa tipe TypeScript
npm run lint

# Membangun versi produksi
npm run build
```
