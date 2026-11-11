// SyllabusFlow — Client-side plain-text / Markdown syllabus outline parser

const COLORS = ['#4338ca', '#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0d9488'];
const difficultyMap = { easy: 'easy', medium: 'medium', hard: 'hard', expert: 'expert' };

function idify(value, prefix) {
  return `${prefix}-${value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function sanitizeTitle(line) {
  return line
    .replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+|\[[ xX]\]\s*)/, '')
    .replace(/\s*\[(?:prereq(?:uisites?)?\s*:\s*[^\]]+)\]\s*/ig, '')
    .replace(/\s*\((?:\d+(?:\.\d+)?\s*h(?:ours?)?(?:\s*,\s*(?:easy|medium|hard|expert))?|(?:easy|medium|hard|expert)(?:\s*,\s*\d+(?:\.\d+)?\s*h(?:ours?)?)?)\)\s*/ig, '')
    .replace(/\s*\[(?:easy|medium|hard|expert)\]\s*/ig, '')
    .trim();
}

function parseTopicLine(line, chapterId) {
  const difficultyMatch = line.match(/(?:\[|\(|,)\s*(easy|medium|hard|expert)\s*(?:\]|\)|,)/i) || line.match(/\b(easy|medium|hard|expert)\b/i);
  const hourMatch = line.match(/\(?\s*(\d+(?:\.\d+)?)\s*(?:h|hr|hours?)\s*\)?/i);
  const prereqMatch = line.match(/\[\s*prereq(?:uisites?)?\s*:\s*([^\]]+)\]/i);
  const isChecked = /^\s*[-*+]\s*\[[xX]\]/.test(line);

  return {
    id: idify(sanitizeTitle(line), 'topic'),
    title: sanitizeTitle(line),
    chapterId,
    difficulty: difficultyMap[(difficultyMatch?.[1] || 'medium').toLowerCase()] || 'medium',
    estimatedHours: parseFloat(hourMatch?.[1] || '3'),
    actualHours: 0,
    status: isChecked ? 'mastered' : 'not_started',
    confidence: isChecked ? 4 : 1,
    prerequisites: [],
    rawPrerequisites: prereqMatch ? prereqMatch[1].split(',').map(x => x.trim()).filter(Boolean) : [],
    notes: '',
    keyTakeaways: [],
    revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
  };
}

export function parseSyllabusText(text, meta = {}) {
  const lines = text.split(/\r?\n/).map(l => l.trimEnd()).filter(l => l.trim());
  const chapters = [];
  const warnings = [];
  let currentChapter = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const isHeading = /^#{1,3}\s+/.test(line);
    const isChapter = /^(?:chapter|unit|module|week)\s*\d*/i.test(line.replace(/^#+\s*/, ''));
    const isTopic = /^\s*(?:[-*+]\s+|\d+[.)]\s+|\[[ xX]\]\s*)/.test(line) || /^\s{2,}\S/.test(rawLine);

    if (isHeading || isChapter) {
      const title = line.replace(/^#+\s*/, '').replace(/^(?:chapter|unit|module|week)\s*\d*\s*[:.\-]?\s*/i, '').trim();
      if (title) {
        currentChapter = {
          id: idify(title, 'chapter'),
          title,
          order: chapters.length + 1,
          color: COLORS[chapters.length % COLORS.length],
          topics: []
        };
        chapters.push(currentChapter);
      }
    } else if (isTopic || currentChapter) {
      if (!currentChapter) {
        currentChapter = {
          id: idify('Foundations', 'chapter'),
          title: 'Foundations',
          order: 1,
          color: COLORS[0],
          topics: []
        };
        chapters.push(currentChapter);
      }
      const topic = parseTopicLine(line, currentChapter.id);
      if (topic.title.length > 1) currentChapter.topics.push(topic);
    }
  }

  const allTopics = chapters.flatMap(c => c.topics);
  if (!chapters.length || !allTopics.length) {
    return { subject: null, warnings: ['No chapters or topics could be detected. Start each chapter with “# Chapter title” and each topic with “- Topic title”.'] };
  }

  const edges = [];
  const titleToTopic = new Map(allTopics.map(t => [t.title.toLowerCase(), t]));
  const normalizedMap = new Map(allTopics.map(t => [t.title.toLowerCase().replace(/[^a-z0-9]/g, ''), t]));

  for (const topic of allTopics) {
    for (const rawPrereq of topic.rawPrerequisites || []) {
      const normalized = rawPrereq.toLowerCase();
      const prereq = titleToTopic.get(normalized) || normalizedMap.get(normalized.replace(/[^a-z0-9]/g, ''));
      if (prereq) {
        topic.prerequisites.push(prereq.id);
        edges.push({ from: prereq.id, to: topic.id });
      } else {
        warnings.push(`Could not link prerequisite “${rawPrereq}” for “${topic.title}”. Match prerequisite names exactly.`);
      }
    }
    delete topic.rawPrerequisites;
  }

  const title = meta.title?.trim() || 'Untitled syllabus';
  return {
    subject: {
      id: idify(title, 'custom'),
      code: meta.code?.trim() || 'CUSTOM',
      title,
      institution: meta.institution?.trim() || 'My learning map',
      term: meta.term?.trim() || 'Self-paced',
      targetExamDate: meta.targetExamDate || '',
      description: meta.description?.trim() || `An imported syllabus with ${allTopics.length} topics across ${chapters.length} chapters.`,
      chapters,
      edges
    },
    warnings
  };
}

export const SAMPLE_SYLLABUS = `# Chapter 1: Foundations
- [x] Big-O Notation (2h, Easy)
- [ ] Arrays and Memory Layout (3h, Medium) [prereq: Big-O Notation]
- [ ] Linked Lists & Pointers (4h, Hard) [prereq: Arrays and Memory Layout]

# Chapter 2: Trees & Graphs
- [ ] Binary Tree Traversals (4h, Medium) [prereq: Linked Lists & Pointers]
- [ ] Graph Search: BFS & DFS (5h, Hard) [prereq: Binary Tree Traversals]`;
