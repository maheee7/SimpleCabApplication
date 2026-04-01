# Cab Backend

A Node.js + TypeScript backend for a cab management application.

## Features
- User authentication (JWT-based)
- Cab, driver, and employee management
- RESTful API using Express
- MySQL database integration
- Modular structure (controllers, services, repositories)

## Prerequisites
- Node.js (v16+ recommended)
- npm
- MySQL server

## Setup

1. **Clone the repository**
   ```sh
   git clone <repo-url>
   cd cab-backend
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env` and fill in your values:
     ```sh
     cp .env.example .env
     ```

4. **Setup MySQL database**
   - Create a database and update credentials in `.env`.
   - Run any migration scripts if provided (not included by default).

5. **Run in development mode**
   ```sh
   npm run dev
   ```

6. **Build and run in production**
   ```sh
   npm run build
   npm start
   ```

## Scripts
- `npm run dev` — Start server with hot reload (nodemon)
- `npm run build` — Compile TypeScript to JavaScript
- `npm start` — Run compiled server

## Project Structure
- `src/config/` — Database config
- `src/controller/` — Route controllers
- `src/middleware/` — Express middlewares
- `src/models/` — Data models
- `src/repository/` — Data access logic
- `src/route/` — API route definitions
- `src/service/` — Business logic
- `src/index.ts` — App entry point

## Notes
- **Do NOT commit `node_modules` or `.env` to version control.**
- Add `node_modules/` and `.env` to your `.gitignore`.
- For production, ensure strong secrets and secure DB credentials.

---

Feel free to open issues or contribute!
