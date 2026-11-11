// SyllabusFlow — Application UI & Interactive Learning Map
import { store } from './state.js';
import { computeGraphLayout, getCriticalPath, getDependencyPath, makeBezierPath } from './graph/layout.js';
import { parseSyllabusText, SAMPLE_SYLLABUS } from './parser/syllabus-parser.js';

const app = document.getElementById('app');
let mapTransform = { x: 32, y: 28, scale: 0.8 };
let dragState = null;
let importPreview = null;
let activeModal = null;
let reviewQueueIndex = 0;

const ICONS = {
  map: '⌘', outline: '☷', dashboard: '◔', revision: '◷', import: '＋', export: '⇩', more: '•••',
  mastered: '✓', in_progress: '▶', needs_revision: '!', not_started: '·', locked: '⌁'
};

const statusLabel = {
  mastered: 'Mastered', in_progress: 'In progress', needs_revision: 'Needs revision', not_started: 'Not started'
};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

function shortDate(dateString) {
  if (!dateString) return 'No date set';
  const d = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(d);
}

function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const date = new Date(`${dateString}T12:00:00`);
  return Math.ceil((date - today) / 86400000);
}

function toast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  document.getElementById('toast-region').append(el);
  setTimeout(() => el.remove(), 3200);
}

function statusClass(topic) {
  if (topic.status === 'not_started' && !store.isTopicUnlocked(topic.id)) return 'locked';
  return topic.status;
}

function getFilteredTopics(subject) {
  const state = store.getState();
  const query = state.searchQuery.trim().toLowerCase();
  return store.getAllTopics(subject).filter(topic => {
    const status = statusClass(topic);
    const matchesSearch = !query || topic.title.toLowerCase().includes(query) || (topic.notes || '').toLowerCase().includes(query);
    const matchesChapter = state.filterChapter === 'all' || topic.chapterId === state.filterChapter;
    const matchesStatus = state.filterStatus === 'all' || status === state.filterStatus || topic.status === state.filterStatus;
    const matchesDifficulty = state.filterDifficulty === 'all' || topic.difficulty === state.filterDifficulty;
    return matchesSearch && matchesChapter && matchesStatus && matchesDifficulty;
  });
}

function renderSidebar() {
  const state = store.getState();
  const subjects = store.getAllSubjects();
  const metrics = store.calculateSubjectMetrics();
  const navItems = [
    ['map', ICONS.map, 'Learning map'],
    ['outline', ICONS.outline, 'Syllabus outline'],
    ['dashboard', ICONS.dashboard, 'Progress dashboard'],
    ['revision', ICONS.revision, 'Revision queue']
  ];
  return `
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">⌘</div><div><div class="brand-name">SyllabusFlow</div><div class="brand-tag">See what learning unlocks</div></div></div>
      <div class="subject-selector">
        <label for="subject-switch">ACTIVE LEARNING MAP</label>
        <select id="subject-switch" aria-label="Select subject">
          ${subjects.map(s => `<option value="${s.id}" ${s.id === state.currentSubjectId ? 'selected' : ''}>${escapeHtml(s.code)} · ${escapeHtml(s.title)}</option>`).join('')}
        </select>
      </div>
      <nav class="nav-group" aria-label="Main navigation">
        ${navItems.map(([view, icon, label]) => `<button class="nav-button ${state.activeView === view ? 'active' : ''}" data-view="${view}"><span class="nav-icon">${icon}</span>${label}${view === 'revision' && metrics.dueRevisionsCount ? `<span class="nav-badge">${metrics.dueRevisionsCount}</span>` : ''}</button>`).join('')}
      </nav>
      <div class="sidebar-spacer"></div>
      <div class="sidebar-bottom"><strong>Your map is local.</strong><br>Changes persist in this browser. Export a JSON backup anytime.</div>
    </aside>`;
}

function renderTopbar(subject) {
  return `<header class="topbar">
    <div class="breadcrumb"><span class="breadcrumb-code">${escapeHtml(subject.code)}</span><h1>${escapeHtml(subject.title)}</h1></div>
    <div class="topbar-actions">
      <button class="icon-button" data-action="export" title="Export this syllabus as JSON">${ICONS.export} Export</button>
      <button class="icon-button" data-action="open-topic-modal" title="Add a topic">＋ Topic</button>
      <button class="button primary" data-action="open-import">${ICONS.import} Add syllabus</button>
    </div>
  </header>`;
}

function renderSubjectOverview(subject, metrics) {
  const days = daysUntil(subject.targetExamDate);
  const examText = days === null ? 'Set an exam date' : days < 0 ? 'Exam date passed' : `${days} days to exam`;
  return `<section class="subject-overview">
    <div><p class="kicker">INTERACTIVE LEARNING MAP</p><h2>Know your next move—not just your next chapter.</h2><p>${escapeHtml(subject.description || '')}</p></div>
    <div class="exam-pill"><b>${examText}</b><br>${subject.targetExamDate ? shortDate(subject.targetExamDate) : 'No target date'}</div>
  </section>
  <section class="metrics-row" aria-label="Subject metrics">
    <article class="metric metric-feature"><div class="metric-label">Readiness score</div><div class="metric-value">${metrics.readinessScore}<small style="font-size:14px;letter-spacing:0"> / 100</small></div><div class="metric-note">Mastery, confidence & review health</div></article>
    <article class="metric"><div class="metric-label">Topics mastered</div><div class="metric-value">${metrics.masteredCount}<span style="font-size:15px;color:#8390a6"> / ${metrics.totalTopics}</span></div><div class="metric-note">${metrics.masteryPercentage}% of learning map</div></article>
    <article class="metric"><div class="metric-label">Study time logged</div><div class="metric-value metric-hour">${metrics.totalActualHours}<span style="font-size:15px;color:#8390a6">h</span></div><div class="metric-note">${metrics.remainingHours}h remaining estimate</div></article>
    <article class="metric"><div class="metric-label">Revision queue</div><div class="metric-value" style="color:${metrics.dueRevisionsCount ? 'var(--rose)' : 'var(--mint)'}">${metrics.dueRevisionsCount}</div><div class="metric-note">${metrics.dueRevisionsCount ? 'topics due today' : 'You are caught up'}</div></article>
  </section>`;
}

