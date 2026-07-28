# BlogAPI

A RESTful API for managing blog posts, built as a 3-month backend exam project. Users can register, verify their email via OTP, and create/manage their own posts, categories, and tags.

## Tech stack

- **Node.js + Express 5**
- **PostgreSQL** with **Prisma** ORM
- **JWT** (access + refresh tokens)
- **Zod** for request validation
- **Nodemailer** for OTP emails
- ESLint + Prettier + Husky (pre-commit checks)

## Features

- **Auth**: signup, email OTP verification, signin, refresh token, get current user, logout
- **Posts**: create, list your own posts, get by id, update/delete — protected by an ownership middleware so only the author can edit or delete their post
- **Categories** and **Tags**: full CRUD
- Centralized error-handling middleware

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/verify-otp` | Verify email with OTP |
| POST | `/auth/signin` | Log in |
| POST | `/auth/refresh-token` | Refresh access token |
| GET | `/auth/me` | Get current user *(auth required)* |
| GET | `/auth/logout` | Log out *(auth required)* |
| GET/POST | `/posts/my`, `/posts` | List your posts / create a post *(auth required)* |
| GET/PUT/DELETE | `/posts/:id` | Read / update / delete a post *(owner only)* |
| GET/POST/PUT/DELETE | `/categories`, `/categories/:id` | Category CRUD |
| GET/POST/PUT/DELETE | `/tags`, `/tags/:id` | Tag CRUD |

## Running locally

```bash
git clone https://github.com/SabinaNorbekova/BlogAPI.git
cd BlogAPI
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT secrets, SMTP credentials
npx prisma migrate deploy
npm run start:dev
```

## Notes

This was built as an exam project to practice REST API design, JWT-based auth, and Prisma with PostgreSQL. Contributions/issues aren't expected, but feel free to open one if you spot a bug.
