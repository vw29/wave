# Wave

A modern, dark-themed social platform built for meaningful connection. Share posts, engage through comments and replies, follow people you care about, and curate your digital presence.

---

## Features

**Social Feed**
- Create posts with image uploads and emoji support
- Like, comment, reply, and bookmark posts
- @mention users in posts and comments
- Pin comments as post owner
- Edit and delete your own comments

**Profiles**
- Public profile pages with posts, likes, and saved tabs
- Edit profile modal with avatar upload
- Follow / unfollow users
- Block / unblock with full content filtering

**Notifications**
- Real-time grouped notifications (likes, comments, follows, mentions)
- Mark all as read
- Clickable notifications linking to relevant content

**Security & Settings**
- Two-factor authentication (TOTP with QR code)
- Change password with 2FA verification
- Email verification during registration
- Delete account with password confirmation
- Blocked users management

**Search**
- Search users by name or username

---

## Tech Stack

| Layer          | Technology                                                        |
|----------------|-------------------------------------------------------------------|
| Framework      | [Next.js](https://nextjs.org) 16                                 |
| Language       | [TypeScript](https://typescriptlang.org)                         |
| Auth           | [NextAuth.js](https://next-auth.js.org) v5 (Credentials + JWT)  |
| Database       | [PostgreSQL](https://postgresql.org) via [Neon](https://neon.tech) |
| ORM            | [Prisma](https://prisma.io) with `@prisma/adapter-pg`           |
| Styling        | [Tailwind CSS](https://tailwindcss.com) v4                       |
| Components     | [shadcn/ui](https://ui.shadcn.com)                               |
| File Uploads   | [UploadThing](https://uploadthing.com)                           |
| Email          | [Resend](https://resend.com)                                     |
| Rate Limiting  | [Upstash Redis](https://upstash.com)                             |
| Icons          | [Lucide React](https://lucide.dev)                               |
| Validation     | [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com) |
| 2FA            | [otplib](https://github.com/yeojz/otplib)                       |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) account)
- [Resend](https://resend.com) API key
- [UploadThing](https://uploadthing.com) API key
- [Upstash Redis](https://upstash.com) (for rate limiting)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/wave.git
cd wave

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your database URL, API keys, etc.

# Push the database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

```env
DATABASE_URL=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_SECRET=
RESEND_API_KEY=
UPLOADTHING_TOKEN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Project Structure

```
wave/
  app/
    (logged-in)/       # Authenticated routes (profile, settings)
    (logged-out)/      # Public auth routes (login, register)
    post/[id]/         # Post permalink
    page.tsx           # Home feed
  actions/
    auth/              # Auth actions (register, login, 2FA, delete account)
    post/              # Post actions (create, like, comment, bookmark, pin)
    social/            # Social actions (follow, block, suggestions)
    notification/      # Notification actions (fetch, mark read)
  components/
    feed/              # Feed components (PostCard, Navbar, Notifications)
    profile/           # Profile components (Header, Tabs, EditModal)
    settings/          # Settings components (2FA, Password, BlockList)
    ui/                # Shared UI (AvatarDisplay, EmojiPickerButton, shadcn)
  lib/                 # Utilities, schemas, Prisma client, mentions
  prisma/              # Database schema
```

---

## License

This project is for educational and personal use.
