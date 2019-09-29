class CommunityDetectionRequest {
  num_nodes: number;
  level: number;
  method: string;
  edges: Edge[];
}

class Edge {
  source: number;
  target: number;
}

export {CommunityDetectionRequest, Edge};
