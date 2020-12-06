import {
  choose,
  isTip,
  randomWalk,
  weightedRandomWalk,
  hybridRandomWalk,
  calculateWeights
} from "./algorithms";

export const uniformRandom = ({ nodes, links }) => {
  const candidates = nodes.filter(node => isTip({ links, node }));

  return candidates.length === 0
    ? []
    : [choose(candidates), choose(candidates)];
};

export const unWeightedMCMC = ({ nodes, links }) => {
  if (nodes.length === 0) {
    return [];
  }

  const start = nodes[0]; // Start in genesis

  return [randomWalk({ links, start }), randomWalk({ links, start })];
};

export const adaptiveMCMC = ({ nodes, links, alphab }) => {
  if (nodes.length === 0) {
    return [];
  }

  const start = nodes[0]; // Start in genesis

  calculateWeights({ nodes, links });

  return [
    hybridRandomWalk({ links, start, alphab }),
    hybridRandomWalk({ links, start, alphab })
  ];
};

export const weightedMCMC = ({ nodes, links, alphaa }) => {
  if (nodes.length === 0) {
    return [];
  }

  const start = nodes[0]; // Start in genesis

  calculateWeights({ nodes, links });

  return [
    weightedRandomWalk({ links, start, alphaa }),
    weightedRandomWalk({ links, start, alphaa })
  ];
};
