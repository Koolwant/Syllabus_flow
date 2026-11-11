// SyllabusFlow — Centralized Reactive State Store & Business Logic
import { DEMO_SYLLABI } from './demo-data.js';

const STORAGE_KEY = 'syllabus_flow_state_v1';

class StateStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadInitialState();
  }

  loadInitialState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.subjects && parsed.subjects.length > 0) {
          return {
            subjects: parsed.subjects,
            currentSubjectId: parsed.currentSubjectId || parsed.subjects[0].id,
            activeView: parsed.activeView || 'map', // 'map' | 'outline' | 'dashboard' | 'revision'
            selectedTopicId: null,
            searchQuery: '',
            filterChapter: 'all',
            filterStatus: 'all',
            filterDifficulty: 'all',
            highlightMode: 'none', // 'none' | 'prereqs' | 'dependents' | 'critical' | 'ready'
            studySessionActive: false
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load saved state, falling back to demo syllabi:', e);
    }

    return {
      subjects: JSON.parse(JSON.stringify(DEMO_SYLLABI)),
      currentSubjectId: DEMO_SYLLABI[0].id,
      activeView: 'map',
      selectedTopicId: null,
      searchQuery: '',
      filterChapter: 'all',
      filterStatus: 'all',
      filterDifficulty: 'all',
      highlightMode: 'none',
      studySessionActive: false
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        subjects: this.state.subjects,
        currentSubjectId: this.state.currentSubjectId,
        activeView: this.state.activeView
      }));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(eventType, data) {
    for (const listener of this.listeners) {
      try {
        listener(eventType, data, this.state);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }

  // --- Getters ---
  getState() {
    return this.state;
  }

  getCurrentSubject() {
    return this.state.subjects.find(s => s.id === this.state.currentSubjectId) || this.state.subjects[0];
  }

  getAllSubjects() {
    return this.state.subjects;
  }

  getAllTopics(subject = null) {
    const s = subject || this.getCurrentSubject();
    if (!s || !s.chapters) return [];
    return s.chapters.flatMap(c => c.topics || []);
  }

  getTopicById(topicId, subject = null) {
    const topics = this.getAllTopics(subject);
    return topics.find(t => t.id === topicId) || null;
  }

  getChapterById(chapterId, subject = null) {
    const s = subject || this.getCurrentSubject();
    if (!s || !s.chapters) return null;
    return s.chapters.find(c => c.id === chapterId) || null;
  }

  getEdges(subject = null) {
    const s = subject || this.getCurrentSubject();
    return s && s.edges ? s.edges : [];
  }

  // Find direct prerequisites of a topic
  getPrerequisites(topicId, subject = null) {
    const edges = this.getEdges(subject);
    const prereqIds = edges.filter(e => e.to === topicId).map(e => e.from);
    const topics = this.getAllTopics(subject);
    return prereqIds.map(id => topics.find(t => t.id === id)).filter(Boolean);
  }

  // Find all recursive upstream ancestors (prerequisite chain)
  getAllPrerequisiteIds(topicId, subject = null) {
    const edges = this.getEdges(subject);
    const result = new Set();
    const queue = [topicId];
    while (queue.length > 0) {
      const current = queue.shift();
      const direct = edges.filter(e => e.to === current).map(e => e.from);
      for (const p of direct) {
        if (!result.has(p)) {
          result.add(p);
          queue.push(p);
        }
      }
    }
    return result;
  }

  // Find direct dependents (topics unlocked by this topic)
  getDependents(topicId, subject = null) {
    const edges = this.getEdges(subject);
    const dependentIds = edges.filter(e => e.from === topicId).map(e => e.to);
    const topics = this.getAllTopics(subject);
    return dependentIds.map(id => topics.find(t => t.id === id)).filter(Boolean);
  }

  // Find all recursive downstream dependents
  getAllDependentIds(topicId, subject = null) {
    const edges = this.getEdges(subject);
    const result = new Set();
    const queue = [topicId];
    while (queue.length > 0) {
      const current = queue.shift();
      const direct = edges.filter(e => e.from === current).map(e => e.to);
      for (const d of direct) {
        if (!result.has(d)) {
          result.add(d);
          queue.push(d);
        }
      }
    }
    return result;
  }

  // A topic is unlocked if all its prerequisites are mastered
  isTopicUnlocked(topicId, subject = null) {
    const prereqs = this.getPrerequisites(topicId, subject);
    if (prereqs.length === 0) return true;
    return prereqs.every(p => p.status === 'mastered');
  }

  // Topics ready to study right now: prerequisites satisfied, but not mastered yet
  getReadyToLearnTopics(subject = null) {
    const topics = this.getAllTopics(subject);
    return topics.filter(t => {
      if (t.status === 'mastered') return false;
      return this.isTopicUnlocked(t.id, subject);
    });
  }

  // Identify bottleneck topics: topics with largest downstream dependent count
  getBottlenecks(subject = null) {
    const topics = this.getAllTopics(subject);
    const list = topics.map(t => {
      const downstreamCount = this.getAllDependentIds(t.id, subject).size;
      return { topic: t, downstreamCount };
    });
    return list.sort((a, b) => b.downstreamCount - a.downstreamCount);
  }

  // Identify weak areas: low confidence (<=2), 'needs_revision', or high difficulty with low progress
  getWeakAreas(subject = null) {
    const topics = this.getAllTopics(subject);
    return topics.filter(t => {
      if (t.status === 'needs_revision') return true;
      if (t.confidence <= 2 && t.status !== 'not_started') return true;
      if ((t.difficulty === 'hard' || t.difficulty === 'expert') && t.status === 'in_progress' && t.confidence <= 3) return true;
      return false;
    });
  }

  // Calculate high-level subject diagnostic metrics
  calculateSubjectMetrics(subjectId = null) {
    const sub = subjectId ? this.state.subjects.find(s => s.id === subjectId) : this.getCurrentSubject();
    if (!sub) return null;

    const topics = this.getAllTopics(sub);
    const totalTopics = topics.length;
    if (totalTopics === 0) {
      return {
        totalTopics: 0,
        masteredCount: 0,
        inProgressCount: 0,
        needsRevisionCount: 0,
        notStartedCount: 0,
        masteryPercentage: 0,
        readinessScore: 0,
        totalEstHours: 0,
        totalActualHours: 0,
        remainingHours: 0,
        dueRevisionsCount: 0,
        chapterProgress: []
      };
    }

    const masteredCount = topics.filter(t => t.status === 'mastered').length;
    const inProgressCount = topics.filter(t => t.status === 'in_progress').length;
    const needsRevisionCount = topics.filter(t => t.status === 'needs_revision').length;
    const notStartedCount = topics.filter(t => t.status === 'not_started').length;

    const totalEstHours = topics.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
    const totalActualHours = topics.reduce((acc, t) => acc + (t.actualHours || 0), 0);

    const remainingHours = topics.reduce((acc, t) => {
      if (t.status === 'mastered') return acc;
      const rem = Math.max(0, (t.estimatedHours || 0) - (t.actualHours || 0));
      return acc + (rem > 0 ? rem : (t.estimatedHours || 2));
    }, 0);

    // Readiness Score (0-100):
    // 55% from mastered topics
    // 20% from in-progress topics
    // 15% from average confidence rating across covered topics
    // 10% penalty for overdue revisions or neglected weak areas
    const covered = topics.filter(t => t.status !== 'not_started');
    const avgConfidence = covered.length > 0
      ? covered.reduce((acc, t) => acc + (t.confidence || 1), 0) / covered.length
      : 1;

    const baseScore = ((masteredCount / totalTopics) * 60) +
                      ((inProgressCount / totalTopics) * 20) +
                      (((avgConfidence - 1) / 4) * 20);

    const todayStr = new Date().toISOString().slice(0, 10);
    const dueRevisions = topics.filter(t => {
      if (!t.revision || !t.revision.nextReview) return false;
      return t.revision.nextReview <= todayStr;
    });

    const overduePenalty = Math.min(15, dueRevisions.length * 3);
    const readinessScore = Math.max(0, Math.min(100, Math.round(baseScore - overduePenalty)));

    // Chapter progress breakdown
    const chapterProgress = (sub.chapters || []).map(ch => {
      const chTopics = ch.topics || [];
      const chTotal = chTopics.length;
      const chMastered = chTopics.filter(t => t.status === 'mastered').length;
      const chInProgress = chTopics.filter(t => t.status === 'in_progress').length;
      const chNeedsRev = chTopics.filter(t => t.status === 'needs_revision').length;
      const pct = chTotal > 0 ? Math.round((chMastered / chTotal) * 100) : 0;
      return {
        chapter: ch,
        total: chTotal,
        mastered: chMastered,
        inProgress: chInProgress,
        needsRevision: chNeedsRev,
        percentage: pct
      };
    });

    return {
      totalTopics,
      masteredCount,
      inProgressCount,
      needsRevisionCount,
      notStartedCount,
      masteryPercentage: Math.round((masteredCount / totalTopics) * 100),
      readinessScore,
      totalEstHours: Math.round(totalEstHours * 10) / 10,
      totalActualHours: Math.round(totalActualHours * 10) / 10,
      remainingHours: Math.round(remainingHours * 10) / 10,
      dueRevisionsCount: dueRevisions.length,
      dueRevisions,
      chapterProgress
    };
  }

  // --- Mutators ---

  switchSubject(subjectId) {
    if (this.state.currentSubjectId === subjectId) return;
    this.state.currentSubjectId = subjectId;
    this.state.selectedTopicId = null;
    this.state.filterChapter = 'all';
    this.save();
    this.notify('SUBJECT_SWITCHED', { subjectId });
  }

  setActiveView(view) {
    this.state.activeView = view;
    this.save();
    this.notify('VIEW_CHANGED', { view });
  }

  selectTopic(topicId) {
    this.state.selectedTopicId = topicId;
    this.notify('TOPIC_SELECTED', { topicId });
  }

  setFilters({ search, chapter, status, difficulty, highlightMode }) {
    if (search !== undefined) this.state.searchQuery = search;
    if (chapter !== undefined) this.state.filterChapter = chapter;
    if (status !== undefined) this.state.filterStatus = status;
    if (difficulty !== undefined) this.state.filterDifficulty = difficulty;
    if (highlightMode !== undefined) this.state.highlightMode = highlightMode;
    this.notify('FILTERS_CHANGED', this.state);
  }

  updateTopic(topicId, updates) {
    const sub = this.getCurrentSubject();
    if (!sub) return;

    let targetTopic = null;
    for (const ch of sub.chapters) {
      const found = (ch.topics || []).find(t => t.id === topicId);
      if (found) {
        Object.assign(found, updates);
        targetTopic = found;
        break;
      }
    }

    if (targetTopic) {
      // If status changed to mastered and no review date set, initialize spaced repetition
      if (updates.status === 'mastered' && (!targetTopic.revision || !targetTopic.revision.lastReviewed)) {
        const today = new Date();
        const nextDate = new Date();
        nextDate.setDate(today.getDate() + 1); // 1 day interval for box 1
        targetTopic.revision = {
          leitnerBox: 1,
          lastReviewed: today.toISOString().slice(0, 10),
          nextReview: nextDate.toISOString().slice(0, 10),
          reviewCount: 1
        };
      }

      this.save();
      this.notify('TOPIC_UPDATED', { topic: targetTopic });
    }
  }

  recordRevision(topicId, rating) {
    // rating: 1 (Forgot / Hard) to 5 (Effortless)
    const topic = this.getTopicById(topicId);
    if (!topic) return;

    if (!topic.revision) {
      topic.revision = { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 };
    }

    const today = new Date();
    let currentBox = topic.revision.leitnerBox || 1;

    if (rating >= 4) {
      currentBox = Math.min(5, currentBox + 1);
    } else if (rating <= 2) {
      currentBox = Math.max(1, currentBox - 1);
    }

    // Interval days by Leitner Box: Box 1: 1d, Box 2: 3d, Box 3: 7d, Box 4: 14d, Box 5: 30d
    const intervals = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
    const daysToAdd = intervals[currentBox] || 1;

    const nextDate = new Date();
    nextDate.setDate(today.getDate() + daysToAdd);

    topic.revision.leitnerBox = currentBox;
    topic.revision.lastReviewed = today.toISOString().slice(0, 10);
    topic.revision.nextReview = nextDate.toISOString().slice(0, 10);
    topic.revision.reviewCount = (topic.revision.reviewCount || 0) + 1;

    // If rating is high, ensure status is mastered; if 1 or 2, mark needs_revision
    if (rating <= 2) {
      topic.status = 'needs_revision';
      topic.confidence = Math.max(1, (topic.confidence || 3) - 1);
    } else {
      topic.status = 'mastered';
      topic.confidence = Math.min(5, Math.max(topic.confidence || 3, rating));
    }

    this.save();
    this.notify('REVISION_RECORDED', { topic, rating, nextReview: topic.revision.nextReview });
  }

  addSubject(subject) {
    this.state.subjects.push(subject);
    this.state.currentSubjectId = subject.id;
    this.state.selectedTopicId = null;
    this.save();
    this.notify('SUBJECT_ADDED', { subject });
  }

  updateSubject(subjectId, updates) {
    const sub = this.state.subjects.find(s => s.id === subjectId);
    if (sub) {
      Object.assign(sub, updates);
      this.save();
      this.notify('SUBJECT_UPDATED', { subject: sub });
    }
  }

  deleteSubject(subjectId) {
    if (this.state.subjects.length <= 1) {
      alert('You must keep at least one subject. You can reset to defaults if desired.');
      return;
    }
    this.state.subjects = this.state.subjects.filter(s => s.id !== subjectId);
    if (this.state.currentSubjectId === subjectId) {
      this.state.currentSubjectId = this.state.subjects[0].id;
    }
    this.save();
    this.notify('SUBJECT_DELETED', { subjectId });
  }

  addChapter(subjectId, title, color = '#4338ca') {
    const sub = this.state.subjects.find(s => s.id === subjectId) || this.getCurrentSubject();
    if (!sub) return null;
    const newCh = {
      id: 'ch-' + Date.now().toString(36),
      title: title.trim(),
      order: (sub.chapters.length || 0) + 1,
      color,
      topics: []
    };
    sub.chapters.push(newCh);
    this.save();
    this.notify('CHAPTER_ADDED', { chapter: newCh });
    return newCh;
  }

  addTopic(chapterId, topicData) {
    const sub = this.getCurrentSubject();
    if (!sub) return null;
    const ch = sub.chapters.find(c => c.id === chapterId);
    if (!ch) return null;

    const newTopic = {
      id: 'top-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4),
      title: topicData.title.trim(),
      chapterId: ch.id,
      difficulty: topicData.difficulty || 'medium',
      estimatedHours: parseFloat(topicData.estimatedHours) || 3.0,
      actualHours: 0,
      status: 'not_started',
      confidence: 1,
      prerequisites: topicData.prerequisites || [],
      notes: topicData.notes || '',
      keyTakeaways: topicData.keyTakeaways || [],
      revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
    };

    ch.topics.push(newTopic);

    // Add edges for any designated prerequisites
    if (Array.isArray(topicData.prerequisites)) {
      if (!sub.edges) sub.edges = [];
      for (const pId of topicData.prerequisites) {
        if (!sub.edges.some(e => e.from === pId && e.to === newTopic.id)) {
          sub.edges.push({ from: pId, to: newTopic.id });
        }
      }
    }

    this.save();
    this.notify('TOPIC_ADDED', { topic: newTopic });
    return newTopic;
  }

  deleteTopic(topicId) {
    const sub = this.getCurrentSubject();
    if (!sub) return;

    for (const ch of sub.chapters) {
      ch.topics = ch.topics.filter(t => t.id !== topicId);
    }
    // Remove related edges
    if (sub.edges) {
      sub.edges = sub.edges.filter(e => e.from !== topicId && e.to !== topicId);
    }

    if (this.state.selectedTopicId === topicId) {
      this.state.selectedTopicId = null;
    }

    this.save();
    this.notify('TOPIC_DELETED', { topicId });
  }

  addDependency(fromId, toId) {
    const sub = this.getCurrentSubject();
    if (!sub) return;
    if (fromId === toId) return; // No self loops

    if (!sub.edges) sub.edges = [];
    if (!sub.edges.some(e => e.from === fromId && e.to === toId)) {
      sub.edges.push({ from: fromId, to: toId });
      // Update prerequisites array on the target topic
      const target = this.getTopicById(toId, sub);
      if (target && !target.prerequisites.includes(fromId)) {
        target.prerequisites.push(fromId);
      }
      this.save();
      this.notify('DEPENDENCY_ADDED', { fromId, toId });
    }
  }

  removeDependency(fromId, toId) {
    const sub = this.getCurrentSubject();
    if (!sub || !sub.edges) return;

    sub.edges = sub.edges.filter(e => !(e.from === fromId && e.to === toId));
    const target = this.getTopicById(toId, sub);
    if (target) {
      target.prerequisites = target.prerequisites.filter(id => id !== fromId);
    }
    this.save();
    this.notify('DEPENDENCY_REMOVED', { fromId, toId });
  }

  resetToDemo() {
    this.state.subjects = JSON.parse(JSON.stringify(DEMO_SYLLABI));
    this.state.currentSubjectId = DEMO_SYLLABI[0].id;
    this.state.selectedTopicId = null;
    this.save();
    this.notify('RESET_TO_DEMO', {});
  }

  exportJSON() {
    const sub = this.getCurrentSubject();
    return JSON.stringify(sub, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.title || !parsed.chapters) {
        throw new Error('Invalid syllabus format. Must have title and chapters.');
      }
      if (!parsed.id) {
        parsed.id = 'imported-' + Date.now().toString(36);
      }
      this.addSubject(parsed);
      return { success: true, subject: parsed };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

export const store = new StateStore();
