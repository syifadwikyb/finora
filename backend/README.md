# Finora Backend API

Finora Backend is a RESTful API built using Node.js, Express.js, and Supabase PostgreSQL database client (`@supabase/supabase-js`).

## Architecture
Strict layered pattern:
`Request -> Route -> Controller -> Service -> Repository -> Supabase Client -> Database`

## Environment Setup
Create a `.env` file inside the `backend` directory:
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Database Schema DDL
Execute the following SQL in your Supabase SQL Editor:

```sql
-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    category_id INT REFERENCES categories(id) ON DELETE RESTRICT,
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample initial categories
INSERT INTO categories (name) VALUES 
('Gaji'),
('Freelance'),
('Makanan'),
('Transportasi'),
('Belanja'),
('Tagihan')
ON CONFLICT DO NOTHING;
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