function renderMapToolbar(subject) {
  const state = store.getState();
  return `<div class="map-toolbar">
    <div class="toolbar-left">
      <div class="search-box"><span class="search-symbol">⌕</span><input id="map-search" type="search" value="${escapeHtml(state.searchQuery)}" placeholder="Find a concept" aria-label="Find a topic"></div>
      <select id="chapter-filter" class="toolbar-select" aria-label="Filter chapter"><option value="all">All chapters</option>${subject.chapters.map(ch => `<option value="${ch.id}" ${state.filterChapter === ch.id ? 'selected' : ''}>${escapeHtml(ch.title)}</option>`).join('')}</select>
      <select id="status-filter" class="toolbar-select" aria-label="Filter progress"><option value="all">Any progress</option><option value="mastered" ${state.filterStatus === 'mastered' ? 'selected' : ''}>Mastered</option><option value="in_progress" ${state.filterStatus === 'in_progress' ? 'selected' : ''}>In progress</option><option value="needs_revision" ${state.filterStatus === 'needs_revision' ? 'selected' : ''}>Needs revision</option><option value="not_started" ${state.filterStatus === 'not_started' ? 'selected' : ''}>Not started</option></select>
    </div>
    <div class="toolbar-right">
      <button class="compact-toggle ${state.highlightMode === 'ready' ? 'active' : ''}" data-highlight="ready">Ready next</button>
      <button class="compact-toggle ${state.highlightMode === 'critical' ? 'active' : ''}" data-highlight="critical">Critical path</button>
      <button class="compact-toggle ${state.highlightMode === 'none' ? 'active' : ''}" data-highlight="none">Clear</button>
    </div>
  </div>`;
}

function titleLines(title, maxLength = 28) {
  if (title.length <= maxLength) return [title];
  const words = title.split(' ');
  const lines = [''];
  for (const word of words) {
    const attempt = `${lines[lines.length - 1]} ${word}`.trim();
    if (attempt.length > maxLength && lines.length === 1) lines.push(word);
    else lines[lines.length - 1] = attempt;
  }
  return lines.slice(0, 2).map((line, idx) => idx === 1 && line.length > maxLength ? `${line.slice(0, maxLength - 1)}…` : line);
}

