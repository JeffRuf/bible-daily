import { createClient } from '@supabase/supabase-js';

// These will be replaced with your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User settings (stored locally and synced to Supabase)
export async function getUserSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings:', error);
  }
  return data;
}

export async function saveUserSettings(userId, settings) {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) console.error('Error saving settings:', error);
  return data;
}

// Reading log
export async function logReading(userId, entry) {
  const { data, error } = await supabase
    .from('reading_log')
    .insert({
      user_id: userId,
      date: entry.date,
      book: entry.book,
      chapter: entry.chapter,
      reference: entry.reference,
      completed: entry.completed,
      day_number: entry.dayNumber,
      logged_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) console.error('Error logging reading:', error);
  return data;
}

export async function getReadingLog(userId) {
  const { data, error } = await supabase
    .from('reading_log')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) console.error('Error fetching log:', error);
  return data || [];
}

export async function getReadingStats(userId) {
  const { data, error } = await supabase
    .from('reading_log')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', true);
  
  if (error) console.error('Error fetching stats:', error);
  
  const completedCount = data?.length || 0;
  const totalChapters = 1189;
  
  return {
    completed: completedCount,
    total: totalChapters,
    percentage: Math.round((completedCount / totalChapters) * 100 * 10) / 10,
    daysRemaining: totalChapters - completedCount
  };
}

// Check if today's reading is already logged
export async function getTodayReading(userId, date) {
  const { data, error } = await supabase
    .from('reading_log')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching today reading:', error);
  }
  return data;
}

// Generate a simple user ID (stored in localStorage)
export function getOrCreateUserId() {
  let userId = localStorage.getItem('bible_daily_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('bible_daily_user_id', userId);
  }
  return userId;
}
