import { format } from 'date-fns';

/**
 * Calculates pending daily reminders:
 * 1. Missing mood check-ins for today (Morning >= 06:00, Afternoon >= 12:00, Evening >= 18:00)
 * 2. Uncompleted goals due today or overdue
 * 3. Today's events
 */
export function getPendingReminders(userData, t) {
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const currentHour = now.getHours();
  const reminders = [];

  // 1. Mood Check-ins
  const todayMoods = (userData?.moods || []).filter(m => m.date === todayStr);
  const loggedSlots = new Set(todayMoods.map(m => m.slot));

  // Morning check-in (starts 06:00)
  if (currentHour >= 6 && !loggedSlots.has('morning')) {
    reminders.push({
      id: `mood-morning-${todayStr}`,
      type: 'mood',
      slot: 'morning',
      title: t('notifications.moodMorningTitle'),
      desc: t('notifications.moodMorningDesc'),
      actionLabel: t('notifications.logMorningBtn'),
      timeLabel: '06:00 - 12:00',
      iconType: 'morning',
      urgency: currentHour >= 12 ? 'overdue' : 'due',
      actionType: 'openMood',
      actionPayload: { date: todayStr, slot: 'morning' }
    });
  }

  // Afternoon check-in (starts 12:00)
  if (currentHour >= 12 && !loggedSlots.has('afternoon')) {
    reminders.push({
      id: `mood-afternoon-${todayStr}`,
      type: 'mood',
      slot: 'afternoon',
      title: t('notifications.moodAfternoonTitle'),
      desc: t('notifications.moodAfternoonDesc'),
      actionLabel: t('notifications.logAfternoonBtn'),
      timeLabel: '12:00 - 18:00',
      iconType: 'afternoon',
      urgency: currentHour >= 18 ? 'overdue' : 'due',
      actionType: 'openMood',
      actionPayload: { date: todayStr, slot: 'afternoon' }
    });
  }

  // Evening check-in (starts 18:00)
  if (currentHour >= 18 && !loggedSlots.has('evening')) {
    reminders.push({
      id: `mood-evening-${todayStr}`,
      type: 'mood',
      slot: 'evening',
      title: t('notifications.moodEveningTitle'),
      desc: t('notifications.moodEveningDesc'),
      actionLabel: t('notifications.logEveningBtn'),
      timeLabel: '18:00 - 23:59',
      iconType: 'evening',
      urgency: 'due',
      actionType: 'openMood',
      actionPayload: { date: todayStr, slot: 'evening' }
    });
  }

  // 2. Uncompleted Goals (Due today or Overdue)
  const goals = userData?.goals || [];
  goals.forEach(goal => {
    if (!goal.completed && goal.targetDate) {
      if (goal.targetDate < todayStr) {
        reminders.push({
          id: `goal-overdue-${goal.id}`,
          type: 'goal',
          title: goal.title,
          desc: `${t('notifications.goalOverdueDesc')} (${goal.targetDate})`,
          actionLabel: t('notifications.viewGoalBtn'),
          timeLabel: goal.targetDate,
          iconType: 'goal-overdue',
          urgency: 'overdue',
          actionType: 'goToTab',
          actionPayload: { tab: 'goals', goalId: goal.id }
        });
      } else if (goal.targetDate === todayStr) {
        reminders.push({
          id: `goal-today-${goal.id}`,
          type: 'goal',
          title: goal.title,
          desc: t('notifications.goalDueTodayDesc'),
          actionLabel: t('notifications.viewGoalBtn'),
          timeLabel: t('calendar.today'),
          iconType: 'goal',
          urgency: 'due',
          actionType: 'goToTab',
          actionPayload: { tab: 'goals', goalId: goal.id }
        });
      }
    }
  });

  return {
    reminders,
    count: reminders.length
  };
}