function renderMap(subject) {
  const layout = computeGraphLayout(subject);
  const state = store.getState();
  const filteredIds = new Set(getFilteredTopics(subject).map(t => t.id));
  const selectedId = state.selectedTopicId;
  const selectedTopic = selectedId ? store.getTopicById(selectedId, subject) : null;
  const criticalPath = getCriticalPath(subject);
  const dependencyPath = selectedId ? getDependencyPath(subject, selectedId) : { ancestors: new Set(), descendants: new Set() };
  const readyIds = new Set(store.getReadyToLearnTopics(subject).map(t => t.id));
  const fadedByHighlight = id => {
    if (state.highlightMode === 'critical') return !criticalPath.has(id);
    if (state.highlightMode === 'ready') return !readyIds.has(id);
    return false;
  };

  const edgeMarkup = (subject.edges || []).map(edge => {
    const source = layout.positions.get(edge.from); const target = layout.positions.get(edge.to);
    if (!source || !target) return '';
    let classes = 'edge';
    const sourceVisible = filteredIds.has(edge.from); const targetVisible = filteredIds.has(edge.to);
    if (!sourceVisible || !targetVisible) classes += ' dim';
    if (selectedId && dependencyPath.ancestors.has(edge.from) && (edge.to === selectedId || dependencyPath.ancestors.has(edge.to))) classes += ' active-prereq';
    if (selectedId && dependencyPath.descendants.has(edge.to) && (edge.from === selectedId || dependencyPath.descendants.has(edge.from))) classes += ' active-dependent';
    if (state.highlightMode === 'critical' && criticalPath.has(edge.from) && criticalPath.has(edge.to)) classes += ' critical';
    if ((state.highlightMode === 'critical' && (!criticalPath.has(edge.from) || !criticalPath.has(edge.to))) || (state.highlightMode === 'ready' && (!readyIds.has(edge.from) && !readyIds.has(edge.to)))) classes += ' dim';
    return `<path class="${classes}" d="${makeBezierPath(source, target)}" marker-end="url(#arrow-normal)" />`;
  }).join('');

  const nodes = layout.graph.topics.map(topic => {
    const pos = layout.positions.get(topic.id); if (!pos) return '';
    const chapter = store.getChapterById(topic.chapterId, subject);
    const nodeStatus = statusClass(topic);
    const isDim = !filteredIds.has(topic.id) || fadedByHighlight(topic.id);
    const selected = topic.id === selectedId;
    const lines = titleLines(topic.title);
    const difficultyColor = { easy: '#0c9870', medium: '#047eaa', hard: '#c96b05', expert: '#d64f61' }[topic.difficulty] || '#047eaa';
    const progressColor = { mastered: '#0c9870', in_progress: '#7771ed', needs_revision: '#d64f61', not_started: '#9aa7b9', locked: '#b5bfce' }[nodeStatus];
    const icon = nodeStatus === 'locked' ? ICONS.locked : ICONS[nodeStatus];
    const statusText = nodeStatus === 'locked' ? 'Locked' : statusLabel[nodeStatus];
    return `<g class="node ${isDim ? 'is-dim' : ''} ${selected ? 'is-selected' : ''} ${nodeStatus === 'locked' ? 'is-locked' : ''}" data-topic-id="${topic.id}" transform="translate(${pos.x},${pos.y})">
      <rect class="node-card" width="${pos.width}" height="${pos.height}" rx="12" />
      <rect class="node-colorbar" width="7" height="${pos.height}" fill="${chapter?.color || '#4338ca'}" />
      <text class="node-chapter" x="20" y="22">${escapeHtml((chapter?.title || 'Topic').slice(0, 25).toUpperCase())}</text>
      <circle class="node-status-circle" cx="218" cy="18" r="10" fill="${progressColor}"/><text class="node-status-mark" x="218" y="22" text-anchor="middle">${icon}</text>
      <text class="node-title" x="20" y="48">${escapeHtml(lines[0] || '')}</text>
      ${lines[1] ? `<text class="node-title" x="20" y="64">${escapeHtml(lines[1])}</text>` : ''}
      <circle cx="22" cy="87" r="4" fill="${difficultyColor}"/><text class="node-meta" x="31" y="91">${topic.estimatedHours}h · ${escapeHtml(statusText)}</text>
    </g>`;
  }).join('');

  const miniNodes = layout.graph.topics.map(t => {
    const p = layout.positions.get(t.id); const ch = store.getChapterById(t.chapterId, subject);
    return `<rect x="${p.x / layout.width * 136}" y="${p.y / layout.height * 91}" width="10" height="5" rx="1" fill="${ch?.color || '#4338ca'}" opacity=".75" />`;
  }).join('');

  return `${renderMapToolbar(subject)}
    <div class="map-viewport" id="map-viewport">
      ${selectedTopic ? `<div style="position:absolute;left:16px;top:14px;padding:7px 12px;border-radius:10px;background:rgba(255,255,255,.94);border:1px solid #c7d2fe;box-shadow:0 4px 12px rgba(79,70,229,.12);font-size:11px;color:#1e293b;display:flex;align-items:center;gap:10px;z-index:5">
        <span>Active topic: <strong>${escapeHtml(selectedTopic.title)}</strong></span>
        <span style="color:var(--indigo)">● ${dependencyPath.ancestors.size} prerequisite${dependencyPath.ancestors.size === 1 ? '' : 's'}</span>
        <span style="color:var(--mint)">● ${dependencyPath.descendants.size} unlocked</span>
        <button style="border:0;background:transparent;color:#64748b;font-weight:700;padding:0 4px;font-size:12px" data-action="close-drawer" title="Clear selection">✕</button>
      </div>` : ''}
      <svg class="map-canvas" id="learning-map" aria-label="Interactive topic dependency map" role="img" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="canvas-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="#dfe7f1" stroke-width=".7" opacity=".65" /></pattern>
          <marker id="arrow-normal" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#bdc9db" /></marker>
          <filter id="node-shadow" x="-15%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#50617b" flood-opacity=".10"/></filter>
          <filter id="node-shadow-hover" x="-15%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#4f46e5" flood-opacity=".22"/></filter>
        </defs>
        <g id="map-transform" transform="translate(${mapTransform.x} ${mapTransform.y}) scale(${mapTransform.scale})">
          <rect class="map-background" x="-400" y="-400" width="${layout.width + 800}" height="${layout.height + 800}" />
          ${edgeMarkup}${nodes}
        </g>
      </svg>
      <div class="minimap"><svg viewBox="0 0 136 91"><rect width="136" height="91" fill="#fbfdff"/>${miniNodes}<rect x="20" y="19" width="80" height="51" fill="none" stroke="#7771ed" stroke-width="1.2" opacity=".7" /></svg></div>
      <div class="map-legend"><span class="legend-item"><i class="legend-dot" style="background:#0c9870"></i>Mastered</span><span class="legend-item"><i class="legend-dot" style="background:#7771ed"></i>In progress</span><span class="legend-item"><i class="legend-dot" style="background:#d64f61"></i>Review</span><span class="legend-item"><i class="legend-dot" style="background:#b5bfce"></i>Locked</span></div>
      <div class="map-controls"><button data-map-control="in" title="Zoom in">+</button><button data-map-control="out" title="Zoom out">−</button><button data-map-control="fit" title="Fit map">⤢</button></div>
      ${layout.hasCycle ? '<div style="position:absolute;left:16px;top:14px;padding:8px 10px;border-radius:8px;background:#fff2d8;color:#9a5505;font-size:11px;box-shadow:0 3px 8px #0001">Dependency loop detected—review your prerequisites.</div>' : ''}
    </div>`;
}

