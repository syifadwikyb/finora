<div align="center">

<img src="frontend/public/finora_logo.png" alt="Finora Logo" width="120" />

# Finora

**Manage your money, simply.**

A modern personal finance tracker to record income and expenses, move money between categories, and keep your balances under control. Installable as an app on your phone.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-finora--qy.vercel.app-059669?style=for-the-badge&logo=vercel&logoColor=white)](https://finora-qy.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white)

[Live Demo](https://finora-qy.vercel.app) · [Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [Install as App](#install-as-an-app)

</div>

---

## 📖 About Finora

**Finora** is a personal finance tracker that helps you understand where your money comes from and where it goes. Instead of juggling notes and spreadsheets, you can log every transaction, split your income across categories, move money between them (for example from your wallet to your bank), and see each category's balance update automatically.

Finora is built as a responsive web app and can be installed on your phone like a native app, with its own icon and splash screen.

> 🌐 **Try it now:** [https://finora-qy.vercel.app](https://finora-qy.vercel.app)

<a id="features"></a>

## ✨ Features

- **Income & expense tracking**: record transactions with a title, amount, date, category, and description.
- **Category balances**: every category keeps its own running balance that updates with each transaction.
- **Income allocation**: split one income across multiple categories in a single entry.
- **Move Money**: transfer funds from one category to another, across accounts or within the same account (for example wallet to bank). The source balance decreases and the destination increases in a single database transaction.
- **Move history**: moves appear in the transaction history alongside income and expenses, with their own **Move** badge and color. Filter by the **Move** type, category, date range, or search by note, category, or account name. Recent moves also show up on the dashboard.
- **Edit & delete moves**: update or remove a move at any time. Finora reverses the old balance effect and applies the new one automatically.
- **Balance protection**: expenses, moves, and any edit or deletion that would reverse funds that were already used are rejected when a category does not have enough balance.
- **Safe edit & delete**: editing or deleting a transaction or a move automatically reverses its old balance effect, inside a database transaction (all or nothing).
- **Secure authentication**: email and password sign-in with email verification, plus Google sign-in, powered by Firebase.
- **PIN lock**: optionally protect the app with a PIN that is required before opening any page.
- **Profile management**: edit your name, username, and phone number, and upload or remove your profile photo.
- **Dark mode**: light, dark, or follow-system theme.
- **Installable PWA**: add Finora to your home screen with a custom icon and an animated splash screen.
- **Responsive design**: sidebar on desktop and bottom navigation on mobile. Quick action buttons show icons only on small screens and icons with labels on desktop.

<!--
## 📸 Screenshots

Add your screenshots to docs/screenshots/ and uncomment this section.

| Dashboard | Transactions | Profile |
| :-------: | :----------: | :-----: |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Transactions](docs/screenshots/transactions.png) | ![Profile](docs/screenshots/profile.png) |
-->

<a id="tech-stack"></a>

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/) |
| Authentication | [Firebase Authentication](https://firebase.google.com/docs/auth) |
| Backend | [Node.js](https://nodejs.org/) |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| Deployment | [Vercel](https://vercel.com/) |

## 📁 Project Structure

```
finora/
├── frontend/                 # Next.js web app
│   ├── app/                  # Routes, layouts, and pages
│   ├── components/           # UI components (layout, auth, dashboard, transactions, ...)
│   ├── lib/                  # API client, Firebase setup, and helpers
│   ├── middleware.ts         # PIN protection
│   └── public/               # Logo, icons, and manifest.json
├── backend/                  # Node.js API
│   └── src/
│       ├── config/           # Database connection
│       ├── Transactions/     # Transaction route, controller, service, and repository
│       ├── Transfer/         # Move Money route, controller, service, and repository
│       ├── Categories/       # Category service and repository
│       └── Dashboard/        # Dashboard summary route, controller, service, and repository
└── package.json              # Root scripts to run frontend and backend together
```

<a id="getting-started"></a>

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) **v20 or newer**
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/) (local or hosted)
- A [Firebase](https://console.firebase.google.com/) project with **Authentication** enabled (Email/Password and Google)

### 1. Clone the repository

```bash
git clone https://github.com/syifadwikyb/finora.git
cd finora
```

### 2. Install dependencies

Install the root, frontend, and backend dependencies:

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

### 3. Configure environment variables

**Frontend**: create `frontend/.env.local`:

```env
# Firebase (Project settings → General → Your apps)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend**: create `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/finora
```

> ⚠️ Never commit `.env` files. Make sure they are listed in `.gitignore`.

### 4. Set up the database

Create a PostgreSQL database and run the schema or migration for your tables (users, categories, accounts, transactions, and transfers):

```bash
createdb finora
```

### 5. Run the app

From the project root, start the frontend and backend together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run start:frontend   # http://localhost:3000
npm run start:backend    # http://localhost:5000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

<a id="install-as-an-app"></a>

## 📱 Install as an App (PWA)

Finora can be installed on your phone or computer without an app store.

**Android (Chrome)**
1. Open [finora-qy.vercel.app](https://finora-qy.vercel.app).
2. Tap the **⋮** menu → **Install app** (or **Add to Home screen**).

**iPhone (Safari)**
1. Open [finora-qy.vercel.app](https://finora-qy.vercel.app).
2. Tap **Share** → **Add to Home Screen**.

**Desktop (Chrome / Edge)**
1. Click the install icon in the address bar, then choose **Install**.

> The app must be served over HTTPS (or `localhost`) to be installable.

## 🌐 Deployment

The frontend is deployed on [Vercel](https://vercel.com/):

1. Import the repository in Vercel.
2. Set the **Root Directory** to `frontend`.
3. Add the same environment variables from `frontend/.env.local`.
4. Deploy.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the project
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

Distributed under the ISC License.

## 👤 Author

Built by **[Your Name](https://github.com/syifadwikyb)**.

---

<div align="center">

If you find Finora useful, please consider giving it a ⭐

</div>