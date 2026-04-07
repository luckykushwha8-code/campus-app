# CampusLink

CampusLink is a student-first social/community MVP built with Next.js, MongoDB, and Cloudinary.

It is designed for real student use, not a static demo. Users can sign up, create a profile, upload avatar and cover images, post to the feed, like, comment, join rooms, create events, upload notes, use messaging, and view notifications.

## Live App

- Production: [https://campus-app-omega.vercel.app](https://campus-app-omega.vercel.app)
- GitHub: [https://github.com/luckykushwha8-code/campus-app](https://github.com/luckykushwha8-code/campus-app)

## Current MVP Status

The app is in a strong MVP/beta-ready state.

Working core modules:

- Authentication
  - signup
  - login
  - logout
  - forgot password flow
- Profile
  - edit profile
  - public profile pages
  - avatar upload
  - cover upload
- Feed
  - create post
  - image post
  - real feed loading
  - likes
  - comments
  - delete own post
- Stories
  - create image story
  - story rail at top of feed
  - story viewing
  - delete own story
- Rooms
  - list rooms
  - create room
  - room detail
  - join/leave
  - delete own room
- Events
  - list events
  - create event
  - event detail
  - RSVP/join
  - delete own event
- Notes
  - upload note
  - list notes
  - search notes
  - view/download
  - edit/delete own notes
- Messages
  - direct conversations
  - send messages
  - conversation loading
- Notifications
  - in-app notifications
  - unread count
  - like/comment/message notifications
- Moderation basics
  - report posts/comments
  - admin moderation review page

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- MongoDB with Mongoose
- Prisma client used in project setup scripts
- Cloudinary for media storage
- Nodemailer for password reset email flow
- Vercel for deployment

## Local Setup

### 1. Install dependencies

```powershell
npm install
```

### 2. Create env file

Copy `.env.example` to `.env.local` and fill in the values.

Required variables:

```env
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_APP_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=
```

### 3. Run the app

```powershell
npm run dev
```

Open:

- App: [http://localhost:3000](http://localhost:3000)
- Health: [http://localhost:3000/healthz](http://localhost:3000/healthz)

## Scripts

```powershell
npm run dev
npm run build
npm run start
npm run lint
npm run db:push
npm run db:seed
```

## API Health Checks

Useful live checks:

- App: [https://campus-app-omega.vercel.app](https://campus-app-omega.vercel.app)
- Health: [https://campus-app-omega.vercel.app/healthz](https://campus-app-omega.vercel.app/healthz)
- Feed API: [https://campus-app-omega.vercel.app/api/posts/feed](https://campus-app-omega.vercel.app/api/posts/feed)
- Notes page: [https://campus-app-omega.vercel.app/notes](https://campus-app-omega.vercel.app/notes)

## Current Backend Safety

The backend currently includes:

- auth-protected write routes
- ownership checks
- moderation report flow
- invalid object-id validation on important routes
- basic in-memory rate limiting on sensitive write APIs

## Known Remaining Gaps

These are the main things still worth improving before a wider public launch:

- move rate limiting to Redis/Upstash instead of in-memory storage
- configure SMTP fully for live password reset email delivery
- add monitoring and error tracking
- expand admin moderation tooling
- run a deeper multi-user QA pass on production

## License

Apache-2.0