function renderDashboard(subject, metrics) {
  const readyTopics = store.getReadyToLearnTopics(subject).sort((a,b) => store.getAllDependentIds(b.id, subject).size - store.getAllDependentIds(a.id, subject).size).slice(0, 3);
  const weak = store.getWeakAreas(subject).slice(0, 4);
  const bottleneck = store.getBottlenecks(subject).filter(b => b.topic.status !== 'mastered')[0];
  return `<div class="dashboard-grid">
    <section class="panel"><div class="panel-head"><div><h3>Chapter momentum</h3><p>Mastery measures concepts you can recall and use—not just read.</p></div><span class="chapter-topic-count">${metrics.masteredCount}/${metrics.totalTopics} mastered</span></div>
      <div class="chapter-list">${metrics.chapterProgress.map(cp => { const p1=cp.total ? cp.mastered/cp.total*100:0; const p2=cp.total ? cp.inProgress/cp.total*100:0; const p3=cp.total ? cp.needsRevision/cp.total*100:0; return `<div class="chapter-line"><div class="chapter-line-main"><div class="chapter-title"><span><i style="display:inline-block;width:8px;height:8px;border-radius:3px;background:${cp.chapter.color};margin-right:7px"></i>${escapeHtml(cp.chapter.title)}</span><small>${cp.mastered} mastered</small></div><div class="progress-track"><span class="progress-mastered" style="width:${p1}%"></span><span class="progress-in-progress" style="width:${p2}%"></span><span class="progress-revision" style="width:${p3}%"></span></div></div><div class="chapter-percent">${cp.percentage}%</div></div>`; }).join('')}</div>
    </section>
    <aside style="display:grid;gap:18px;align-content:start">
      <section class="panel"><div class="panel-head"><div><h3>Best next moves</h3><p>All prerequisites are complete.</p></div></div><div class="recommendations">${readyTopics.length ? readyTopics.map((topic, i) => `<button class="recommendation" data-select-topic="${topic.id}"><span class="reco-number">${i+1}</span><span class="reco-copy"><strong>${escapeHtml(topic.title)}</strong><span>${topic.estimatedHours}h · unlocks ${store.getAllDependentIds(topic.id, subject).size} concepts</span></span></button>`).join('') : '<div class="empty-state">Everything available is mastered. Add a new topic to keep growing.</div>'}</div></section>
      <section class="panel"><div class="panel-head"><div><h3>Watch list</h3><p>Weak areas and learning bottlenecks.</p></div></div><div class="warning-list">${weak.map(topic => `<button class="warning-card" data-select-topic="${topic.id}"><strong>${escapeHtml(topic.title)}</strong><p>${topic.status === 'needs_revision' ? 'Needs a recall session' : `Confidence ${topic.confidence}/5`} · ${topic.estimatedHours}h topic</p></button>`).join('')}${bottleneck ? `<button class="warning-card" style="border-left-color:#c96b05;background:#fffbf3" data-select-topic="${bottleneck.topic.id}"><strong style="color:#72450c">Bottleneck: ${escapeHtml(bottleneck.topic.title)}</strong><p style="color:#9a6d32">Unlocks ${bottleneck.downstreamCount} downstream concepts.</p></button>` : ''}${!weak.length && !bottleneck ? '<div class="empty-state">No weak areas detected.</div>' : ''}</div></section>
    </aside>
  </div>`;
}

