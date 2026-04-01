// Vercel Serverless Function for sending scheduled notifications
// This runs on a cron schedule to send notifications to all users

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key for server-side
);

const NTFY_BASE_URL = 'https://ntfy.sh';

// Bible books data for calculating readings
const BIBLE_BOOKS = [
  { name: "Genesis", chapters: 50 }, { name: "Exodus", chapters: 40 },
  { name: "Leviticus", chapters: 27 }, { name: "Numbers", chapters: 36 },
  { name: "Deuteronomy", chapters: 34 }, { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 }, { name: "Ruth", chapters: 4 },
  { name: "1 Samuel", chapters: 31 }, { name: "2 Samuel", chapters: 24 },
  { name: "1 Kings", chapters: 22 }, { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 }, { name: "2 Chronicles", chapters: 36 },
  { name: "Ezra", chapters: 10 }, { name: "Nehemiah", chapters: 13 },
  { name: "Esther", chapters: 10 }, { name: "Job", chapters: 42 },
  { name: "Psalms", chapters: 150 }, { name: "Proverbs", chapters: 31 },
  { name: "Ecclesiastes", chapters: 12 }, { name: "Song of Solomon", chapters: 8 },
  { name: "Isaiah", chapters: 66 }, { name: "Jeremiah", chapters: 52 },
  { name: "Lamentations", chapters: 5 }, { name: "Ezekiel", chapters: 48 },
  { name: "Daniel", chapters: 12 }, { name: "Hosea", chapters: 14 },
  { name: "Joel", chapters: 3 }, { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 }, { name: "Jonah", chapters: 4 },
  { name: "Micah", chapters: 7 }, { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 }, { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 }, { name: "Zechariah", chapters: 14 },
  { name: "Malachi", chapters: 4 }, { name: "Matthew", chapters: 28 },
  { name: "Mark", chapters: 16 }, { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 }, { name: "Acts", chapters: 28 },
  { name: "Romans", chapters: 16 }, { name: "1 Corinthians", chapters: 16 },
  { name: "2 Corinthians", chapters: 13 }, { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 }, { name: "Philippians", chapters: 4 },
  { name: "Colossians", chapters: 4 }, { name: "1 Thessalonians", chapters: 5 },
  { name: "2 Thessalonians", chapters: 3 }, { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 }, { name: "Titus", chapters: 3 },
  { name: "Philemon", chapters: 1 }, { name: "Hebrews", chapters: 13 },
  { name: "James", chapters: 5 }, { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 }, { name: "1 John", chapters: 5 },
  { name: "2 John", chapters: 1 }, { name: "3 John", chapters: 1 },
  { name: "Jude", chapters: 1 }, { name: "Revelation", chapters: 22 }
];

const TOTAL_CHAPTERS = 1189;

function generateReadingPlan() {
  const plan = [];
  let dayNumber = 1;
  for (const book of BIBLE_BOOKS) {
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      plan.push({
        day: dayNumber,
        book: book.name,
        chapter: chapter,
        reference: `${book.name} ${chapter}`
      });
      dayNumber++;
    }
  }
  return plan;
}

function getReadingForDay(dayNumber) {
  const plan = generateReadingPlan();
  const adjustedDay = ((dayNumber - 1) % TOTAL_CHAPTERS) + 1;
  return plan[adjustedDay - 1];
}

function getCurrentDay(startDate) {
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = today - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

// Notification templates for different times
const NOTIFICATION_TEMPLATES = {
  morning: {
    title: "🌅 Good Morning! Time for God's Word",
    getMessage: (ref) => `Today's reading: ${ref}\n\nStart your day with Scripture!`,
    priority: 'high',
    tags: 'sunrise,book'
  },
  midday: {
    title: "☀️ Midday Bible Reminder",
    getMessage: (ref) => `Don't forget: ${ref}\n\nTake a moment to reflect.`,
    priority: 'default',
    tags: 'sunny,book'
  },
  afternoon: {
    title: "🌤️ Afternoon Check-in",
    getMessage: (ref) => `Have you read ${ref} today?\n\nIt's not too late!`,
    priority: 'default',
    tags: 'cloud,book'
  },
  evening: {
    title: "🌙 Evening Reading Time",
    getMessage: (ref) => `Today's reading: ${ref}\n\nWind down with God's Word.`,
    priority: 'default',
    tags: 'crescent_moon,book'
  },
  night: {
    title: "⏰ Last Chance to Read!",
    getMessage: (ref) => `${ref} is waiting for you!\n\nTap to open the app.`,
    priority: 'high',
    tags: 'bell,book'
  }
};

async function sendNotification(topic, template, reference, appUrl) {
  try {
    const response = await fetch(`${NTFY_BASE_URL}/${topic}`, {
      method: 'POST',
      headers: {
        'Title': template.title,
        'Priority': template.priority,
        'Tags': template.tags,
        'Click': appUrl,
        'Actions': `view, Open App, ${appUrl}`
      },
      body: template.getMessage(reference)
    });
    return response.ok;
  } catch (error) {
    console.error('Notification error:', error);
    return false;
  }
}

export default async function handler(req, res) {
  // Verify cron secret (optional but recommended)
  const cronSecret = req.headers['authorization'];
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get the notification time slot from query param
  const timeSlot = req.query.time || 'morning';
  const appUrl = process.env.APP_URL || 'https://your-app.vercel.app';

  try {
    // Get all users who want notifications at this time
    const { data: users, error } = await supabase
      .from('user_settings')
      .select('*')
      .contains('notification_times', [timeSlot]);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const template = NOTIFICATION_TEMPLATES[timeSlot];
    let sent = 0;
    let failed = 0;

    // Send notification to each user
    for (const user of users || []) {
      // Check if user already completed today's reading
      const today = new Date().toISOString().split('T')[0];
      const { data: todayLog } = await supabase
        .from('reading_log')
        .select('completed')
        .eq('user_id', user.user_id)
        .eq('date', today)
        .single();

      // Skip if already completed
      if (todayLog?.completed) {
        continue;
      }

      // Calculate their reading for today
      const currentDay = getCurrentDay(user.start_date);
      const reading = getReadingForDay(currentDay);

      // Send notification
      const success = await sendNotification(
        user.ntfy_topic,
        template,
        reading.reference,
        appUrl
      );

      if (success) sent++;
      else failed++;
    }

    return res.status(200).json({
      success: true,
      timeSlot,
      sent,
      failed,
      total: users?.length || 0
    });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
