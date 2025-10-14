# AI Flashcards

A modern flashcard application powered by AI, built with Next.js, NeonDB, and Drizzle ORM.

## Features

* **AI-Generated Content**: Create flashcards from any topic using advanced AI
* **Progress Tracking**: Detailed analytics on your study patterns
* **User Authentication**: Secure login with email/password
* **Responsive Design**: Works on desktop, tablet, and mobile
* **Interactive Study Sessions**: Engaging quiz mode with performance feedback

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: NeonDB (PostgreSQL)
- **ORM**: Drizzle ORM
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Authentication**: JWT with jose
- **Password Hashing**: bcryptjs

## Quickstart Guide

### Prerequisites

- Node.js 18+ installed
- A NeonDB account (free tier available at [neon.tech](https://neon.tech))

### 1. Set Up NeonDB

Run this single command to automatically set up your database:

```bash
npx neondb -y
```

This will create a NeonDB project and configure your `DATABASE_URL` automatically.

### 2. Configure Environment Variables

1. If `.env` wasn't created automatically, copy the example:
   ```bash
   cp .env.example .env
   ```

2. Add a JWT_SECRET to encrypt user session cookies:
   ```bash
   # Generate a secure random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. Add the generated secret to your `.env` file:
   ```bash
   DATABASE_URL=your_neon_database_url_here  # (set by neondb)
   JWT_SECRET=your_generated_secret_here     # (paste the output from above)
   ```

   **Why JWT_SECRET?** This secret is used to sign and verify authentication tokens that keep users logged in. Without it, anyone could forge login sessions.

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up the Database

Generate and push the database schema to NeonDB:

```bash
npm run db:push
```

This will create all the necessary tables in your NeonDB database.

### 5. Seed Test Data (Optional)

Create a test account and sample data:

```bash
npm run db:seed
```

**Test credentials:**
- Email: `test@test.com`
- Password: `password`

This also creates a sample JavaScript deck with 5 flashcards so you can try the app immediately!

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## Database Schema

The app uses the following database tables:

- **users**: User accounts with email/password authentication
- **decks**: Flashcard decks created by users
- **flashcards**: Individual flashcards belonging to decks
- **study_sessions**: Records of study sessions with performance data
- **card_responses**: Individual card responses during study sessions

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:seed` - Seed database with test user and sample data

## Project Structure

```
ai-flashcards/
├── app/
│   ├── actions/          # Server actions
│   │   ├── auth.ts       # Authentication actions
│   │   ├── decks.ts      # Deck management actions
│   │   └── study.ts      # Study session actions
│   ├── dashboard/        # Dashboard pages
│   │   ├── create-deck/  # Create deck page
│   │   ├── deck/[id]/    # Deck detail page
│   │   ├── study/[id]/   # Study session page
│   │   └── stats/        # Statistics page
│   ├── signin/           # Sign in page
│   ├── signup/           # Sign up page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/
│   └── ui/               # shadcn/ui components
├── db/
│   ├── index.ts          # Database connection
│   └── schema.ts         # Database schema
├── lib/
│   ├── auth.ts           # Authentication utilities
│   ├── utils.ts          # Utility functions
│   └── ai-placeholder.ts # AI integration placeholder
└── drizzle.config.ts     # Drizzle configuration
```

## Adding AI Integration

The app currently uses placeholder flashcard generation. To integrate with Vercel AI SDK:

1. Install the AI SDK:
   ```bash
   npm install ai @ai-sdk/openai
   ```

2. Add your OpenAI API key to `.env`:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Update `app/actions/decks.ts` to use the AI SDK. See `lib/ai-placeholder.ts` for example implementation.

4. Documentation: [Vercel AI SDK](https://sdk.vercel.ai/docs)

## Deployment on Vercel

1. Push your code to GitHub

2. Import your repository on [Vercel](https://vercel.com)

3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` - Your NeonDB connection string
   - `JWT_SECRET` - Your JWT secret
   - `OPENAI_API_KEY` - (Optional) Your OpenAI API key

4. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

## Database Management

### View Database with Drizzle Studio

```bash
npm run db:studio
```

This opens a GUI at `https://local.drizzle.studio` where you can view and edit your data.

### Make Schema Changes

1. Edit `db/schema.ts`
2. Run `npm run db:push` to apply changes

## Features Walkthrough

### 1. Authentication
- Sign up with email/password
- Secure password hashing with bcrypt
- JWT-based sessions
- Protected routes

### 2. Deck Management
- Create decks with title, topic, and description
- Auto-generate flashcards (currently placeholder, ready for AI)
- View all decks on dashboard
- Delete decks

### 3. Study Sessions
- Interactive flashcard study mode
- Show question → reveal answer → mark correct/incorrect
- Real-time progress tracking
- Session completion with results

### 4. Analytics
- Total sessions and completed sessions
- Total cards studied
- Overall accuracy percentage
- Recent session history

## Troubleshooting

### Database Connection Issues

If you get database connection errors:
1. Verify your `DATABASE_URL` in `.env`
2. Check your NeonDB project is active
3. Ensure your IP is allowed (NeonDB allows all IPs by default)

### Build Errors

If you encounter TypeScript errors:
```bash
npm run build
```

Check the error messages and ensure all dependencies are installed.

### Port Already in Use

If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

## Contributing

This is a starter template. Feel free to:
- Add more features
- Improve the UI
- Enhance the study algorithms
- Add spaced repetition
- Implement AI-powered generation

## License

MIT

## Support

For issues or questions:
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Review [Drizzle ORM Documentation](https://orm.drizzle.team)
- Visit [NeonDB Documentation](https://neon.tech/docs)
- Read [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