function renderOutline(subject) {
  const allTopics = store.getAllTopics(subject);
  return `<div class="outline-layout"><main>${subject.chapters.map(ch => `<section class="panel chapter-card"><header class="chapter-card-head"><strong><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:${ch.color};margin-right:8px"></i>${escapeHtml(ch.title)}</strong><span class="chapter-topic-count">${ch.topics.length} topics</span></header>${ch.topics.map(topic => { const st=statusClass(topic); return `<div class="topic-row"><button title="Cycle progress" class="status-toggle ${st}" data-cycle-topic="${topic.id}">${st === 'locked' ? '⌁' : ICONS[topic.status]}</button><button class="topic-name" data-select-topic="${topic.id}">${escapeHtml(topic.title)}</button><span class="topic-row-meta">${topic.estimatedHours}h · ${store.getPrerequisites(topic.id, subject).length} prerequisite${store.getPrerequisites(topic.id, subject).length === 1 ? '' : 's'}</span><span class="difficulty-tag difficulty-${topic.difficulty}">${topic.difficulty}</span></div>`; }).join('')}</section>`).join('')}</main>
  <aside class="panel outline-aside"><h3>Make the map yours</h3><p>Add a topic, connect its prerequisites, or import a text outline. SyllabusFlow keeps the graph and study plan updated locally.</p><button class="button primary" style="width:100%;margin-bottom:8px" data-action="open-topic-modal">＋ Add a topic</button><button class="button" style="width:100%" data-action="open-import">Import outline</button><div class="create-topic-form"><p style="margin:0;color:#7b879b">${allTopics.length} topics · ${subject.edges.length} learning links</p></div></aside></div>`;
}

function getRevisionGroups(subject) {
  const today = new Date().toISOString().slice(0,10);
  const topics = store.getAllTopics(subject).filter(t => t.revision?.nextReview);
  const due = topics.filter(t => t.revision.nextReview <= today).sort((a,b) => a.revision.nextReview.localeCompare(b.revision.nextReview));
  const upcoming = topics.filter(t => t.revision.nextReview > today).sort((a,b) => a.revision.nextReview.localeCompare(b.revision.nextReview));
  return { due, upcoming, all: topics };
}

function renderRevision(subject, metrics) {
  const groups = getRevisionGroups(subject);
  const boxCounts = [1,2,3,4,5].map(box => store.getAllTopics(subject).filter(t => (t.revision?.leitnerBox || 1) === box && t.revision?.nextReview).length);
  return `<div class="revision-layout"><main class="panel review-card"><div class="review-hero"><small>SPACED RECALL SYSTEM · LEITNER METHOD</small><h3>${groups.due.length ? `${groups.due.length} concepts want a return visit` : 'Your recall rhythm is clear'}</h3><p>${groups.due.length ? 'Rate how confidently you retrieve each concept. SyllabusFlow adjusts the next review interval automatically.' : 'No topics are due today. Keep learning new material or explore your next scheduled reviews.'}</p><button class="button primary" style="margin-top:15px;background:#fff;color:#3730a3;border-color:#fff" data-action="start-review" ${groups.due.length ? '' : 'disabled'}>Start quick review</button></div><div class="panel-head" style="padding:4px 0 12px"><div><h3 style="font-size:18px">Due & overdue</h3><p>Earlier cards appear first.</p></div></div><div class="review-list">${groups.due.length ? groups.due.map(topic => `<div class="review-item"><div class="review-date">${shortDate(topic.revision.nextReview).replace(' ','<br>')}</div><div class="review-copy"><strong>${escapeHtml(topic.title)}</strong><span>Box ${topic.revision.leitnerBox} · ${topic.revision.reviewCount} reviews completed</span></div><button class="button" data-select-topic="${topic.id}">Open</button></div>`).join('') : '<div class="empty-state">No revision cards are due today.</div>'}</div></main>
    <aside style="display:grid;gap:18px;align-content:start"><section class="panel review-card"><div class="panel-head" style="padding:0 0 14px"><div><h3 style="font-size:20px">Recall distribution</h3><p>Longer intervals mean stronger retention.</p></div></div><div class="revision-stats">${boxCounts.map((count,i) => `<div class="revision-stat"><b>${count}</b><span>Box ${i+1} · ${[1,3,7,14,30][i]}d</span></div>`).join('')}</div></section><section class="panel review-card"><div class="panel-head" style="padding:0 0 12px"><div><h3 style="font-size:20px">Coming up</h3><p>Next scheduled reinforcement.</p></div></div><div class="review-list">${groups.upcoming.slice(0,4).map(t=>`<div class="review-item"><div class="review-date">${shortDate(t.revision.nextReview).replace(' ','<br>')}</div><div class="review-copy"><strong>${escapeHtml(t.title)}</strong><span>Box ${t.revision.leitnerBox} · ${t.difficulty}</span></div></div>`).join('') || '<div class="empty-state">Complete a topic to start its revision cycle.</div>'}</div></section></aside>
  </div>`;
}

function renderTopicDrawer() {
  const { selectedTopicId } = store.getState();
  const topic = selectedTopicId ? store.getTopicById(selectedTopicId) : null;
  if (!topic) return '<div class="drawer-scrim"></div><aside class="topic-drawer"></aside>';
  const subject = store.getCurrentSubject(); const chapter = store.getChapterById(topic.chapterId); const prereqs = store.getPrerequisites(topic.id); const dependents = store.getDependents(topic.id);
  return `<div class="drawer-scrim open" data-action="close-drawer"></div><aside class="topic-drawer open" aria-label="Topic details"><header class="drawer-head"><div class="drawer-head-top"><span class="difficulty-tag difficulty-${topic.difficulty}">${topic.difficulty}</span><button class="close" data-action="close-drawer" aria-label="Close topic details">×</button></div><p class="drawer-chapter">${escapeHtml(chapter?.title || 'Learning map')}</p><h3>${escapeHtml(topic.title)}</h3><div class="drawer-subhead"><span style="font-size:12px;color:#65718a">${topic.estimatedHours}h estimated</span><span style="font-size:12px;color:#65718a">·</span><span style="font-size:12px;color:#65718a">${topic.actualHours || 0}h logged</span><button class="button ghost" style="padding:0;color:var(--indigo);margin-left:auto" data-action="focus-topic">Focus on map</button></div></header><div class="drawer-body">
    <section class="drawer-section"><h4>LEARNING STATUS</h4><div class="status-select">${Object.entries(statusLabel).map(([key,label]) => `<button class="status-choice ${topic.status===key ? 'active':''}" data-set-status="${key}">${ICONS[key]} ${label}</button>`).join('')}</div></section>
    <section class="drawer-section"><h4>CONFIDENCE · ${topic.confidence || 1}/5</h4><div class="confidence-row">${[1,2,3,4,5].map(n => `<button class="confidence-star ${n <= (topic.confidence || 1) ? 'selected':''}" data-set-confidence="${n}" aria-label="Set confidence to ${n}">★</button>`).join('')}</div></section>
    <section class="drawer-section"><h4>LOG FOCUSED STUDY</h4><div class="quick-hours"><button data-log-hours="0.5">+ 30 min</button><button data-log-hours="1">+ 1 hour</button><button data-log-hours="2">+ 2 hours</button></div></section>
    <section class="drawer-section"><h4>PREREQUISITES · ${prereqs.length}</h4><div class="drawer-list">${prereqs.length ? prereqs.map(p=>`<button class="drawer-link" data-select-topic="${p.id}">${p.status === 'mastered' ? '✓' : '○'} ${escapeHtml(p.title)}</button>`).join('') : '<div style="font-size:12px;color:#758298">This is a foundational concept.</div>'}</div></section>
    <section class="drawer-section"><h4>UNLOCKS NEXT · ${dependents.length}</h4><div class="drawer-list">${dependents.length ? dependents.map(p=>`<button class="drawer-link" data-select-topic="${p.id}">→ ${escapeHtml(p.title)}</button>`).join('') : '<div style="font-size:12px;color:#758298">This is currently an end-point in your map.</div>'}</div></section>
    <section class="drawer-section"><h4>YOUR STUDY NOTES</h4><textarea class="note-textarea" id="topic-notes" placeholder="Capture a proof, formula, misconception, or example…">${escapeHtml(topic.notes || '')}</textarea><div style="text-align:right;margin-top:7px"><button class="button" data-action="save-notes">Save notes</button></div></section>
    ${topic.keyTakeaways?.length ? `<section class="drawer-section"><h4>KEY TAKEAWAYS</h4>${topic.keyTakeaways.map(t=>`<div class="takeaway">${escapeHtml(t)}</div>`).join('')}</section>` : ''}
  </div></aside>`;
}

function renderImportModal() {
  const preview = importPreview;
  return `<div class="modal-scrim" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-label="Import syllabus" onclick="event.stopPropagation()"><header class="modal-head"><div><h3>Turn an outline into a learning map</h3><p>Paste a Markdown or plain-text syllabus. Topic dependencies use <code>[prereq: Topic name]</code>; hours and difficulty are optional.</p></div><button class="close" data-action="close-modal">×</button></header><div class="modal-body"><div class="form-grid"><div class="form-field"><label for="import-code">Course code</label><input id="import-code" placeholder="e.g. BIO 104" value="${escapeHtml(preview?.meta?.code || '')}"></div><div class="form-field"><label for="import-title">Course title</label><input id="import-title" placeholder="e.g. Cell Biology" value="${escapeHtml(preview?.meta?.title || '')}"></div><div class="form-field full"><label for="import-exam">Exam date (optional)</label><input id="import-exam" type="date" value="${escapeHtml(preview?.meta?.targetExamDate || '')}"></div><div class="form-field full"><label for="import-text">Syllabus outline</label><textarea id="import-text" placeholder="Paste your outline here">${escapeHtml(preview?.text || SAMPLE_SYLLABUS)}</textarea></div></div><button class="button" data-action="load-sample">Use sample structure</button><div class="upload-zone"><input type="file" id="text-upload" accept=".txt,.md,.markdown,.json"><label for="text-upload">Choose a .txt or .md outline</label> · parsed locally in your browser</div>${preview?.result ? `<div class="parse-result">${preview.result.subject ? `Detected <b>${preview.result.subject.chapters.length}</b> chapters, <b>${preview.result.subject.chapters.reduce((sum,ch)=>sum+ch.topics.length,0)}</b> topics, and <b>${preview.result.subject.edges.length}</b> dependency links.` : 'No syllabus found.'}${preview.result.warnings?.length ? `<br><span style="color:#b45c05">${preview.result.warnings.map(escapeHtml).join('<br>')}</span>` : ''}</div>` : ''}</div><footer class="modal-actions"><button class="button" data-action="close-modal">Cancel</button><button class="button" data-action="parse-outline">Preview map</button><button class="button primary" data-action="import-outline" ${preview?.result?.subject ? '' : 'disabled'}>Add to SyllabusFlow</button></footer></section></div>`;
}

function renderTopicModal() {
  const subject = store.getCurrentSubject();
  const topics = store.getAllTopics(subject);
  return `<div class="modal-scrim" data-action="close-modal"><section class="modal" style="width:min(590px,100%)" role="dialog" aria-modal="true" aria-label="Add a topic" onclick="event.stopPropagation()"><header class="modal-head"><div><h3>Add a topic</h3><p>Topics can be immediately connected to prerequisites already in your learning map.</p></div><button class="close" data-action="close-modal">×</button></header><div class="modal-body"><div class="form-grid"><div class="form-field full"><label for="new-topic-title">Topic title</label><input id="new-topic-title" placeholder="e.g. Dijkstra's Algorithm"></div><div class="form-field"><label for="new-topic-chapter">Chapter</label><select id="new-topic-chapter">${subject.chapters.map(ch=>`<option value="${ch.id}">${escapeHtml(ch.title)}</option>`).join('')}</select></div><div class="form-field"><label for="new-topic-hours">Study hours</label><input id="new-topic-hours" type="number" min=".5" step=".5" value="3"></div><div class="form-field"><label for="new-topic-difficulty">Difficulty</label><select id="new-topic-difficulty"><option value="easy">Easy</option><option value="medium" selected>Medium</option><option value="hard">Hard</option><option value="expert">Expert</option></select></div><div class="form-field full"><label for="new-topic-prereqs">Prerequisites (optional)</label><select id="new-topic-prereqs" multiple size="6">${topics.map(t=>`<option value="${t.id}">${escapeHtml(t.title)}</option>`).join('')}</select></div></div></div><footer class="modal-actions"><button class="button" data-action="close-modal">Cancel</button><button class="button primary" data-action="create-topic">Add topic</button></footer></section></div>`;
}

function renderReviewModal() {
  const subject = store.getCurrentSubject(); const groups = getRevisionGroups(subject); const topic = groups.due[reviewQueueIndex];
  if (!topic) { activeModal = null; reviewQueueIndex = 0; render(); toast('All due review cards are complete.'); return ''; }
  return `<div class="modal-scrim"><section class="modal" style="width:min(520px,100%)" role="dialog" aria-modal="true" aria-label="Quick review"><header class="modal-head"><div><h3>Quick recall</h3><p>Card ${reviewQueueIndex+1} of ${groups.due.length}. Retrieve the concept before reading your notes.</p></div><button class="close" data-action="end-review">×</button></header><div class="modal-body"><div style="padding:20px;border-radius:13px;background:#f5f6ff;border:1px solid #e1e1ff"><p class="kicker" style="margin-bottom:8px">${escapeHtml(store.getChapterById(topic.chapterId)?.title || '')}</p><h3 style="font-family:Fraunces,Georgia,serif;letter-spacing:-.04em;font-size:28px;margin:0;color:#15213a">${escapeHtml(topic.title)}</h3><p style="font-size:12px;color:#627089;line-height:1.6;margin:13px 0 0">How clearly can you explain this without a prompt?</p></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:18px">${[['1','Forgot'],['2','Hard'],['3','Okay'],['4','Clear'],['5','Easy']].map(([rating,label])=>`<button class="button" style="height:60px;flex-direction:column;gap:1px" data-review-rating="${rating}"><b style="font-size:17px">${rating}</b><small style="font-size:9px">${label}</small></button>`).join('')}</div></div><footer class="modal-actions"><button class="button" data-action="show-review-notes">Show notes</button><button class="button" data-action="end-review">End session</button></footer></section></div>`;
}

