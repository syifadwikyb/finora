# Finora Backend API

Finora Backend is a RESTful API built using Node.js, Express.js, PostgreSQL (`pg`), and Supabase.

## Role & Goal
Finora adalah aplikasi keuangan personal berbasis metode **Envelope Budgeting**. Setiap uang masuk (gaji) harus dialokasikan ke pos alokasi (kategori/amplop) dan terikat pada akun simpanan (bank/e-wallet).

### Core Entities
- **Accounts**: Tempat fisik uang (BRI, SeaBank, E-Wallet, Cash).
- **Allocations**: Pos alokasi uang (Makan, Tabungan, Investasi) yang memiliki target nominal dan terikat ke satu Account.
- **Transactions**: Catatan pemasukan & pengeluaran yang memotong/menambah saldo Account dan Allocation terkait.

### Key Rules
1. **Pemasukan (Gaji)** masuk ke Account lalu didelegasikan ke Allocations.
2. **Pengeluaran** wajib memilih Account dan Allocation. Sisa saldo alokasi & saldo Account berkurang otomatis.

---

## Architecture
Strict layered pattern:
`Request -> Route -> Controller -> Service -> Repository -> Supabase Client / PostgreSQL -> Database`

## Environment Setup
Create a `.env` file inside the `backend` directory:
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_supabase_postgres_connection_string
```

## Running Backend
```bash
npm install
npm run dev
```

## API Endpoints
- `GET /health`
- `GET /health/database`
- `GET /categories`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`
- `GET /transactions`, `POST /transactions`, `PUT /transactions/:id`, `DELETE /transactions/:id`
- `GET /dashboard`
