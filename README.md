# Finora - Personal Finance App (Envelope Budgeting)

## 📌 Role & Goal
**Finora** adalah aplikasi keuangan personal berbasis metode **Envelope Budgeting** (Zero-Based / Pos Alokasi Finansial).
Setiap uang masuk (seperti gaji, freelance, atau pemasukan lainnya) wajib dialokasikan ke pos-pos alokasi (kategori/amplop belanja & tabungan) serta terikat pada akun simpanan fisik/digital (bank atau e-wallet).

Dengan pendekatan ini, setiap rupiah memiliki tugas dan tempat penyimpanan yang jelas, mempermudah pelacakan arus kas, perencanaan tabungan, serta pencegahan pengeluaran berlebih (*overspending*).

---

## 🏛️ Core Entities

### 1. **Accounts**
Tempat fisik atau wadah penyimpanan uang nyata milik pengguna.
- **Contoh**: Rekening Bank (BRI, SeaBank, BCA, Mandiri), E-Wallet (GoPay, OVO, Dana), Uang Tunai (Cash).
- **Atribut Utama**:
  - `id`: Identifikasi unik.
  - `user_id`: Pemilik akun.
  - `name`: Nama akun / institusi (misal: "SeaBank", "BRI Tabungan").
  - `type`: Jenis akun (`bank`, `ewallet`, `cash`, `investment`).
  - `account_number`: Nomor rekening/ponsel (opsional).
  - `current_balance`: Saldo riil yang tersimpan di akun tersebut.
  - `created_at` / `updated_at`.

### 2. **Allocations**
Pos alokasi uang atau amplop digital (*envelope*) yang merepresentasikan tujuan dana (kebutuhan bulanan, tabungan, proteksi, atau investasi).
Setiap Allocation **memiliki target nominal** dan **terikat ke satu Account** spesifik.
- **Contoh**:
  - Pos "Makan Siang & Jajan" (terikat ke Akun: GoPay, Target: Rp 1.500.000).
  - Pos "Tabungan Darurat" (terikat ke Akun: SeaBank, Target: Rp 5.000.000).
  - Pos "Investasi Reksadana" (terikat ke Akun: BRI, Target: Rp 1.000.000).
- **Atribut Utama**:
  - `id`: Identifikasi unik.
  - `user_id`: Pemilik alokasi.
  - `account_id`: Relasi ke akun penyimpanan fisik tempat dana alokasi ini berada (`FK -> accounts.id`).
  - `name`: Nama pos alokasi (misal: "Makan & Kebutuhan Harian", "Dana Darurat").
  - `target_amount`: Target nominal alokasi untuk pos tersebut.
  - `current_balance`: Sisa saldo yang masih tersedia di amplop/pos alokasi ini.
  - `created_at` / `updated_at`.

### 3. **Transactions**
Catatan riwayat transaksi (pemasukan maupun pengeluaran) yang secara langsung memotong atau menambah saldo pada **Account** fisik dan **Allocation** terkait.
- **Atribut Utama**:
  - `id`: Identifikasi unik.
  - `user_id`: Pemilik transaksi.
  - `account_id`: Akun yang terpengaruh (`FK -> accounts.id`).
  - `allocation_id`: Pos alokasi yang terpengaruh (`FK -> allocations.id`).
  - `title`: Judul transaksi (misal: "Makan Siang Bakso", "Gaji Bulanan").
  - `amount`: Nominal transaksi.
  - `type`: Jenis transaksi (`income`, `expense`).
  - `transaction_date`: Tanggal transaksi.
  - `description`: Catatan opsional.
  - `created_at` / `updated_at`.

---

## ⚡ Key Business Rules

1. **Pemasukan (Gaji / Income Flow)**
   - Setiap uang masuk (misal: Gaji) tercatat masuk ke dalam **Account** fisik pilihan (misal: BRI).
   - Dana yang masuk ke Account selanjutnya **didelegasikan/didistribusikan ke Pos Allocations** yang terikat pada akun tersebut sesuai persentase atau target nominal amplop.
   - Penambahan saldo alokasi akan meningkatkan `current_balance` pada Allocation sekaligus menambah saldo riil di Account.

2. **Pengeluaran (Expense Flow)**
   - Setiap pencatatan pengeluaran **wajib memilih Account dan Allocation** yang bersesuaian.
   - Sisa saldo alokasi (`Allocation.current_balance`) berkurang secara otomatis sesuai nominal transaksi.
   - Saldo riil pada akun simpanan (`Account.current_balance`) juga berkurang secara otomatis dan sinkron.
   - Sistem memvalidasi ketersediaan saldo pada alokasi terkait untuk mencegah amplop menjadi defisit (*overbudget*).