function renderModal() {
  if (activeModal === 'import') return renderImportModal();
  if (activeModal === 'topic') return renderTopicModal();
  if (activeModal === 'review') return renderReviewModal();
  return '';
}

function renderMobileNav() {
  const state = store.getState();
  return `<nav class="mobile-nav" aria-label="Mobile navigation">${[['map','⌘','Map'],['outline','☷','Outline'],['dashboard','◔','Progress'],['revision','◷','Review']].map(([view,icon,label])=>`<button class="${state.activeView===view?'active':''}" data-view="${view}"><span>${icon}</span>${label}</button>`).join('')}</nav>`;
}

function render() {
  const subject = store.getCurrentSubject();
  if (!subject) return;
  const metrics = store.calculateSubjectMetrics();
  const state = store.getState();
  let content = '';
  if (state.activeView === 'map') content = `${renderSubjectOverview(subject, metrics)}${renderMap(subject)}`;
  else if (state.activeView === 'dashboard') content = `${renderSubjectOverview(subject, metrics)}${renderDashboard(subject, metrics)}`;
  else if (state.activeView === 'outline') content = `${renderSubjectOverview(subject, metrics)}${renderOutline(subject)}`;
  else if (state.activeView === 'revision') content = `${renderSubjectOverview(subject, metrics)}${renderRevision(subject, metrics)}`;

  app.innerHTML = `<div class="app-shell">${renderSidebar()}<main class="main">${renderTopbar(subject)}<div class="content">${content}</div></main></div>${renderMobileNav()}${renderTopicDrawer()}${renderModal()}`;
  attachEvents();
}

