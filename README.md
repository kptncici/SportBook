# SportBook

SportBook is a modern fullstack sports booking and management platform built using Next.js, Prisma, Supabase, and Midtrans integration.

## 🚀 Features

* User Authentication
* Admin Dashboard
* Sports Booking System
* Midtrans Payment Gateway Integration
* Transaction Management
* Responsive UI
* Role-based Access Control
* Prisma ORM Database Management
* Email Notification System

---

# 🛠 Tech Stack

## Frontend

* Next.js 16
* React
* Tailwind CSS
* TypeScript

## Backend

* Next.js API Routes
* Prisma ORM
* Supabase PostgreSQL

## Payment Gateway

* Midtrans Sandbox / Production

## Authentication

* NextAuth.js

---

# 📦 Installation

Clone the repository:

```bash
git clone https://github.com/kptncici/sportbook.git
```

Move into the project directory:

```bash
cd sportbook
```

Install dependencies:

```bash
npm install
```

---

# ⚙️ Environment Variables

Create a `.env` file and configure the following:

```env
DATABASE_URL=
DIRECT_URL=

NEXTAUTH_SECRET=
NEXTAUTH_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=

RESEND_API_KEY=
```

---

# 🧩 Prisma Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Push database schema:

```bash
npx prisma db push
```

---

# ▶️ Running the Project

Development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

# 🚀 Deployment

Recommended deployment platform:

* Vercel

Production deployment steps:

1. Push project to GitHub
2. Import repository into Vercel
3. Add Environment Variables
4. Deploy project

---

# 💳 Midtrans Sandbox Testing

Use Midtrans sandbox test card:

```text
Card Number: 4811 1111 1111 1114
CVV: 123
Expiry: 12/30
OTP: 112233
```

---

# 👤 Demo Accounts

## Admin

```text
Email: admin@sportbook.com
Password: admin123
```

## User

```text
Email: pratamadirga@sportbook.id
Password: Athlete123!
```

---

# 📁 Project Structure

```bash
app/
components/
prisma/
public/
lib/
```

---

# 📌 Status

✅ Fullstack Application
✅ Payment Integration
✅ Database Connected
✅ Production Ready

---

# 📜 License

This project is built for educational and portfolio purposes.

---

# 👨‍💻 Developer

Developed by NURFADILLA RHAMADANI
