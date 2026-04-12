export interface RoadmapNode {
  id: string
  label: string
  description: string
  dependsOn: string[]
}

export interface RoadmapEdge {
  from: string
  to: string
}

export const nodes: RoadmapNode[] = [
  {
    id: 'linear-algebra',
    label: 'Linear Algebra',
    description: 'Vectors, matrices, and transformations',
    dependsOn: [],
  },
  {
    id: 'calculus',
    label: 'Calculus',
    description: 'Derivatives, gradients, and chain rule',
    dependsOn: [],
  },
  {
    id: 'neural-networks',
    label: 'Neural Networks',
    description: 'Layers, activations, and backpropagation',
    dependsOn: ['linear-algebra', 'calculus'],
  },
  {
    id: 'transformers',
    label: 'Transformers',
    description: 'The architecture behind modern LLMs',
    dependsOn: ['neural-networks'],
  },
  {
    id: 'attention',
    label: 'Attention Mechanism',
    description: 'Query, key, value and self-attention',
    dependsOn: ['transformers'],
  },
  {
    id: 'mech-interp',
    label: 'Mechanistic Interpretability',
    description: 'Understanding what models actually compute',
    dependsOn: ['transformers', 'attention'],
  },
]

export const edges: RoadmapEdge[] = nodes.flatMap((node) =>
  node.dependsOn.map((dep) => ({ from: dep, to: node.id })),
)
