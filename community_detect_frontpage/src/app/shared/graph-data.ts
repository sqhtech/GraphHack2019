class GraphData {
  nodes: NodeData[];
  links: EdgeData[];

  constructor() {
    this.nodes = [];
    this.links = [];
  }
}

class NodeData {
  id: string;
  group: number;
  index?: number;

  constructor(id: string) {
    this.id = id;
    this.group = 0;
  }
}

class EdgeData {
  source: string;
  target: string;
  value?: number;

  constructor(source: string, target: string) {
    this.source = source;
    this.target = target;
  }
}

export {GraphData, NodeData, EdgeData};
