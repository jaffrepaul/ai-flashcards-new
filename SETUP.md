# Quick Setup Guide

Follow these steps to get your AI Flashcards app running locally.

## Step 1: Set Up NeonDB

Run this command to automatically set up NeonDB:

```bash
npx neondb -y
```

This will:
- Create a NeonDB account (if you don't have one)
- Create a new database project
- Set up your `.env` file with the `DATABASE_URL`

## Step 2: Configure Environment

```bash
# If .env wasn't created by neondb, copy the example
cp .env.example .env
```

Add a JWT_SECRET (used to encrypt user session cookies):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add it to your `.env` file:
```
JWT_SECRET=your_generated_secret_here
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Initialize Database

Push the database schema to NeonDB:

```bash
npm run db:push
```

## Step 5: Add Test Data (Optional)

Create a test account and sample flashcards:

```bash
npm run db:seed
```

This creates:
- **Test account**: `test@test.com` / `password`
- Sample deck with 5 JavaScript flashcards

You can now skip signup and login immediately!

## Step 6: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Next Steps

1. Sign up for an account
2. Create your first deck
3. Start studying!

## Deploy to Vercel

1. Push your code to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
4. Deploy!

## Troubleshooting

**Build fails with DATABASE_URL error?**
- Make sure you set `DATABASE_URL` in `.env`
- For Vercel deployment, add it in the environment variables section

**Can't connect to database?**
- Verify your NeonDB connection string is correct
- Make sure your NeonDB project is active

**Authentication not working?**
- Check that `JWT_SECRET` is set and is at least 32 characters long

Need more help? Check the full [README.md](./README.md)
