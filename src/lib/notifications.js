// ntfy.sh notification service
// ntfy.sh is a free, open-source push notification service that works great on iOS

const NTFY_BASE_URL = 'https://ntfy.sh';

// Generate a unique topic for this user (keep it secret!)
export function generateNtfyTopic() {
  const existingTopic = localStorage.getItem('bible_daily_ntfy_topic');
  if (existingTopic) return existingTopic;
  
  const topic = 'bible-daily-' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('bible_daily_ntfy_topic', topic);
  return topic;
}

export function getNtfyTopic() {
  return localStorage.getItem('bible_daily_ntfy_topic') || generateNtfyTopic();
}

// Send a notification (called from backend/cron)
export async function sendNotification(topic, title, message, options = {}) {
  try {
    const response = await fetch(`${NTFY_BASE_URL}/${topic}`, {
      method: 'POST',
      headers: {
        'Title': title,
        'Priority': options.priority || 'default',
        'Tags': options.tags || 'book,pray',
        'Click': options.clickUrl || '',
        'Actions': options.actions || ''
      },
      body: message
    });
    
    return response.ok;
  } catch (error) {
    console.error('Notification error:', error);
    return false;
  }
}

// Get the subscription URL for iOS
export function getSubscriptionUrl(topic) {
  return `ntfy://${topic}`;
}

// Get the web subscription URL
export function getWebSubscriptionUrl(topic) {
  return `${NTFY_BASE_URL}/${topic}`;
}

// Send a test notification
export async function sendTestNotification(topic) {
  return sendNotification(
    topic,
    '📖 Bible Daily Test',
    'If you see this, notifications are working! You will receive your daily Bible readings here.',
    {
      priority: 'high',
      tags: 'white_check_mark,book'
    }
  );
}

// Notification templates for different times of day
export const NOTIFICATION_TEMPLATES = {
  morning: {
    title: "🌅 Good Morning! Time for God's Word",
    getMessage: (reference) => `Today's reading: ${reference}\n\nStart your day with Scripture!`
  },
  midday: {
    title: "☀️ Midday Bible Reminder",
    getMessage: (reference) => `Don't forget today's reading: ${reference}\n\nTake a moment to reflect.`
  },
  evening: {
    title: "🌙 Evening Reading Reminder",
    getMessage: (reference) => `Have you read ${reference} today?\n\nWind down with God's Word.`
  },
  final: {
    title: "⏰ Last Chance to Read!",
    getMessage: (reference) => `Today's reading (${reference}) is still waiting for you!\n\nTap to mark as read.`
  }
};
