/**
 * Storage Helper for strict user data isolation
 */

export function getCurrentUserId() {
  try {
    const raw = localStorage.getItem('study_buddy_user');
    if (!raw) return 'anonymous';
    const user = JSON.parse(raw);
    return user?.id ? String(user.id) : 'anonymous';
  } catch {
    return 'anonymous';
  }
}

export function getUserStorageKey(baseKey, explicitUserId = null) {
  const uid = explicitUserId || getCurrentUserId();
  return `study_buddy_${uid}_${baseKey}`;
}

export function clearUserSessionAndCache(userId = null) {
  const uid = userId || getCurrentUserId();

  // Find all keys belonging to this user or legacy un-scoped cache keys
  const keysToRemove = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (
        k.startsWith(`study_buddy_${uid}_`) ||
        k === 'study_buddy_user' ||
        k === 'study_buddy_access_token' ||
        k === 'study_buddy_refresh_token' ||
        k === 'study_buddy_courses_data' ||
        k === 'study_buddy_plans_data' ||
        k === 'study_buddy_quizzes_data' ||
        k === 'study_buddy_quiz_attempts_data' ||
        k === 'study_buddy_course_weak_topics' ||
        k === 'study_buddy_quiz_history' ||
        k === 'study_buddy_documents_data' ||
        k.startsWith('study_buddy_conversations_data') ||
        k.startsWith('study_buddy_tutor_')
      ) {
        keysToRemove.push(k);
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch (err) {
    console.warn('Error clearing user cache:', err);
  }
}
