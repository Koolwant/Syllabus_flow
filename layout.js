// SyllabusFlow — DAG layout, critical path, and dependency analysis

const NODE_WIDTH = 242;
const NODE_HEIGHT = 104;
const RANK_GAP = 118;
const ROW_GAP = 42;
const PADDING_X = 120;
const PADDING_Y = 94;

export function indexGraph(subject) {
  const topics = subject.chapters.flatMap(ch => ch.topics || []);
  const byId = new Map(topics.map(t => [t.id, t]));
  const incoming = new Map(topics.map(t => [t.id, []]));
  const outgoing = new Map(topics.map(t => [t.id, []]));

  for (const edge of subject.edges || []) {
    if (!byId.has(edge.from) || !byId.has(edge.to)) continue;
    outgoing.get(edge.from).push(edge.to);
    incoming.get(edge.to).push(edge.from);
  }
  return { topics, byId, incoming, outgoing };
}

export function computeGraphLayout(subject) {
  const { topics, byId, incoming, outgoing } = indexGraph(subject);
  const indegree = new Map(topics.map(t => [t.id, incoming.get(t.id).length]));
  const rank = new Map(topics.map(t => [t.id, 0]));
  const queue = topics.filter(t => indegree.get(t.id) === 0).map(t => t.id);
  const ordered = [];

  while (queue.length) {
    const id = queue.shift();
    ordered.push(id);
    for (const next of outgoing.get(id)) {
      rank.set(next, Math.max(rank.get(next), rank.get(id) + 1));
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }

  // A cycle means Kahn's algorithm did not process all nodes. Put cyclic nodes in final rank.
  const hasCycle = ordered.length !== topics.length;
  if (hasCycle) {
    const maxKnownRank = Math.max(0, ...rank.values());
    for (const topic of topics) {
      if (!ordered.includes(topic.id)) {
        rank.set(topic.id, maxKnownRank + 1);
        ordered.push(topic.id);
      }
    }
  }

  const columns = new Map();
  for (const id of ordered) {
    const r = rank.get(id);
    if (!columns.has(r)) columns.set(r, []);
    columns.get(r).push(id);
  }

  // Sort within ranks by chapter order to give the diagram a legible academic flow.
  const chapterOrder = new Map(subject.chapters.map((ch, idx) => [ch.id, idx]));
  for (const ids of columns.values()) {
    ids.sort((a, b) => {
      const da = chapterOrder.get(byId.get(a).chapterId) ?? 0;
      const db = chapterOrder.get(byId.get(b).chapterId) ?? 0;
      return da - db || byId.get(a).title.localeCompare(byId.get(b).title);
    });
  }

  const maxRows = Math.max(1, ...[...columns.values()].map(arr => arr.length));
  const positions = new Map();
  for (const [r, ids] of columns.entries()) {
    const totalHeight = ids.length * NODE_HEIGHT + Math.max(0, ids.length - 1) * ROW_GAP;
    const startY = PADDING_Y + ((maxRows * NODE_HEIGHT + Math.max(0, maxRows - 1) * ROW_GAP) - totalHeight) / 2;
    ids.forEach((id, index) => {
      positions.set(id, {
        x: PADDING_X + r * (NODE_WIDTH + RANK_GAP),
        y: startY + index * (NODE_HEIGHT + ROW_GAP),
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        rank: r
      });
    });
  }

  const maxRank = Math.max(0, ...rank.values());
  const height = PADDING_Y * 2 + maxRows * NODE_HEIGHT + Math.max(0, maxRows - 1) * ROW_GAP;
  const width = PADDING_X * 2 + (maxRank + 1) * NODE_WIDTH + maxRank * RANK_GAP;

  return { positions, rank, ordered, columns, width, height, hasCycle, graph: { topics, byId, incoming, outgoing } };
}

export function getCriticalPath(subject) {
  const layout = computeGraphLayout(subject);
  const { ordered, graph } = layout;
  const distance = new Map(graph.topics.map(t => [t.id, t.estimatedHours || 1]));
  const previous = new Map();

  for (const id of ordered) {
    for (const next of graph.outgoing.get(id)) {
      const candidate = distance.get(id) + (graph.byId.get(next).estimatedHours || 1);
      if (candidate > distance.get(next)) {
        distance.set(next, candidate);
        previous.set(next, id);
      }
    }
  }

  let end = graph.topics.reduce((best, topic) => distance.get(topic.id) > distance.get(best) ? topic.id : best, graph.topics[0]?.id);
  const path = [];
  while (end) {
    path.unshift(end);
    end = previous.get(end);
  }
  return new Set(path);
}

export function getDependencyPath(subject, topicId) {
  const { incoming, outgoing } = indexGraph(subject);
  const ancestors = new Set();
  const descendants = new Set();
  const visit = (id, direction, result) => {
    for (const next of direction.get(id) || []) {
      if (!result.has(next)) {
        result.add(next);
        visit(next, direction, result);
      }
    }
  };
  visit(topicId, incoming, ancestors);
  visit(topicId, outgoing, descendants);
  return { ancestors, descendants };
}

export function makeBezierPath(source, target) {
  const x1 = source.x + source.width;
  const y1 = source.y + source.height / 2;
  const x2 = target.x;
  const y2 = target.y + target.height / 2;
  const distance = Math.max(70, (x2 - x1) * 0.48);
  return `M ${x1} ${y1} C ${x1 + distance} ${y1}, ${x2 - distance} ${y2}, ${x2} ${y2}`;
}

export const GRAPH_CONSTANTS = { NODE_WIDTH, NODE_HEIGHT };
