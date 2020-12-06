export const isTip = ({ links, node }) => {
  return !links.some(link => node === link.target);
};

export const choose = arr => arr[Math.floor(Math.random() * arr.length)];

export const getDescendants = ({ nodes, links, root }) => {
  const stack = [root];
  const visitedNodes = new Set();
  const visitedLinks = new Set();

  while (stack.length > 0) {
    const current = stack.pop();

    const outgoingEdges = links.filter(l => l.source === current);
    for (let link of outgoingEdges) {
      visitedLinks.add(link);
      if (!visitedNodes.has(link.target)) {
        stack.push(link.target);
        visitedNodes.add(link.target);
      }
    }
  }

  return { nodes: visitedNodes, links: visitedLinks };
};

export const getAncestors = ({ nodes, links, root }) => {
  const stack = [root];
  const visitedNodes = new Set();
  const visitedLinks = new Set();

  while (stack.length > 0) {
    const current = stack.pop();

    const incomingEdges = links.filter(l => l.target === current);
    for (let link of incomingEdges) {
      visitedLinks.add(link);
      if (!visitedNodes.has(link.source)) {
        stack.push(link.source);
        visitedNodes.add(link.source);
      }
    }
  }

  return { nodes: visitedNodes, links: visitedLinks };
};

export const getTips = ({ nodes, links }) => {
  const tips = nodes.filter(node => !links.some(link => link.target === node));

  return new Set(tips);
};

export const getApprovers = ({ links, node }) => {
  return links.filter(link => link.target === node).map(link => link.source);
};

export const randomWalk = ({ links, start }) => {
  let particle = start;

  while (!isTip({ links, node: particle })) {
    const approvers = getApprovers({ links, node: particle });

    particle = choose(approvers);
  }

  return particle;
};

const weightedChoose = (arr, weights) => {
  const sum = weights.reduce((sum, w) => sum + w, 0);
  const rand = Math.random() * sum;

  let cumSum = weights[0];
  for (let i = 1; i < arr.length; i++) {
    if (rand < cumSum) {
      return arr[i - 1];
    }
    cumSum += weights[i];
  }

  return arr[arr.length - 1];
};

const weightedChooseb = (arr, weights) => {
  let alphab = [
    0.05,
    0.1,
    0.15,
    0.2,
    0.25,
    0.3,
    0.35,
    0.4,
    0.45,
    0.5,
    0.55,
    0.6,
    0.65,
    0.7,
    0.75,
    0.8,
    0.85,
    0.9,
    0.95,
    1,
    0.95,
    0.9,
    0.85,
    0.8,
    0.75,
    0.7,
    0.65,
    0.6,
    0.55,
    0.5,
    0.45,
    0.4,
    0.35,
    0.3,
    0.25,
    0.2,
    0.15,
    0.1,
    0.5,
    0.05,
    0.1,
    0.15,
    0.2,
    0.25,
    0.3,
    0.35,
    0.4,
    0.45,
    0.5,
    0.55,
    0.6,
    0.65,
    0.7,
    0.75,
    0.8,
    0.85,
    0.9,
    0.95,
    1,
    0.95,
    0.9,
    0.85,
    0.8,
    0.75,
    0.7,
    0.65,
    0.6,
    0.55,
    0.5,
    0.45,
    0.4,
    0.35,
    0.3,
    0.25,
    0.2,
    0.15,
    0.1,
    0.5
  ];

  const sum = weights.reduce((sum, w) => sum + w, 0);
  const rand = Math.random() * sum;

  let cumSum = weights[0];
  for (let i = 1; i < arr.length; i++) {
    if (rand < cumSum) {
      return arr[i - 1];
    }
    cumSum += weights[i];
  }

  //et alphab = alphab[0];
  for (let i = 1; i < arr.length; i++) {
    if (rand < cumSum) {
      return arr[i - 1];
    }
    alphab += alphab[i];
  }

  //alphab = alphab[3];

  return arr[arr.length - 1];
};

export const hybridRandomWalk = ({ nodes, links, start, alphab }) => {
  let particle = start;

  while (!isTip({ links, node: particle })) {
    const approvers = getApprovers({ links, node: particle });

    const cumWeights = approvers.map(node => node.cumWeight);

    // normalize so maximum cumWeight is 0
    const maxWeight = Math.max(...cumWeights);
    const normalizedWeights = cumWeights.map(w => w - maxWeight);
    //const alphab = alphab.map(x => x);
    const weights = normalizedWeights.map(w => Math.exp(alphab * w));

    particle = weightedChooseb(approvers, weights);
  }

  return particle;
};

export const weightedRandomWalk = ({ nodes, links, start, alphaa }) => {
  let particle = start;

  while (!isTip({ links, node: particle })) {
    const approvers = getApprovers({ links, node: particle });

    const cumWeights = approvers.map(node => node.cumWeight);

    // normalize so maximum cumWeight is 0
    const maxWeight = Math.max(...cumWeights);
    const normalizedWeights = cumWeights.map(w => w - maxWeight);

    const weights = normalizedWeights.map(w => Math.exp(alphaa * w));

    particle = weightedChoose(approvers, weights);
  }

  return particle;
};

const getChildrenLists = ({ nodes, links }) => {
  // Initialize an empty list for each node
  const childrenLists = nodes.reduce(
    (lists, node) => Object.assign(lists, { [node.name]: [] }),
    {}
  );

  for (let link of links) {
    childrenLists[link.source.name].push(link.target);
  }

  return childrenLists;
};

// DFS-based topological sort
export const topologicalSort = ({ nodes, links }) => {
  const childrenLists = getChildrenLists({ nodes, links });
  const unvisited = new Set(nodes);
  const result = [];

  const visit = node => {
    if (!unvisited.has(node)) {
      return;
    }

    for (let child of childrenLists[node.name]) {
      visit(child);
    }

    unvisited.delete(node);
    result.push(node);
  };

  while (unvisited.size > 0) {
    const node = unvisited.values().next().value;

    visit(node);
  }

  result.reverse();
  return result;
};

export const calculateWeights = ({ nodes, links }) => {
  const sorted = topologicalSort({ nodes, links });

  // Initialize an empty set for each node
  const ancestorSets = nodes.reduce(
    (lists, node) => Object.assign(lists, { [node.name]: new Set() }),
    {}
  );

  const childrenLists = getChildrenLists({ nodes, links });
  for (let node of sorted) {
    for (let child of childrenLists[node.name]) {
      ancestorSets[child.name] = new Set([
        ...ancestorSets[child.name],
        ...ancestorSets[node.name],
        node
      ]);
    }

    node.cumWeight = ancestorSets[node.name].size + 1;
  }
};
