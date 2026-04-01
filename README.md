# 📖 Bible Daily

**Read through the entire Bible in 3 years** with daily push notifications, progress tracking, and a beautiful iOS-installable app.

![Bible Daily](https://img.shields.io/badge/PWA-Ready-blue) ![Free](https://img.shields.io/badge/Cost-Free-green) ![iOS](https://img.shields.io/badge/iOS-Compatible-black)

## Features

- ✅ **1,189 chapters** organized into a 3-year reading plan (~1 chapter/day)
- 📱 **iOS PWA** - Install from Safari, looks like a native app
- 🔔 **Multiple daily notifications** via ntfy.sh (free!)
- 📊 **Progress tracking** - See your completion percentage
- 📅 **Reading history** - Log what you've read
- 🌙 **Smart reminders** - Only notifies if you haven't read yet
- ☁️ **Cloud synced** - Your progress syncs across devices

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   iOS Safari    │────▶│  Vercel (PWA)   │────▶│    Supabase     │
│   PWA Install   │     │  + Cron Jobs    │     │    Database     │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │    ntfy.sh      │
                        │  Push Notifs    │
                        └─────────────────┘
```

## Quick Start (15 minutes)

### Step 1: Set Up Supabase (Free Database)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (remember your database password)
3. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
4. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### Step 2: Deploy to Vercel (Free Hosting)

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Add these environment variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_URL` | Same as VITE_SUPABASE_URL |
| `SUPABASE_SERVICE_KEY` | Your Supabase service_role key |
| `CRON_SECRET` | Any random string (e.g., generate with `openssl rand -hex 32`) |
| `APP_URL` | Your Vercel app URL (add after first deploy) |

4. Deploy! After deployment, copy your app URL and add it as `APP_URL` environment variable

### Step 3: Set Up Cron Authentication

Vercel will automatically run the cron jobs defined in `vercel.json`. The cron jobs are authenticated using the `CRON_SECRET` you set.

### Step 4: Install on Your iPhone

1. Open your Vercel app URL in **Safari** on your iPhone
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Name it "Bible Daily" and tap Add

### Step 5: Set Up Notifications

1. Install the [ntfy app](https://apps.apple.com/app/ntfy/id1625396347) from the App Store
2. Open the Bible Daily PWA you just installed
3. Follow the setup wizard - it will give you a unique topic code
4. In the ntfy app, tap "+" and subscribe to that topic
5. Test notifications from the app settings

## Notification Schedule

The app sends notifications at these times (configurable per user):

| Time | Description |
|------|-------------|
| 🌅 7:00 AM | Morning - Start your day |
| ☀️ 12:00 PM | Midday - Quick reminder |
| 🌤️ 3:00 PM | Afternoon - Check-in |
| 🌙 7:00 PM | Evening - Wind down |
| ⏰ 9:00 PM | Night - Last chance! |

**Smart feature:** If you've already marked today's reading as complete, you won't receive any more reminders for that day.

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
bible-daily/
├── src/
│   ├── App.jsx              # Main React component
│   ├── main.jsx             # Entry point
│   └── lib/
│       ├── readingPlan.js   # Bible chapters & reading logic
│       ├── database.js      # Supabase client & queries
│       └── notifications.js # ntfy.sh integration
├── api/
│   └── send-notifications.js # Vercel serverless function
├── public/
│   ├── manifest.json        # PWA manifest
│   └── favicon.svg          # App icon
├── supabase-schema.sql      # Database setup
├── vercel.json              # Cron job configuration
└── vite.config.js           # Build configuration
```

## Reading Plan

The app follows a sequential reading plan through all 66 books of the Bible:

**Old Testament (929 chapters)**
Genesis → Exodus → Leviticus → ... → Malachi

**New Testament (260 chapters)**
Matthew → Mark → Luke → ... → Revelation

At ~1 chapter per day, you'll complete the entire Bible in about 3 years and 3 months.

## Customization

### Change Notification Times

Edit `vercel.json` to change the cron schedules. Times are in UTC.

```json
{
  "crons": [
    {
      "path": "/api/send-notifications?time=morning",
      "schedule": "0 13 * * *"  // 7 AM CST = 13:00 UTC
    }
  ]
}
```

### Add More Notification Slots

1. Add a new cron entry in `vercel.json`
2. Add a new template in `api/send-notifications.js` → `NOTIFICATION_TEMPLATES`
3. Add the option in `src/App.jsx` → `notificationTimes` array

## Troubleshooting

**Notifications not arriving?**
- Make sure you subscribed to the correct topic in ntfy
- Check that the topic code matches exactly (case-sensitive)
- Ensure ntfy has notification permissions on your iPhone

**App not installing as PWA?**
- Use Safari (not Chrome) on iOS
- Make sure you're on HTTPS
- Try refreshing the page before adding to home screen

**Database errors?**
- Verify your Supabase credentials are correct
- Make sure you ran the schema SQL
- Check Supabase logs for errors

## Cost

**Completely free!**
- Vercel: Free tier (100GB bandwidth, unlimited serverless invocations)
- Supabase: Free tier (500MB database, 50k monthly active users)
- ntfy.sh: Free and open source

## License

MIT License - feel free to modify and share!

---

Built with ❤️ for daily time in God's Word.
