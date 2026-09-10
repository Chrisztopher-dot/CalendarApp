/**
 * Rich demo dataset dynamically generated around the user's current date.
 * Populates calendar events, 3x daily moods with activities, goals across all horizons & sections,
 * journal entries, and photo memories.
 */

function offsetDate(baseDate, daysOffset) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + daysOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function generateDemoData(userEmail = 'demo@organizer.app') {
  const today = new Date();
  const todayStr = offsetDate(today, 0);

  // Generate 21 days of mood tracking history (3 check-ins per day)
  const moods = [];
  const activityPool = ['workout', 'friends', 'food', 'rest', 'socialize', 'work', 'family', 'outdoors', 'reading', 'gaming', 'nature'];

  for (let i = -14; i <= 0; i++) {
    const dStr = offsetDate(today, i);
    
    // Day cycle pattern: creating realistic waves for the mood curve
    const cycle = Math.sin((i + 14) * 0.7) * 1.5;
    const baseScore = Math.min(5, Math.max(1, Math.round(3.5 + cycle + (Math.random() * 0.8 - 0.4))));

    // Morning check-in
    moods.push({
      id: `mood-${dStr}-morning`,
      date: dStr,
      slot: 'morning',
      score: Math.min(5, Math.max(1, baseScore + (i % 2 === 0 ? 0 : -1))),
      activities: ['rest', 'food', (i % 3 === 0 ? 'workout' : 'reading')],
      note: i === 0 ? 'Woke up feeling refreshed with morning coffee.' : 'Early start and mindfulness meditation.'
    });

    // Afternoon check-in
    moods.push({
      id: `mood-${dStr}-afternoon`,
      date: dStr,
      slot: 'afternoon',
      score: baseScore,
      activities: ['work', (i % 2 === 0 ? 'socialize' : 'food'), 'outdoors'],
      note: i === 0 ? 'Productive project review with team.' : 'Completed focused coding block.'
    });

    // Evening check-in
    moods.push({
      id: `mood-${dStr}-evening`,
      date: dStr,
      slot: 'evening',
      score: Math.min(5, Math.max(1, baseScore + (i % 4 === 0 ? 1 : 0))),
      activities: ['friends', 'food', 'home', (i % 2 === 0 ? 'workout' : 'gaming')],
      note: i === 0 ? 'Cooked Swedish salmon dinner with friends.' : 'Relaxing evening walk under northern skies.'
    });
  }

  // Calendar Events across sections
  const events = [
    {
      id: 'evt-1',
      title: 'Q3 Architectural Review',
      date: todayStr,
      startTime: '10:00',
      endTime: '11:30',
      section: 'Work',
      description: 'Discuss EC2 deployment, containerization, and data caching strategy.'
    },
    {
      id: 'evt-2',
      title: 'Fika & Team Catch-up',
      date: todayStr,
      startTime: '14:30',
      endTime: '15:15',
      section: 'Socialize',
      description: 'Traditional Swedish cinnamon buns and strategy brainstorm.'
    },
    {
      id: 'evt-3',
      title: 'Gym: Upper Body & Cardio',
      date: todayStr,
      startTime: '18:00',
      endTime: '19:15',
      section: 'Health',
      description: 'Bench press, pull-ups, and 20 min interval running.'
    },
    {
      id: 'evt-4',
      title: 'Guitar Jam Session',
      date: offsetDate(today, 1),
      startTime: '19:00',
      endTime: '20:30',
      section: 'Hobbies',
      description: 'Practicing acoustic fingerstyle songs.'
    },
    {
      id: 'evt-5',
      title: 'Sprint Planning & Backlog Grooming',
      date: offsetDate(today, 2),
      startTime: '09:30',
      endTime: '11:00',
      section: 'Work',
      description: 'Plan upcoming 2-week deliverable sprints.'
    },
    {
      id: 'evt-6',
      title: 'Pottery & Ceramic Workshop',
      date: offsetDate(today, 3),
      startTime: '13:00',
      endTime: '16:00',
      section: 'Production',
      description: 'Glazing modern minimalist coffee mugs and vases.'
    },
    {
      id: 'evt-7',
      title: 'Trail Run in Djurgården Nature Reserve',
      date: offsetDate(today, 4),
      startTime: '08:30',
      endTime: '10:00',
      section: 'Health',
      description: '10km morning run along scenic waterways.'
    },
    {
      id: 'evt-8',
      title: 'Dinner Party at Archipelago House',
      date: offsetDate(today, 5),
      startTime: '18:30',
      endTime: '22:30',
      section: 'Activities',
      description: 'Seafood platter, sauna, and watching the sunset.'
    },
    {
      id: 'evt-9',
      title: 'Audio Production: Ambient Synth Track',
      date: offsetDate(today, -2),
      startTime: '15:00',
      endTime: '18:00',
      section: 'Production',
      description: 'Arranging analog synth stems and reverb buses.'
    }
  ];

  // Goals (Yearly, Monthly, Weekly) across Work / Health / Activities / Hobbies / Production
  const goals = [
    // Yearly
    {
      id: 'goal-y-1',
      title: 'Run Stockholm Half-Marathon under 1h 45m',
      period: 'yearly',
      section: 'Health',
      targetDate: offsetDate(today, 120),
      completed: false,
      progress: 65,
      notes: 'Weekly mileage currently at 35km. Long runs feel steady.'
    },
    {
      id: 'goal-y-2',
      title: 'Launch SaaS product on AWS with 1,000 active users',
      period: 'yearly',
      section: 'Work',
      targetDate: offsetDate(today, 180),
      completed: false,
      progress: 40,
      notes: 'Frontend & storage layer completed; deploying EC2 infrastructure.'
    },
    {
      id: 'goal-y-3',
      title: 'Master Swedish conversational fluency (C1 level)',
      period: 'yearly',
      section: 'Hobbies',
      targetDate: offsetDate(today, 90),
      completed: false,
      progress: 75,
      notes: 'Listening to Swedish podcasts daily and speaking at work.'
    },

    // Monthly
    {
      id: 'goal-m-1',
      title: 'Complete 16 strength training workouts',
      period: 'monthly',
      section: 'Health',
      targetDate: offsetDate(today, 20),
      completed: false,
      progress: 70,
      notes: '11/16 sessions logged so far this month.'
    },
    {
      id: 'goal-m-2',
      title: 'Produce and master 2 ambient music tracks',
      period: 'monthly',
      section: 'Production',
      targetDate: offsetDate(today, 15),
      completed: false,
      progress: 50,
      notes: 'Track 1 mixed; working on vocals and mastering.'
    },
    {
      id: 'goal-m-3',
      title: 'Read 2 non-fiction books on systems thinking',
      period: 'monthly',
      section: 'Activities',
      targetDate: offsetDate(today, 18),
      completed: true,
      progress: 100,
      notes: 'Finished Thinking in Systems and Antifragile.'
    },

    // Weekly
    {
      id: 'goal-w-1',
      title: 'Ship Calendar Organizer EC2 release build',
      period: 'weekly',
      section: 'Work',
      targetDate: offsetDate(today, 3),
      completed: false,
      progress: 85,
      notes: 'Docker configuration and responsive curve chart finalized.'
    },
    {
      id: 'goal-w-2',
      title: 'Daily 3x mood reflection streak',
      period: 'weekly',
      section: 'Health',
      targetDate: offsetDate(today, 4),
      completed: false,
      progress: 90,
      notes: 'Consistently tracking Morning, Afternoon, and Evening.'
    },
    {
      id: 'goal-w-3',
      title: 'Host Swedish Fika evening with friends',
      period: 'weekly',
      section: 'Activities',
      targetDate: offsetDate(today, 2),
      completed: false,
      progress: 50,
      notes: 'Cardamom buns prepped and coffee beans roasted.'
    }
  ];

  // Notes / Journal
  const notes = [
    {
      id: 'note-1',
      title: 'Reflections on Sustainable Routine & Energy',
      content: `### Energy Management Principles\n\n1. **Morning Light & Movement**: 15 minutes of outdoor light right after waking.\n2. **Deep Work Sprints**: Max 90-minute uninterrupted focus blocks.\n3. **Swedish Fika Culture**: Regular intentional breaks with coffee and conversation reset cognitive fatigue.\n4. **Evening Wind-down**: Disconnect screens 1 hour before sleep.`,
      section: 'Health',
      date: todayStr,
      updatedAt: todayStr
    },
    {
      id: 'note-2',
      title: 'Architecture Blueprint: Zero-Backend Calendar on AWS EC2',
      content: `### Key Advantages of Static Client Architecture\n\n- **Zero Server State**: Eliminates database maintenance, security vulnerabilities, and connection pooling issues.\n- **True Privacy**: User data stays strictly in client-side \`localStorage\` partitioned by user email.\n- **Blazing Fast**: Assets served instantly by Nginx cached on EC2.\n- **Cost Efficiency**: Can run reliably on AWS t4g.nano/t3.micro free tier indefinitely.`,
      section: 'Work',
      date: offsetDate(today, -2),
      updatedAt: offsetDate(today, -2)
    },
    {
      id: 'note-3',
      title: 'Woodworking & Studio Design Ideas',
      content: `Planning a custom birch plywood standing desk with integrated cable channels and magnetic tool rack. Inspired by Scandinavian minimalist ergonomics.`,
      section: 'Production',
      date: offsetDate(today, -5),
      updatedAt: offsetDate(today, -5)
    }
  ];

  // Sample Media items (using crisp SVG data URLs so no external network dependency is needed)
  const sampleSvgPlaceholder1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230284c7"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="600" height="400" fill="url(%23g1)"/><circle cx="300" cy="180" r="70" fill="%2338bdf8" opacity="0.8"/><path d="M0 320 Q 150 250, 300 320 T 600 320 L 600 400 L 0 400 Z" fill="%230369a1" opacity="0.9"/><text x="50%" y="375" text-anchor="middle" fill="%23f8fafc" font-family="sans-serif" font-size="18" font-weight="bold">Archipelago Sunset Kayak</text></svg>`;
  
  const sampleSvgPlaceholder2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2310b981"/><stop offset="100%" stop-color="%23064e3b"/></linearGradient></defs><rect width="600" height="400" fill="url(%23g2)"/><polygon points="120,340 180,200 240,340" fill="%2334d399" opacity="0.8"/><polygon points="200,350 280,180 360,350" fill="%23059669" opacity="0.9"/><polygon points="320,340 400,160 480,340" fill="%2310b981" opacity="0.7"/><text x="50%" y="380" text-anchor="middle" fill="%23f8fafc" font-family="sans-serif" font-size="18" font-weight="bold">Forest Trail Run</text></svg>`;

  const media = [
    {
      id: 'media-1',
      title: 'Archipelago Sunset Kayak',
      dataUrl: sampleSvgPlaceholder1,
      thumbnailUrl: sampleSvgPlaceholder1,
      date: offsetDate(today, -3),
      section: 'Activities',
      type: 'image'
    },
    {
      id: 'media-2',
      title: 'Morning Forest Trail',
      dataUrl: sampleSvgPlaceholder2,
      thumbnailUrl: sampleSvgPlaceholder2,
      date: offsetDate(today, -7),
      section: 'Health',
      type: 'image'
    }
  ];

  return {
    user: {
      email: userEmail,
      name: 'Demo Explorer',
      isDemo: true
    },
    events,
    moods,
    goals,
    notes,
    media,
    settings: {
      theme: 'dark',
      defaultCalendarView: 'month'
    }
  };
}
