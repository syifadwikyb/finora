# Finora Frontend

Finora Frontend is built with Next.js (App Router), Tailwind CSS, TypeScript, and Lucide React icons.

## Role & Goal
Finora adalah aplikasi keuangan personal berbasis metode **Envelope Budgeting**. Setiap uang masuk (gaji) harus dialokasikan ke pos alokasi (kategori/amplop) dan terikat pada akun simpanan (bank/e-wallet).

### Core Entities
- **Accounts**: Tempat fisik uang (BRI, SeaBank, E-Wallet, Cash).
- **Allocations**: Pos alokasi uang (Makan, Tabungan, Investasi) yang memiliki target nominal dan terikat ke satu Account.
- **Transactions**: Catatan pemasukan & pengeluaran yang memotong/menambah saldo Account dan Allocation terkait.

### Key Rules
1. **Pemasukan (Gaji)** masuk ke Account lalu didelegasikan ke Allocations.
2. **Pengeluaran** wajib memilih Account dan Allocation. Sisa saldo alokasi berkurang otomatis.

---

## Environment Setup
Create `.env.local` inside the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Running Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in the browser.
