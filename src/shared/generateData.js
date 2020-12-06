const jStat = require("jStat").jStat;

export const generateTangle = ({
  nodeCount,
  lambda = 1.5,
  h = 1,
  alphaa = 0.5,
  alphab = [
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
  ],
  tipSelectionAlgorithm
}) => {
  jStat.exponential.sample(lambda);
  const genesis = {
    name: "0",
    time: 0
  };

  let nodes = [genesis];
  let time = h;
  while (nodes.length < nodeCount) {
    const delay = jStat.exponential.sample(lambda);
    time += delay;
    nodes.push({
      name: `${nodes.length}`,
      time,
      x: 300,
      y: 200
    });
  }

  const links = [];
  for (let node of nodes) {
    const candidates = nodes.filter(
      candidate => candidate.time < node.time - h
    );

    const candidateLinks = links.filter(
      link => link.source.time < node.time - h
    );

    const tips = tipSelectionAlgorithm({
      nodes: candidates,
      links: candidateLinks,
      alphaa,
      alphab
    });

    if (tips.length > 0) {
      links.push({ source: node, target: tips[0] });
      if (tips.length > 1 && tips[0].name !== tips[1].name) {
        links.push({ source: node, target: tips[1] });
      }
    }
  }

  return {
    nodes,
    links
  };
};
