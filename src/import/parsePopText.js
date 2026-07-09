export function parsePopText(source) {
  const tokens = tokenizePopText(source);
  const nodes = [];
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index++];
    if (token === "#base") {
      nodes.push({ type: "directive", name: token, value: tokens[index++] ?? "" });
      continue;
    }

    if (tokens[index] === "{") {
      const result = parseBlock(tokens, index - 1);
      nodes.push(result.node);
      index = result.index;
    } else {
      nodes.push({ type: "field", name: token, value: tokens[index++] ?? "" });
    }
  }

  return { type: "document", children: nodes };
}

export function summarizePopTree(tree) {
  const root = tree.children.find((node) => node.type === "block" && node.name !== "Templates");
  const rootChildren = root?.children ?? [];
  const waves = rootChildren.filter((node) => node.type === "block" && node.name === "Wave");
  const missions = rootChildren.filter((node) => node.type === "block" && node.name === "Mission");
  const baseFiles = tree.children
    .filter((node) => node.type === "directive" && node.name === "#base")
    .map((node) => node.value);

  return {
    baseFiles,
    rootName: root?.name ?? "",
    missionCount: missions.length,
    waveCount: waves.length,
    firstWaveFields: waves[0]?.children.map((node) => node.name) ?? [],
    firstWaveOutputTargets: collectOutputTargets(waves[0]),
  };
}

function parseBlock(tokens, startIndex) {
  const name = tokens[startIndex];
  let index = startIndex + 2;
  const children = [];

  while (index < tokens.length && tokens[index] !== "}") {
    const token = tokens[index++];
    if (tokens[index] === "{") {
      const result = parseBlock(tokens, index - 1);
      children.push(result.node);
      index = result.index;
    } else {
      children.push({ type: "field", name: token, value: tokens[index++] ?? "" });
    }
  }

  return {
    node: { type: "block", name, children },
    index: index + 1,
  };
}

function collectOutputTargets(waveNode) {
  if (!waveNode) {
    return {};
  }

  const outputs = {};
  for (const child of waveNode.children) {
    if (child.type !== "block" || !child.name.endsWith("Output")) {
      continue;
    }

    const target = child.children.find((node) => node.type === "field" && node.name === "Target");
    const action = child.children.find((node) => node.type === "field" && node.name === "Action");
    outputs[child.name] = {
      target: target?.value ?? "",
      action: action?.value ?? "",
    };
  }
  return outputs;
}

function tokenizePopText(source) {
  const tokens = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (char === "/" && next === "/") {
      index += 2;
      while (index < source.length && source[index] !== "\n") {
        index += 1;
      }
      continue;
    }

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === "{" || char === "}") {
      tokens.push(char);
      index += 1;
      continue;
    }

    if (char === '"') {
      const result = readQuotedToken(source, index);
      tokens.push(result.value);
      index = result.index;
      continue;
    }

    let value = "";
    while (index < source.length && !/\s|\{|\}/.test(source[index])) {
      if (source[index] === "/" && source[index + 1] === "/") {
        break;
      }
      value += source[index];
      index += 1;
    }
    if (value) {
      tokens.push(value);
    }
  }

  return tokens;
}

function readQuotedToken(source, startIndex) {
  let index = startIndex + 1;
  let value = "";

  while (index < source.length) {
    const char = source[index];
    if (char === '"') {
      return { value, index: index + 1 };
    }
    if (char === "\\" && index + 1 < source.length) {
      value += source[index + 1];
      index += 2;
      continue;
    }
    value += char;
    index += 1;
  }

  return { value, index };
}