function updateTransform() {
  const transform = document.getElementById('map-transform');
  if (transform) transform.setAttribute('transform', `translate(${mapTransform.x} ${mapTransform.y}) scale(${mapTransform.scale})`);
}

function fitMap() {
  const subject = store.getCurrentSubject(); const layout = computeGraphLayout(subject);
  const viewport = document.getElementById('map-viewport');
  if (!viewport) return;
  const rect = viewport.getBoundingClientRect();
  const scale = Math.min((rect.width - 55) / layout.width, (rect.height - 55) / layout.height, 1);
  mapTransform = { x: (1000 - layout.width * scale) / 2, y: Math.max(15, (700 - layout.height * scale) / 2), scale: Math.max(.32, scale) };
  updateTransform();
}

function cycleTopicStatus(topicId) {
  const topic = store.getTopicById(topicId); if (!topic) return;
  const stages = ['not_started','in_progress','mastered'];
  const startIndex = stages.indexOf(topic.status);
  const next = topic.status === 'needs_revision' ? 'in_progress' : stages[(startIndex+1)%stages.length];
  store.updateTopic(topicId, { status: next });
  toast(`${topic.title}: ${statusLabel[next]}`);
}

function handleEvent(event) {
  const target = event.target.closest('[data-action],[data-view],[data-select-topic],[data-cycle-topic],[data-set-status],[data-set-confidence],[data-log-hours],[data-highlight],[data-map-control],[data-review-rating]');
  if (!target) return;
  const { action, view, selectTopic, cycleTopic, setStatus, setConfidence, logHours, highlight, mapControl, reviewRating } = target.dataset;

  if (view) { store.setActiveView(view); return; }
  if (selectTopic) { store.selectTopic(selectTopic); return; }
  if (cycleTopic) { cycleTopicStatus(cycleTopic); return; }
  if (highlight !== undefined) { store.setFilters({ highlightMode: highlight }); return; }
  if (mapControl) {
    if (mapControl === 'in') mapTransform.scale = Math.min(1.8, mapTransform.scale * 1.15);
    if (mapControl === 'out') mapTransform.scale = Math.max(.25, mapTransform.scale / 1.15);
    if (mapControl === 'fit') { fitMap(); return; }
    updateTransform(); return;
  }
  if (setStatus) { const id=store.getState().selectedTopicId; store.updateTopic(id,{status:setStatus}); toast(`Status changed to ${statusLabel[setStatus]}.`); return; }
  if (setConfidence) { const id=store.getState().selectedTopicId; store.updateTopic(id,{confidence:+setConfidence}); return; }
  if (logHours) { const topic=store.getTopicById(store.getState().selectedTopicId); store.updateTopic(topic.id,{actualHours: Math.round(((topic.actualHours || 0)+(+logHours))*10)/10}); toast(`${logHours}h study time logged.`); return; }
  if (reviewRating) { const subject=store.getCurrentSubject(); const topic=getRevisionGroups(subject).due[reviewQueueIndex]; if(topic) { store.recordRevision(topic.id,+reviewRating); toast(`Review logged—next recall: ${shortDate(store.getTopicById(topic.id).revision.nextReview)}.`); reviewQueueIndex++; render(); } return; }
  if (!action) return;

  switch (action) {
    case 'close-drawer': store.selectTopic(null); break;
    case 'open-import': activeModal = 'import'; importPreview = null; render(); break;
    case 'open-topic-modal': activeModal = 'topic'; render(); break;
    case 'close-modal': activeModal = null; importPreview = null; render(); break;
    case 'focus-topic': store.setActiveView('map'); mapTransform = {x:100,y:100,scale:1}; render(); break;
    case 'save-notes': { const topic=store.getTopicById(store.getState().selectedTopicId); const notes=document.getElementById('topic-notes')?.value || ''; store.updateTopic(topic.id,{notes}); toast('Notes saved locally.'); break; }
    case 'create-topic': { const title=document.getElementById('new-topic-title')?.value.trim(); if(!title){toast('Give the topic a title first.','warning');return;} const prereqs=[...(document.getElementById('new-topic-prereqs')?.selectedOptions||[])].map(o=>o.value); store.addTopic(document.getElementById('new-topic-chapter').value,{title,estimatedHours:document.getElementById('new-topic-hours').value,difficulty:document.getElementById('new-topic-difficulty').value,prerequisites:prereqs}); activeModal=null; toast('Topic added to your learning map.'); break; }
    case 'parse-outline': parseImportOutline(); break;
    case 'load-sample': { const textarea=document.getElementById('import-text'); if(textarea) textarea.value=SAMPLE_SYLLABUS; break; }
    case 'import-outline': { if(importPreview?.result?.subject){store.addSubject(importPreview.result.subject);activeModal=null;importPreview=null;toast('Syllabus added as an interactive learning map.');} break; }
    case 'export': exportSubject(); break;
    case 'start-review': activeModal='review';reviewQueueIndex=0;render();break;
    case 'end-review': activeModal=null;reviewQueueIndex=0;render();break;
    case 'show-review-notes': { const subject=store.getCurrentSubject();const t=getRevisionGroups(subject).due[reviewQueueIndex]; if(t) toast(t.notes || 'No personal notes stored for this topic.','warning'); break; }
  }
}

