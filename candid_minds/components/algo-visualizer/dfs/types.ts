export interface DFSStep {
  currentNode: string;
  stack: string[];
  visited: string[];
  processingEdge?: {
    source: string;
    target: string;
  };
  state: 'initial' | 'visiting' | 'backtracking' | 'processing-neighbors' | 'complete';
}

export interface GraphData {
  nodes: {
    id: string;
    label: string;
    x: number;
    y: number;
    size: number;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
  }[];
}