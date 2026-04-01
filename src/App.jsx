import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  getReadingForDay, 
  getCurrentDay, 
  TOTAL_CHAPTERS,
  getTestament 
} from './lib/readingPlan';
import {
  getOrCreateUserId,
  getUserSettings,
  saveUserSettings,
  logReading,
  getReadingLog,
  getReadingStats,
  getTodayReading
} from './lib/database';
import {
  getNtfyTopic,
  generateNtfyTopic,
  sendTestNotification,
  getWebSubscriptionUrl
} from './lib/notifications';

// Styles
const styles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
  },
  header: {
    textAlign: 'center',
    color: 'white',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    opacity: '0.9',
    margin: 0,
  },
  todayCard: {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  reference: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 8px 0',
  },
  testament: {
    fontSize: '14px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '16px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  button: {
    flex: 1,
    padding: '16px 24px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  yesButton: {
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    color: 'white',
  },
  noButton: {
    background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
    color: 'white',
  },
  disabledButton: {
    background: '#e0e0e0',
    color: '#999',
    cursor: 'not-allowed',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  statBox: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#667eea',
    margin: 0,
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '4px',
  },
  progressBar: {
    background: '#e0e0e0',
    borderRadius: '10px',
    height: '20px',
    overflow: 'hidden',
    marginTop: '16px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.5s ease',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a2e',
    margin: '0 0 16px 0',
  },
  logItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #eee',
  },
  logDate: {
    fontSize: '14px',
    color: '#666',
  },
  logReference: {
    fontSize: '16px',
    fontWeight: '500',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  completedBadge: {
    background: '#d4edda',
    color: '#155724',
  },
  missedBadge: {
    background: '#f8d7da',
    color: '#721c24',
  },
  setupCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '16px',
    marginBottom: '12px',
    boxSizing: 'border-box',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500',
  },
  notificationTimes: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '12px',
  },
  timeChip: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    border: '2px solid #667eea',
    background: 'white',
    color: '#667eea',
    transition: 'all 0.2s',
  },
  timeChipSelected: {
    background: '#667eea',
    color: 'white',
  },
  tabContainer: {
    display: 'flex',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '4px',
    marginBottom: '20px',
  },
  tab: {
    flex: 1,
    padding: '12px',
    border: 'none',
    background: 'transparent',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'white',
    color: '#667eea',
  },
  readButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  completedOverlay: {
    background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    marginTop: '16px',
  },
  completedIcon: {
    fontSize: '48px',
    marginBottom: '8px',
  },
  completedText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#155724',
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [userId, setUserId] = useState(null);
  const [settings, setSettings] = useState(null);
  const [todayReading, setTodayReading] = useState(null);
  const [stats, setStats] = useState({ completed: 0, total: TOTAL_CHAPTERS, percentage: 0, daysRemaining: TOTAL_CHAPTERS });
  const [readingLog, setReadingLog] = useState([]);
  const [isSetup, setIsSetup] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [ntfyTopic, setNtfyTopic] = useState('');
  const [selectedTimes, setSelectedTimes] = useState(['morning', 'evening']);
  const [todayStatus, setTodayStatus] = useState(null); // null, 'completed', 'skipped'
  const [loading, setLoading] = useState(true);

  const notificationTimes = [
    { id: 'morning', label: '🌅 Morning (7 AM)', time: '07:00' },
    { id: 'midday', label: '☀️ Midday (12 PM)', time: '12:00' },
    { id: 'afternoon', label: '🌤️ Afternoon (3 PM)', time: '15:00' },
    { id: 'evening', label: '🌙 Evening (7 PM)', time: '19:00' },
    { id: 'night', label: '🌃 Night (9 PM)', time: '21:00' },
  ];

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    const id = getOrCreateUserId();
    setUserId(id);
    
    const savedSettings = await getUserSettings(id);
    if (savedSettings?.start_date) {
      setSettings(savedSettings);
      setIsSetup(true);
      setStartDate(savedSettings.start_date);
      setSelectedTimes(savedSettings.notification_times || ['morning', 'evening']);
      setNtfyTopic(savedSettings.ntfy_topic || getNtfyTopic());
      
      // Calculate today's reading
      const currentDay = getCurrentDay(savedSettings.start_date);
      const reading = getReadingForDay(currentDay);
      setTodayReading({ ...reading, dayNumber: currentDay });
      
      // Check if already logged today
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayLog = await getTodayReading(id, today);
      if (todayLog) {
        setTodayStatus(todayLog.completed ? 'completed' : 'skipped');
      }
      
      // Get stats and log
      const userStats = await getReadingStats(id);
      setStats(userStats);
      
      const log = await getReadingLog(id);
      setReadingLog(log);
    } else {
      setNtfyTopic(generateNtfyTopic());
    }
    
    setLoading(false);
  }

  async function handleSetup() {
    const topic = ntfyTopic || generateNtfyTopic();
    
    const newSettings = {
      start_date: startDate,
      notification_times: selectedTimes,
      ntfy_topic: topic,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    
    await saveUserSettings(userId, newSettings);
    setSettings(newSettings);
    setIsSetup(true);
    
    // Set today's reading
    const currentDay = getCurrentDay(startDate);
    const reading = getReadingForDay(currentDay);
    setTodayReading({ ...reading, dayNumber: currentDay });
  }

  async function handleReadingResponse(completed) {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    await logReading(userId, {
      date: today,
      book: todayReading.book,
      chapter: todayReading.chapter,
      reference: todayReading.reference,
      completed: completed,
      dayNumber: todayReading.dayNumber,
    });
    
    setTodayStatus(completed ? 'completed' : 'skipped');
    
    // Refresh stats
    const userStats = await getReadingStats(userId);
    setStats(userStats);
    
    const log = await getReadingLog(userId);
    setReadingLog(log);
  }

  async function handleTestNotification() {
    const success = await sendTestNotification(ntfyTopic);
    if (success) {
      alert('Test notification sent! Check your ntfy app.');
    } else {
      alert('Failed to send notification. Please check your setup.');
    }
  }

  function toggleTime(timeId) {
    setSelectedTimes(prev => 
      prev.includes(timeId) 
        ? prev.filter(t => t !== timeId)
        : [...prev, timeId]
    );
  }

  // Bible Gateway URL for reading
  function getBibleGatewayUrl(reference) {
    const encoded = encodeURIComponent(reference);
    return `https://www.biblegateway.com/passage/?search=${encoded}&version=NIV`;
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, textAlign: 'center', padding: '60px' }}>
          <p style={{ fontSize: '24px' }}>📖</p>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Setup screen
  if (!isSetup) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📖 Bible Daily</h1>
          <p style={styles.subtitle}>Read through the Bible in 3 years</p>
        </div>
        
        <div style={styles.setupCard}>
          <h2 style={styles.sectionTitle}>Let's Get Started</h2>
          
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            When do you want to start?
          </label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.input}
          />
          
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', marginTop: '16px' }}>
            When should we remind you?
          </label>
          <div style={styles.notificationTimes}>
            {notificationTimes.map(time => (
              <button
                key={time.id}
                onClick={() => toggleTime(time.id)}
                style={{
                  ...styles.timeChip,
                  ...(selectedTimes.includes(time.id) ? styles.timeChipSelected : {})
                }}
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>
        
        <div style={styles.setupCard}>
          <h2 style={styles.sectionTitle}>📱 Set Up Notifications</h2>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            We use <strong>ntfy</strong> for free push notifications on iOS.
          </p>
          
          <ol style={{ paddingLeft: '20px', color: '#444' }}>
            <li style={{ marginBottom: '12px' }}>
              Install the <a href="https://apps.apple.com/app/ntfy/id1625396347" target="_blank" style={styles.link}>ntfy app</a> from the App Store
            </li>
            <li style={{ marginBottom: '12px' }}>
              Open ntfy and tap "+" to subscribe
            </li>
            <li style={{ marginBottom: '12px' }}>
              Enter this topic: <br/>
              <code style={{ 
                background: '#f0f0f0', 
                padding: '8px 12px', 
                borderRadius: '8px',
                display: 'block',
                marginTop: '8px',
                wordBreak: 'break-all'
              }}>{ntfyTopic}</code>
            </li>
          </ol>
          
          <button 
            onClick={handleTestNotification}
            style={{ ...styles.button, ...styles.yesButton, marginTop: '16px' }}
          >
            Send Test Notification
          </button>
        </div>
        
        <button 
          onClick={handleSetup}
          style={{ ...styles.readButton, marginTop: '8px' }}
        >
          Start My Journey 🚀
        </button>
      </div>
    );
  }

  // Main app
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📖 Bible Daily</h1>
        <p style={styles.subtitle}>Day {todayReading?.dayNumber} of {TOTAL_CHAPTERS}</p>
      </div>
      
      {/* Tabs */}
      <div style={styles.tabContainer}>
        {['today', 'progress', 'history', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {})
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Today Tab */}
      {activeTab === 'today' && (
        <>
          <div style={styles.todayCard}>
            <p style={styles.testament}>{getTestament(todayReading?.book)}</p>
            <h2 style={styles.reference}>{todayReading?.reference}</h2>
            
            <a 
              href={getBibleGatewayUrl(todayReading?.reference)}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.readButton}
            >
              📖 Read on Bible Gateway
            </a>
            
            {todayStatus === 'completed' ? (
              <div style={styles.completedOverlay}>
                <div style={styles.completedIcon}>✅</div>
                <p style={styles.completedText}>Great job! You've completed today's reading!</p>
              </div>
            ) : todayStatus === 'skipped' ? (
              <div style={{ ...styles.completedOverlay, background: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)' }}>
                <div style={styles.completedIcon}>📝</div>
                <p style={{ ...styles.completedText, color: '#856404' }}>Marked as not read. Try again tomorrow!</p>
              </div>
            ) : (
              <div style={styles.buttonContainer}>
                <button 
                  onClick={() => handleReadingResponse(true)}
                  style={{ ...styles.button, ...styles.yesButton }}
                >
                  ✅ Yes, I Read It
                </button>
                <button 
                  onClick={() => handleReadingResponse(false)}
                  style={{ ...styles.button, ...styles.noButton }}
                >
                  ❌ Not Today
                </button>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Your Progress</h2>
          
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <p style={styles.statNumber}>{stats.completed}</p>
              <p style={styles.statLabel}>Chapters Read</p>
            </div>
            <div style={styles.statBox}>
              <p style={styles.statNumber}>{stats.daysRemaining}</p>
              <p style={styles.statLabel}>Chapters Left</p>
            </div>
            <div style={styles.statBox}>
              <p style={styles.statNumber}>{stats.percentage}%</p>
              <p style={styles.statLabel}>Complete</p>
            </div>
            <div style={styles.statBox}>
              <p style={styles.statNumber}>{Math.ceil(stats.daysRemaining / 365)}</p>
              <p style={styles.statLabel}>Years Remaining</p>
            </div>
          </div>
          
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${stats.percentage}%` }}></div>
          </div>
          <p style={{ textAlign: 'center', color: '#666', marginTop: '12px' }}>
            {stats.completed} of {stats.total} chapters
          </p>
        </div>
      )}
      
      {/* History Tab */}
      {activeTab === 'history' && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Reading History</h2>
          
          {readingLog.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>
              No readings logged yet. Complete today's reading to start!
            </p>
          ) : (
            readingLog.slice(0, 30).map((entry, index) => (
              <div key={index} style={styles.logItem}>
                <div>
                  <p style={styles.logReference}>{entry.reference}</p>
                  <p style={styles.logDate}>{format(new Date(entry.date), 'MMMM d, yyyy')}</p>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  ...(entry.completed ? styles.completedBadge : styles.missedBadge)
                }}>
                  {entry.completed ? '✓ Read' : '✗ Missed'}
                </span>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Settings</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Start Date
            </label>
            <p style={{ color: '#666' }}>{format(new Date(settings?.start_date), 'MMMM d, yyyy')}</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              ntfy Topic
            </label>
            <code style={{ 
              background: '#f0f0f0', 
              padding: '8px 12px', 
              borderRadius: '8px',
              display: 'block',
              wordBreak: 'break-all'
            }}>{settings?.ntfy_topic}</code>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Notification Times
            </label>
            <div style={styles.notificationTimes}>
              {notificationTimes.map(time => (
                <button
                  key={time.id}
                  onClick={() => {
                    toggleTime(time.id);
                    // Save immediately
                    saveUserSettings(userId, {
                      ...settings,
                      notification_times: selectedTimes.includes(time.id)
                        ? selectedTimes.filter(t => t !== time.id)
                        : [...selectedTimes, time.id]
                    });
                  }}
                  style={{
                    ...styles.timeChip,
                    ...(selectedTimes.includes(time.id) ? styles.timeChipSelected : {})
                  }}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleTestNotification}
            style={{ ...styles.button, ...styles.yesButton, width: '100%' }}
          >
            Send Test Notification
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