function parseImportOutline() {
  const text=document.getElementById('import-text')?.value || ''; const meta={ code:document.getElementById('import-code')?.value || '', title:document.getElementById('import-title')?.value || '', targetExamDate:document.getElementById('import-exam')?.value || ''};
  if(!text.trim()){toast('Paste an outline before parsing.','warning');return;}
  importPreview={text,meta,result:parseSyllabusText(text,meta)}; render();
}

function exportSubject() {
  const subject=store.getCurrentSubject(); const blob=new Blob([store.exportJSON()],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=`${subject.code.replace(/\s+/g,'-').toLowerCase()}-syllabusflow.json`; document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);toast('JSON backup downloaded.');
}

function attachEvents() {
  const subjectSelect=document.getElementById('subject-switch'); if(subjectSelect) subjectSelect.addEventListener('change', e=>store.switchSubject(e.target.value));
  const search=document.getElementById('map-search'); if(search) search.addEventListener('input',e=>store.setFilters({search:e.target.value}));
  const chapter=document.getElementById('chapter-filter'); if(chapter) chapter.addEventListener('change',e=>store.setFilters({chapter:e.target.value}));
  const status=document.getElementById('status-filter'); if(status) status.addEventListener('change',e=>store.setFilters({status:e.target.value}));
  const upload=document.getElementById('text-upload'); if(upload) upload.addEventListener('change',handleFileUpload);
  initMapInteractions();
}

function handleFileUpload(e) {
  const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{const textarea=document.getElementById('import-text');if(textarea)textarea.value=String(reader.result||'');toast(`${file.name} loaded. Preview it before adding.`);}; reader.readAsText(file);
}

function initMapInteractions() {
  const svg=document.getElementById('learning-map'); const viewport=document.getElementById('map-viewport'); if(!svg||!viewport)return;
  svg.addEventListener('click',e=>{const node=e.target.closest('.node');if(node){e.stopPropagation();store.selectTopic(node.dataset.topicId);}});
  svg.addEventListener('wheel',e=>{e.preventDefault();const factor=e.deltaY<0?1.10:.91;mapTransform.scale=Math.max(.25,Math.min(1.8,mapTransform.scale*factor));updateTransform();},{passive:false});
  svg.addEventListener('pointerdown',e=>{if(e.target.closest('.node'))return;dragState={x:e.clientX,y:e.clientY,originX:mapTransform.x,originY:mapTransform.y};svg.setPointerCapture?.(e.pointerId);viewport.classList.add('dragging');});
  svg.addEventListener('pointermove',e=>{if(!dragState)return;const rect=svg.getBoundingClientRect();mapTransform.x=dragState.originX+(e.clientX-dragState.x)*(1000/rect.width);mapTransform.y=dragState.originY+(e.clientY-dragState.y)*(700/rect.height);updateTransform();});
  const end=()=>{dragState=null;viewport.classList.remove('dragging');};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
}

app.addEventListener('click', handleEvent);

store.subscribe((eventType) => {
  if (eventType === 'FILTERS_CHANGED' || eventType === 'TOPIC_SELECTED' || eventType === 'TOPIC_UPDATED' || eventType === 'REVISION_RECORDED' || eventType === 'VIEW_CHANGED' || eventType === 'SUBJECT_SWITCHED' || eventType === 'TOPIC_ADDED' || eventType === 'SUBJECT_ADDED') render();
});

render();
