// SyllabusFlow — Demo Syllabi Dataset
// High-fidelity academic courses with explicit chapter groupings, difficulty, study hours,
// prerequisite dependency graphs, key takeaways, and spaced repetition defaults.

export const DEMO_SYLLABI = [
  {
    id: 'cs-106',
    code: 'CS 106',
    title: 'Data Structures & Algorithms',
    institution: 'School of Computing',
    term: 'Fall 2026',
    targetExamDate: '2026-12-15',
    description: 'Comprehensive study of fundamental data abstractions, algorithmic analysis, tree and graph paradigms, dynamic programming, and computational complexity.',
    chapters: [
      {
        id: 'c1',
        title: 'Algorithmic Foundations & Complexity',
        order: 1,
        color: '#4338ca', // Indigo
        topics: [
          {
            id: 'dsa-big-o',
            title: 'Asymptotic Analysis & Big-O Notation',
            chapterId: 'c1',
            difficulty: 'easy',
            estimatedHours: 3.5,
            actualHours: 3.5,
            status: 'mastered',
            confidence: 5,
            prerequisites: [],
            notes: 'Mastered tight bounds: O (upper), Omega (lower), Theta (tight). Remember that log(n!) = Theta(n log n) by Stirling\'s approximation.',
            keyTakeaways: [
              'Formal limits definition of asymptotic growth',
              'Worst-case vs average-case vs amortized analysis',
              'Dominant term extraction and space complexity models'
            ],
            revision: { leitnerBox: 4, lastReviewed: '2026-11-01', nextReview: '2026-11-15', reviewCount: 3 }
          },
          {
            id: 'dsa-recursion',
            title: 'Recursion, Recurrence Relations & Master Theorem',
            chapterId: 'c1',
            difficulty: 'medium',
            estimatedHours: 4.5,
            actualHours: 4.0,
            status: 'mastered',
            confidence: 4,
            prerequisites: ['dsa-big-o'],
            notes: 'Master Theorem formula: T(n) = aT(n/b) + f(n). Compare f(n) with n^(log_b a). Case 1, 2, 3 conditions.',
            keyTakeaways: [
              'Call stack memory allocation and stack frame mechanics',
              'Recursion tree expansion technique',
              'Master theorem conditions and regularity constraints'
            ],
            revision: { leitnerBox: 3, lastReviewed: '2026-11-04', nextReview: '2026-11-11', reviewCount: 2 }
          }
        ]
      },
      {
        id: 'c2',
        title: 'Linear Data Structures & Hashing',
        order: 2,
        color: '#0284c7', // Sky Blue
        topics: [
          {
            id: 'dsa-arrays',
            title: 'Dynamic Arrays & Amortized Doubling',
            chapterId: 'c2',
            difficulty: 'easy',
            estimatedHours: 2.5,
            actualHours: 2.5,
            status: 'mastered',
            confidence: 5,
            prerequisites: ['dsa-big-o'],
            notes: 'Geometric progression sum proves geometric doubling gives O(1) amortized append. Accounting method balance proof.',
            keyTakeaways: [
              'Contiguous memory cache locality benefits',
              'Potential function method for amortized bounds',
              'Resizing policies: factor 1.5 vs factor 2'
            ],
            revision: { leitnerBox: 5, lastReviewed: '2026-10-25', nextReview: '2026-11-24', reviewCount: 4 }
          },
          {
            id: 'dsa-linked-lists',
            title: 'Linked Lists, Pointers & Fast/Slow Runners',
            chapterId: 'c2',
            difficulty: 'medium',
            estimatedHours: 3.5,
            actualHours: 3.0,
            status: 'mastered',
            confidence: 4,
            prerequisites: ['dsa-arrays'],
            notes: 'Floyd\'s Tortoise and Hare algorithm for cycle detection: 2(k - x) = k + r -> finds cycle entry node in O(N) time and O(1) space.',
            keyTakeaways: [
              'Singly vs doubly vs circular linked lists',
              'Sentinel head and tail nodes to eliminate edge cases',
              'Cycle detection and middle-node identification'
            ],
            revision: { leitnerBox: 4, lastReviewed: '2026-11-02', nextReview: '2026-11-16', reviewCount: 3 }
          },
          {
            id: 'dsa-hash-tables',
            title: 'Hash Tables, Collision Resolution & Bloom Filters',
            chapterId: 'c2',
            difficulty: 'hard',
            estimatedHours: 5.0,
            actualHours: 3.0,
            status: 'in_progress',
            confidence: 3,
            prerequisites: ['dsa-arrays', 'dsa-linked-lists'],
            notes: 'Separate chaining vs Open Addressing (Linear Probing, Quadratic Probing, Double Hashing). Load factor alpha = n/m threshold ~0.7.',
            keyTakeaways: [
              'Universal hashing families and collision distribution',
              'Cluster degradation in open addressing',
              'Probabilistic membership testing with Bloom filters'
            ],
            revision: { leitnerBox: 2, lastReviewed: '2026-11-08', nextReview: '2026-11-11', reviewCount: 1 }
          }
        ]
      },
      {
        id: 'c3',
        title: 'Hierarchical Structures & Trees',
        order: 3,
        color: '#059669', // Emerald
        topics: [
          {
            id: 'dsa-trees',
            title: 'Binary Trees & Tree Traversals',
            chapterId: 'c3',
            difficulty: 'medium',
            estimatedHours: 4.0,
            actualHours: 4.0,
            status: 'mastered',
            confidence: 4,
            prerequisites: ['dsa-recursion', 'dsa-linked-lists'],
            notes: 'Inorder (LNR), Preorder (NLR), Postorder (LRN), Level-order (BFS queue). Reconstruction requires Inorder + (Preorder or Postorder).',
            keyTakeaways: [
              'Recursive structural definitions of trees',
              'DFS traversal orders and applications',
              'Iterative stack-based traversals'
            ],
            revision: { leitnerBox: 3, lastReviewed: '2026-11-05', nextReview: '2026-11-12', reviewCount: 2 }
          },
          {
            id: 'dsa-bst-avl',
            title: 'Binary Search Trees & Self-Balancing AVL / Red-Black',
            chapterId: 'c3',
            difficulty: 'hard',
            estimatedHours: 6.0,
            actualHours: 4.5,
            status: 'needs_revision',
            confidence: 2,
            prerequisites: ['dsa-trees'],
            notes: 'AVL balance factor in {-1, 0, 1}. Four rotation cases: LL, RR, LR, RL. Red-Black 5 invariants guarantee path length ratio <= 2:1.',
            keyTakeaways: [
              'BST search property: left < root < right',
              'Rotations: tree rebalancing operations preserve inorder',
              'Height-balance invariant maintenance during insertion/deletion'
            ],
            revision: { leitnerBox: 1, lastReviewed: '2026-11-09', nextReview: '2026-11-10', reviewCount: 1 }
          },
          {
            id: 'dsa-heaps',
            title: 'Binary Heaps, Priority Queues & HeapSort',
            chapterId: 'c3',
            difficulty: 'medium',
            estimatedHours: 3.5,
            actualHours: 1.5,
            status: 'in_progress',
            confidence: 3,
            prerequisites: ['dsa-trees', 'dsa-arrays'],
            notes: 'Complete binary tree mapped onto flat array: parent at floor((i-1)/2), children at 2i+1, 2i+2. BuildHeap is O(N), not O(N log N)!',
            keyTakeaways: [
              'Min-heap and max-heap order invariant',
              'Sift-up and sift-down re-heapification mechanics',
              'Linear time BuildHeap proof using Taylor series summation'
            ],
            revision: { leitnerBox: 2, lastReviewed: '2026-11-07', nextReview: '2026-11-10', reviewCount: 1 }
          },
          {
            id: 'dsa-trie',
            title: 'Tries & Radix Trees for Prefix Search',
            chapterId: 'c3',
            difficulty: 'medium',
            estimatedHours: 3.0,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['dsa-trees', 'dsa-hash-tables'],
            notes: 'Prefix tree for string keys. Lookup time O(L) where L is key length, independent of dictionary size N.',
            keyTakeaways: [
              'Prefix matching, autocomplete index construction',
              'Memory trade-offs: 26-pointer array vs hash map children',
              'Compressed trie (Patricia tree) node consolidation'
            ],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          }
        ]
      },
      {
        id: 'c4',
        title: 'Graph Theory & Network Traversal',
        order: 4,
        color: '#d97706', // Amber
        topics: [
          {
            id: 'dsa-graph-rep',
            title: 'Graph Representations & BFS / DFS',
            chapterId: 'c4',
            difficulty: 'medium',
            estimatedHours: 4.5,
            actualHours: 2.0,
            status: 'in_progress',
            confidence: 3,
            prerequisites: ['dsa-trees', 'dsa-hash-tables'],
            notes: 'Adjacency list O(V + E) space vs Adjacency matrix O(V^2). BFS gives unweighted shortest paths; DFS finds connected components and cycles.',
            keyTakeaways: [
              'Adjacency list vs adjacency matrix tradeoffs',
              'Queue-based BFS for minimum edge distance',
              'Stack-based DFS for discovery and finish timestamps'
            ],
            revision: { leitnerBox: 2, lastReviewed: '2026-11-06', nextReview: '2026-11-09', reviewCount: 1 }
          },
          {
            id: 'dsa-topo-sort',
            title: 'DAGs, Topological Sort & Cycle Detection',
            chapterId: 'c4',
            difficulty: 'medium',
            estimatedHours: 3.5,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['dsa-graph-rep'],
            notes: 'Kahn\'s algorithm (indegree reduction with queue) vs DFS reverse post-order. Back-edge detection during DFS indicates a cycle.',
            keyTakeaways: [
              'Directed Acyclic Graph properties and dependency modeling',
              'Kahn\'s algorithm implementation',
              'Cycle detection via 3-color node classification'
            ],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          },
          {
            id: 'dsa-shortest-path',
            title: 'Shortest Paths: Dijkstra & Bellman-Ford',
            chapterId: 'c4',
            difficulty: 'hard',
            estimatedHours: 5.5,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['dsa-graph-rep', 'dsa-heaps'],
            notes: 'Dijkstra greedy relaxation with min-heap priority queue: O((V+E) log V). Does not support negative edges! Use Bellman-Ford O(VE) for negative weights.',
            keyTakeaways: [
              'Edge relaxation invariant',
              'Dijkstra priority queue optimization',
              'Negative weight cycle detection in Bellman-Ford'
            ],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          },
          {
            id: 'dsa-mst',
            title: 'Minimum Spanning Trees: Kruskal & Prim',
            chapterId: 'c4',
            difficulty: 'hard',
            estimatedHours: 4.5,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['dsa-graph-rep', 'dsa-heaps'],
            notes: 'Kruskal sorts edges and uses Disjoint Set (Union-Find) with path compression: O(E log E). Prim grows cut using priority queue.',
            keyTakeaways: [
              'Cut property of Minimum Spanning Trees',
              'Union-Find data structure with rank & path compression',
              'Greedy choice property correctness'
            ],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          }
        ]
      },
      {
        id: 'c5',
        title: 'Advanced Dynamic Programming & Greedy Algorithms',
        order: 5,
        color: '#dc2626', // Crimson / Red
        topics: [
          {
            id: 'dsa-dp-foundations',
            title: 'Dynamic Programming: Memoization & Tabulation',
            chapterId: 'c5',
            difficulty: 'hard',
            estimatedHours: 5.0,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['dsa-recursion'],
            notes: 'Requires Optimal Substructure and Overlapping Subproblems. Top-down memoization vs bottom-up iterative table filling.',
            keyTakeaways: [
              'Formulating state representations S(i, j)',
              'Writing recurrence transitions',
              'Space optimization via rolling arrays'
            ],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          },
          {
            id: 'dsa-dp-classic',
            title: 'Classic DP: Knapsack, LCS & Interval Scheduling',
            chapterId: 'c5',
            difficulty: 'expert',
            estimatedHours: 6.5,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['dsa-dp-foundations'],
            notes: '0/1 Knapsack: dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w-wt[i]]). Longest Common Subsequence and Edit Distance.',
            keyTakeaways: [
              'Pseudo-polynomial time complexity in knapsack',
              'Subsequence alignment and backtracking for solution reconstruction',
              'Interval scheduling greedy choice rule (earliest finish time)'
            ],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          },
          {
            id: 'dsa-np-complete',
            title: 'P vs NP & Polynomial Time Reductions',
            chapterId: 'c5',
            difficulty: 'expert',
            estimatedHours: 4.0,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['dsa-dp-classic', 'dsa-shortest-path'],
            notes: 'Class P (verifiable & solvable in polynomial time), NP (verifiable in polynomial time). Cook-Levin theorem (SAT is NP-complete). Reduction A <=p B.',
            keyTakeaways: [
              'Formal verification using polynomial certificates',
              'Direction of reduction: map unknown to known or vice-versa',
              '3-SAT to Independent Set / Vertex Cover reductions'
            ],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          }
        ]
      }
    ],
    edges: [
      { from: 'dsa-big-o', to: 'dsa-recursion' },
      { from: 'dsa-big-o', to: 'dsa-arrays' },
      { from: 'dsa-arrays', to: 'dsa-linked-lists' },
      { from: 'dsa-arrays', to: 'dsa-hash-tables' },
      { from: 'dsa-linked-lists', to: 'dsa-hash-tables' },
      { from: 'dsa-recursion', to: 'dsa-trees' },
      { from: 'dsa-linked-lists', to: 'dsa-trees' },
      { from: 'dsa-trees', to: 'dsa-bst-avl' },
      { from: 'dsa-trees', to: 'dsa-heaps' },
      { from: 'dsa-arrays', to: 'dsa-heaps' },
      { from: 'dsa-trees', to: 'dsa-trie' },
      { from: 'dsa-hash-tables', to: 'dsa-trie' },
      { from: 'dsa-trees', to: 'dsa-graph-rep' },
      { from: 'dsa-hash-tables', to: 'dsa-graph-rep' },
      { from: 'dsa-graph-rep', to: 'dsa-topo-sort' },
      { from: 'dsa-graph-rep', to: 'dsa-shortest-path' },
      { from: 'dsa-heaps', to: 'dsa-shortest-path' },
      { from: 'dsa-graph-rep', to: 'dsa-mst' },
      { from: 'dsa-heaps', to: 'dsa-mst' },
      { from: 'dsa-recursion', to: 'dsa-dp-foundations' },
      { from: 'dsa-dp-foundations', to: 'dsa-dp-classic' },
      { from: 'dsa-dp-classic', to: 'dsa-np-complete' },
      { from: 'dsa-shortest-path', to: 'dsa-np-complete' }
    ]
  },
  {
    id: 'ai-201',
    code: 'AI 201',
    title: 'Machine Learning & Deep Learning',
    institution: 'Artificial Intelligence Lab',
    term: 'Fall 2026',
    targetExamDate: '2026-12-18',
    description: 'Mathematical foundations of statistical learning, supervised/unsupervised algorithms, deep convolutional networks, and attention-based Transformer models.',
    chapters: [
      {
        id: 'ai-c1',
        title: 'Mathematical Foundations & Optimization',
        order: 1,
        color: '#4f46e5',
        topics: [
          {
            id: 'ml-linear-alg',
            title: 'Linear Algebra & Matrix Decompositions (SVD, PCA)',
            chapterId: 'ai-c1',
            difficulty: 'medium',
            estimatedHours: 4.0,
            actualHours: 4.0,
            status: 'mastered',
            confidence: 5,
            prerequisites: [],
            notes: 'Singular Value Decomposition A = U Sigma V^T. Principal Component Analysis projects data onto eigenvectors of covariance matrix.',
            keyTakeaways: ['Eigenvalues & eigenvectors', 'SVD low-rank approximations', 'Covariance and projection matrices'],
            revision: { leitnerBox: 4, lastReviewed: '2026-11-03', nextReview: '2026-11-17', reviewCount: 3 }
          },
          {
            id: 'ml-calculus-opt',
            title: 'Multivariate Calculus & Gradient Descent',
            chapterId: 'ai-c1',
            difficulty: 'medium',
            estimatedHours: 4.5,
            actualHours: 4.5,
            status: 'mastered',
            confidence: 4,
            prerequisites: ['ml-linear-alg'],
            notes: 'Gradient vector nabla f, Hessian matrix for curvature. SGD with momentum: v_t = gamma v_{t-1} + eta nabla L.',
            keyTakeaways: ['Jacobian and Hessian tensors', 'First-order vs second-order optimization', 'Learning rate schedules & Adam optimizer'],
            revision: { leitnerBox: 3, lastReviewed: '2026-11-06', nextReview: '2026-11-13', reviewCount: 2 }
          },
          {
            id: 'ml-probability',
            title: 'Probability, Bayes Rule & Maximum Likelihood',
            chapterId: 'ai-c1',
            difficulty: 'medium',
            estimatedHours: 3.5,
            actualHours: 3.5,
            status: 'mastered',
            confidence: 4,
            prerequisites: [],
            notes: 'MLE vs MAP. Log-likelihood objective maximization transforms products into manageable sums.',
            keyTakeaways: ['Conditional expectation & Bayes theorem', 'Gaussian & Bernoulli distributions', 'KL Divergence and Cross-Entropy loss'],
            revision: { leitnerBox: 4, lastReviewed: '2026-10-30', nextReview: '2026-11-14', reviewCount: 3 }
          }
        ]
      },
      {
        id: 'ai-c2',
        title: 'Classical Machine Learning',
        order: 2,
        color: '#0891b2',
        topics: [
          {
            id: 'ml-linear-reg',
            title: 'Linear & Logistic Regression with Regularization',
            chapterId: 'ai-c2',
            difficulty: 'easy',
            estimatedHours: 3.5,
            actualHours: 3.5,
            status: 'mastered',
            confidence: 5,
            prerequisites: ['ml-linear-alg', 'ml-calculus-opt'],
            notes: 'Normal Equation w = (X^T X)^{-1} X^T y. L1 Lasso introduces sparsity; L2 Ridge stabilizes ill-conditioned inversions.',
            keyTakeaways: ['Sigmoid link function for binary probability', 'Bias-variance decomposition', 'L1 vs L2 regularization geometric priors'],
            revision: { leitnerBox: 5, lastReviewed: '2026-10-28', nextReview: '2026-11-27', reviewCount: 4 }
          },
          {
            id: 'ml-svm',
            title: 'Support Vector Machines & The Kernel Trick',
            chapterId: 'ai-c2',
            difficulty: 'hard',
            estimatedHours: 5.0,
            actualHours: 3.0,
            status: 'in_progress',
            confidence: 3,
            prerequisites: ['ml-linear-reg', 'ml-calculus-opt'],
            notes: 'Max-margin hyperplane 2/||w||. Dual formulation with Lagrange multipliers. RBF Gaussian kernel implicitly maps into infinite-dimensional Hilbert space.',
            keyTakeaways: ['Support vectors on margin boundaries', 'Karush-Kuhn-Tucker (KKT) conditions', 'Mercer theorem and kernel functions'],
            revision: { leitnerBox: 2, lastReviewed: '2026-11-08', nextReview: '2026-11-11', reviewCount: 1 }
          },
          {
            id: 'ml-decision-trees',
            title: 'Decision Trees, Random Forests & XGBoost',
            chapterId: 'ai-c2',
            difficulty: 'medium',
            estimatedHours: 4.0,
            actualHours: 2.0,
            status: 'in_progress',
            confidence: 3,
            prerequisites: ['ml-probability'],
            notes: 'Information gain via Shannon entropy vs Gini impurity. Bagging (Random Forest) reduces variance; Gradient Boosting (XGBoost) iteratively fits pseudo-residuals.',
            keyTakeaways: ['Split criteria metrics', 'Ensemble bagging vs boosting mechanics', 'Handling categorical features and missing data'],
            revision: { leitnerBox: 2, lastReviewed: '2026-11-07', nextReview: '2026-11-10', reviewCount: 1 }
          }
        ]
      },
      {
        id: 'ai-c3',
        title: 'Deep Learning & Neural Architectures',
        order: 3,
        color: '#7c3aed',
        topics: [
          {
            id: 'dl-backprop',
            title: 'Multilayer Perceptrons & Backpropagation',
            chapterId: 'ai-c3',
            difficulty: 'medium',
            estimatedHours: 5.0,
            actualHours: 5.0,
            status: 'mastered',
            confidence: 4,
            prerequisites: ['ml-calculus-opt', 'ml-linear-reg'],
            notes: 'Computational graph forward/backward passes. Chain rule across vector Jacobians. Vanishing gradients with sigmoid resolved via ReLU.',
            keyTakeaways: ['Activation functions: ReLU, GELU, Sigmoid', 'Matrix calculus for layer backpropagation', 'Weight initialization: He vs Xavier initialization'],
            revision: { leitnerBox: 3, lastReviewed: '2026-11-05', nextReview: '2026-11-12', reviewCount: 2 }
          },
          {
            id: 'dl-cnn',
            title: 'Convolutional Neural Networks (CNNs)',
            chapterId: 'ai-c3',
            difficulty: 'hard',
            estimatedHours: 5.5,
            actualHours: 2.5,
            status: 'needs_revision',
            confidence: 2,
            prerequisites: ['dl-backprop'],
            notes: 'Translation invariance via weight sharing. Receptive field growth. ResNet skip connections f(x) + x solve degradation problem for 100+ layer nets.',
            keyTakeaways: ['Kernel filters, stride, padding, dilated convolutions', 'Batch normalization vs Layer normalization', 'Residual connections and feature pyramid networks'],
            revision: { leitnerBox: 1, lastReviewed: '2026-11-09', nextReview: '2026-11-10', reviewCount: 1 }
          },
          {
            id: 'dl-rnn-lstm',
            title: 'Recurrent Networks, LSTMs & GRUs',
            chapterId: 'ai-c3',
            difficulty: 'hard',
            estimatedHours: 4.5,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['dl-backprop'],
            notes: 'Backpropagation Through Time (BPTT). LSTM gating: forget gate f_t, input gate i_t, candidate cell state, output gate o_t prevents vanishing gradients.',
            keyTakeaways: ['Sequential state transitions', 'Additive cell state highway in LSTMs', 'Bidirectional encoding and sequence-to-sequence bottlenecks'],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          }
        ]
      },
      {
        id: 'ai-c4',
        title: 'Transformers & Modern Generative AI',
        order: 4,
        color: '#e11d48',
        topics: [
          {
            id: 'dl-attention',
            title: 'Self-Attention Mechanisms & Scaled Dot-Product',
            chapterId: 'ai-c4',
            difficulty: 'hard',
            estimatedHours: 5.0,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['dl-backprop', 'dl-rnn-lstm'],
            notes: 'Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V. Quadratic O(N^2) sequence length complexity. Multi-head attention projects into distinct subspaces.',
            keyTakeaways: ['Query, Key, Value matrix formulation', 'Scaling factor role in softmax saturation prevention', 'Positional embeddings: sinusoidal vs RoPE'],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          },
          {
            id: 'dl-transformers',
            title: 'The Transformer Architecture (Encoder & Decoder)',
            chapterId: 'ai-c4',
            difficulty: 'expert',
            estimatedHours: 6.0,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['dl-attention', 'dl-cnn'],
            notes: 'Encoder-decoder (T5, original paper), Decoder-only (GPT auto-regressive masked attention), Encoder-only (BERT bidirectional masked language modeling).',
            keyTakeaways: ['Pre-LN vs Post-LN architectural stability', 'Causal masking mechanics in autoregressive generation', 'Feedforward projection layers (MLP blocks)'],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          },
          {
            id: 'dl-llm-finetuning',
            title: 'LLM Pretraining, RLHF & Parameter-Efficient Fine-Tuning (LoRA)',
            chapterId: 'ai-c4',
            difficulty: 'expert',
            estimatedHours: 5.5,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['dl-transformers'],
            notes: 'LoRA: W = W_0 + B A where rank r << d. Reduces trainable parameters by 99% while preserving instruction-following capability.',
            keyTakeaways: ['Next-token cross-entropy objective & scaling laws', 'RLHF / DPO preference alignment formulation', 'Quantization (4-bit, 8-bit NF4) and low-rank adaptation'],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          }
        ]
      }
    ],
    edges: [
      { from: 'ml-linear-alg', to: 'ml-calculus-opt' },
      { from: 'ml-linear-alg', to: 'ml-linear-reg' },
      { from: 'ml-calculus-opt', to: 'ml-linear-reg' },
      { from: 'ml-linear-reg', to: 'ml-svm' },
      { from: 'ml-calculus-opt', to: 'ml-svm' },
      { from: 'ml-probability', to: 'ml-decision-trees' },
      { from: 'ml-calculus-opt', to: 'dl-backprop' },
      { from: 'ml-linear-reg', to: 'dl-backprop' },
      { from: 'dl-backprop', to: 'dl-cnn' },
      { from: 'dl-backprop', to: 'dl-rnn-lstm' },
      { from: 'dl-backprop', to: 'dl-attention' },
      { from: 'dl-rnn-lstm', to: 'dl-attention' },
      { from: 'dl-attention', to: 'dl-transformers' },
      { from: 'dl-cnn', to: 'dl-transformers' },
      { from: 'dl-transformers', to: 'dl-llm-finetuning' }
    ]
  },
  {
    id: 'math-101',
    code: 'MATH 101',
    title: 'University Calculus & Differential Equations',
    institution: 'Department of Mathematics',
    term: 'Fall 2026',
    targetExamDate: '2026-12-12',
    description: 'Rigorous single and multivariable calculus, integration techniques, sequence series convergence, and ordinary differential equations.',
    chapters: [
      {
        id: 'math-c1',
        title: 'Limits & Differential Calculus',
        order: 1,
        color: '#2563eb',
        topics: [
          {
            id: 'calc-limits',
            title: 'Epsilon-Delta Continuity & Limit Laws',
            chapterId: 'math-c1',
            difficulty: 'medium',
            estimatedHours: 4.0,
            actualHours: 4.0,
            status: 'mastered',
            confidence: 5,
            prerequisites: [],
            notes: 'For every epsilon > 0, there exists delta > 0 such that 0 < |x - c| < delta implies |f(x) - L| < epsilon.',
            keyTakeaways: ['Formal epsilon-delta proofs', 'Squeeze Theorem', 'Intermediate Value Theorem'],
            revision: { leitnerBox: 4, lastReviewed: '2026-11-01', nextReview: '2026-11-15', reviewCount: 3 }
          },
          {
            id: 'calc-derivatives',
            title: 'Derivative Rules, Chain Rule & Implicit Differentiation',
            chapterId: 'math-c1',
            difficulty: 'easy',
            estimatedHours: 3.5,
            actualHours: 3.5,
            status: 'mastered',
            confidence: 5,
            prerequisites: ['calc-limits'],
            notes: 'Product, Quotient, Chain rule d/dx [f(g(x))] = f\'(g(x)) g\'(x). Related rates problems.',
            keyTakeaways: ['Geometric meaning of tangent line', 'Chain rule in multivariable composition', 'Mean Value Theorem'],
            revision: { leitnerBox: 5, lastReviewed: '2026-10-25', nextReview: '2026-11-24', reviewCount: 4 }
          },
          {
            id: 'calc-taylor',
            title: 'Taylor Series, Maclaurin & Convergence Radii',
            chapterId: 'math-c1',
            difficulty: 'hard',
            estimatedHours: 5.5,
            actualHours: 3.0,
            status: 'needs_revision',
            confidence: 2,
            prerequisites: ['calc-derivatives'],
            notes: 'sum (f^(n)(a) / n!) (x - a)^n. Ratio Test for radius of convergence R = lim |a_n / a_{n+1}|. Lagrange error remainder bound.',
            keyTakeaways: ['Power series expansion around point a', 'Ratio and Root tests for convergence', 'Lagrange remainder bounding formula'],
            revision: { leitnerBox: 1, lastReviewed: '2026-11-09', nextReview: '2026-11-10', reviewCount: 1 }
          }
        ]
      },
      {
        id: 'math-c2',
        title: 'Integral Calculus & Techniques',
        order: 2,
        color: '#059669',
        topics: [
          {
            id: 'calc-ftc',
            title: 'Fundamental Theorem of Calculus & Riemann Sums',
            chapterId: 'math-c2',
            difficulty: 'medium',
            estimatedHours: 4.0,
            actualHours: 4.0,
            status: 'mastered',
            confidence: 4,
            prerequisites: ['calc-derivatives'],
            notes: 'd/dx int_a^x f(t) dt = f(x). Part 2: int_a^b f(x) dx = F(b) - F(a). Connects differentiation and integration.',
            keyTakeaways: ['Riemann partition sums as limits', 'FTC Part 1 & Part 2', 'Accumulation functions'],
            revision: { leitnerBox: 3, lastReviewed: '2026-11-04', nextReview: '2026-11-11', reviewCount: 2 }
          },
          {
            id: 'calc-integration-tech',
            title: 'Integration by Parts, Trig Substitution & Partial Fractions',
            chapterId: 'math-c2',
            difficulty: 'hard',
            estimatedHours: 6.0,
            actualHours: 4.0,
            status: 'in_progress',
            confidence: 3,
            prerequisites: ['calc-ftc'],
            notes: 'int u dv = u v - int v du (LIATE rule). Trig sub: sqrt(a^2 - x^2) -> x = a sin(theta). Partial fraction decomposition.',
            keyTakeaways: ['Integration by parts recurrence', 'Weierstrass tangent half-angle substitution', 'Improper integrals with infinite limits'],
            revision: { leitnerBox: 2, lastReviewed: '2026-11-07', nextReview: '2026-11-10', reviewCount: 1 }
          }
        ]
      },
      {
        id: 'math-c3',
        title: 'Multivariable Calculus & Vector Fields',
        order: 3,
        color: '#d97706',
        topics: [
          {
            id: 'calc-multivar',
            title: 'Partial Derivatives, Gradients & Directional Derivatives',
            chapterId: 'math-c3',
            difficulty: 'medium',
            estimatedHours: 4.5,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['calc-derivatives'],
            notes: 'Gradient points in direction of steepest ascent with magnitude equal to rate of change. D_u f = grad f . u.',
            keyTakeaways: ['Tangent plane equation', 'Clairaut\'s theorem on equality of mixed partials', 'Lagrange Multipliers for constrained extrema'],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          },
          {
            id: 'calc-multiple-integrals',
            title: 'Double & Triple Integrals (Polar, Cylindrical, Spherical)',
            chapterId: 'math-c3',
            difficulty: 'hard',
            estimatedHours: 5.5,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['calc-multivar', 'calc-integration-tech'],
            notes: 'Jacobian determinant dx dy = r dr dtheta. Spherical: rho^2 sin(phi) d_rho d_phi d_theta. Fubini\'s Theorem.',
            keyTakeaways: ['Fubini\'s theorem and region swapping', 'Jacobian transformation matrix', 'Center of mass and moment of inertia integrals'],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          },
          {
            id: 'calc-vector-theorems',
            title: 'Green\'s, Stokes\' and Divergence Theorems',
            chapterId: 'math-c3',
            difficulty: 'expert',
            estimatedHours: 6.5,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['calc-multiple-integrals'],
            notes: 'Generalized Stokes theorem: int_{partial Omega} omega = int_Omega d omega. Conservative fields and path independence.',
            keyTakeaways: ['Line integrals and circulation', 'Flux through closed surfaces', 'Physical interpretation: curl and divergence'],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          }
        ]
      },
      {
        id: 'math-c4',
        title: 'Ordinary Differential Equations (ODEs)',
        order: 4,
        color: '#dc2626',
        topics: [
          {
            id: 'calc-first-order-ode',
            title: 'First-Order Separable & Linear ODEs (Integrating Factor)',
            chapterId: 'math-c4',
            difficulty: 'medium',
            estimatedHours: 4.0,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['calc-integration-tech'],
            notes: 'dy/dx + P(x)y = Q(x). Integrating factor mu(x) = exp(int P(x) dx). Exact equations and potential functions.',
            keyTakeaways: ['Separation of variables', 'Integrating factor derivation', 'Existence and uniqueness (Picard-Lindelof)'],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          },
          {
            id: 'calc-second-order-ode',
            title: 'Second-Order Linear ODEs & Characteristic Equations',
            chapterId: 'math-c4',
            difficulty: 'hard',
            estimatedHours: 5.0,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['calc-first-order-ode', 'calc-taylor'],
            notes: 'ay\'\' + by\' + cy = 0. Characteristic roots r^2 + br + c = 0. Distinct real, repeated, and complex conjugate harmonic oscillations.',
            keyTakeaways: ['Wronskian determinant for linear independence', 'Undetermined coefficients vs Variation of Parameters', 'Damped harmonic oscillator regimes'],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          }
        ]
      }
    ],
    edges: [
      { from: 'calc-limits', to: 'calc-derivatives' },
      { from: 'calc-derivatives', to: 'calc-taylor' },
      { from: 'calc-derivatives', to: 'calc-ftc' },
      { from: 'calc-ftc', to: 'calc-integration-tech' },
      { from: 'calc-derivatives', to: 'calc-multivar' },
      { from: 'calc-multivar', to: 'calc-multiple-integrals' },
      { from: 'calc-integration-tech', to: 'calc-multiple-integrals' },
      { from: 'calc-multiple-integrals', to: 'calc-vector-theorems' },
      { from: 'calc-integration-tech', to: 'calc-first-order-ode' },
      { from: 'calc-first-order-ode', to: 'calc-second-order-ode' },
      { from: 'calc-taylor', to: 'calc-second-order-ode' }
    ]
  },
  {
    id: 'chem-210',
    code: 'CHEM 210',
    title: 'Organic Chemistry & Reaction Mechanisms',
    institution: 'Department of Chemistry',
    term: 'Fall 2026',
    targetExamDate: '2026-12-10',
    description: 'Structure, bonding, stereochemistry, substitution/elimination mechanisms, carbonyl chemistry, and NMR spectroscopy analysis.',
    chapters: [
      {
        id: 'chem-c1',
        title: 'Structure, Hybridization & Stereochemistry',
        order: 1,
        color: '#0d9488',
        topics: [
          {
            id: 'chem-bonding',
            title: 'Lewis Structures, Resonance & Orbital Hybridization',
            chapterId: 'chem-c1',
            difficulty: 'easy',
            estimatedHours: 3.0,
            actualHours: 3.0,
            status: 'mastered',
            confidence: 5,
            prerequisites: [],
            notes: 'sp3 (tetrahedral 109.5), sp2 (trigonal planar 120), sp (linear 180). Curved arrow formalism for electron pair flow.',
            keyTakeaways: ['Formal charges calculation', 'Major vs minor resonance contributors', 'Acid-base pKa trends and conjugate base stability'],
            revision: { leitnerBox: 4, lastReviewed: '2026-11-02', nextReview: '2026-11-16', reviewCount: 3 }
          },
          {
            id: 'chem-stereo',
            title: 'Stereochemistry: Chirality, Enantiomers & Cahn-Ingold-Prelog (R/S)',
            chapterId: 'chem-c1',
            difficulty: 'hard',
            estimatedHours: 5.0,
            actualHours: 4.5,
            status: 'mastered',
            confidence: 4,
            prerequisites: ['chem-bonding'],
            notes: 'Priority by atomic number. (R) clockwise, (S) counter-clockwise. Diastereomers (not mirror images, different physical properties). Meso compounds.',
            keyTakeaways: ['Chiral stereocenters and plane of symmetry', 'Fischer projections and Newman projections', 'Specific optical rotation calculations'],
            revision: { leitnerBox: 3, lastReviewed: '2026-11-05', nextReview: '2026-11-12', reviewCount: 2 }
          }
        ]
      },
      {
        id: 'chem-c2',
        title: 'Substitution & Elimination Mechanisms',
        order: 2,
        color: '#0284c7',
        topics: [
          {
            id: 'chem-sn1-sn2',
            title: 'Nucleophilic Substitution: SN1 vs SN2 Dynamics',
            chapterId: 'chem-c2',
            difficulty: 'medium',
            estimatedHours: 4.5,
            actualHours: 3.5,
            status: 'in_progress',
            confidence: 3,
            prerequisites: ['chem-stereo'],
            notes: 'SN2: bimolecular, concerted backside attack with Walden inversion, favored by primary halides and polar aprotic solvents. SN1: carbocation intermediate, racemization.',
            keyTakeaways: ['Leaving group ability (conjugate base of strong acids)', 'Solvent effects: protic vs aprotic', 'Steric hindrance vs carbocation stability'],
            revision: { leitnerBox: 2, lastReviewed: '2026-11-07', nextReview: '2026-11-10', reviewCount: 1 }
          },
          {
            id: 'chem-e1-e2',
            title: 'Elimination Mechanisms: E1 vs E2 & Zaitsev vs Hofmann',
            chapterId: 'chem-c2',
            difficulty: 'hard',
            estimatedHours: 4.5,
            actualHours: 2.0,
            status: 'needs_revision',
            confidence: 2,
            prerequisites: ['chem-sn1-sn2'],
            notes: 'E2 requires anti-periplanar geometry (H and LG 180 degrees in chair conformation). Small base gives Zaitsev (more substituted alkene); bulky t-BuOK gives Hofmann.',
            keyTakeaways: ['Anti-periplanar stereospecificity in cyclohexanes', 'Base strength & sterics dictating substitution vs elimination', 'Zaitsev thermodynamic stability rules'],
            revision: { leitnerBox: 1, lastReviewed: '2026-11-09', nextReview: '2026-11-10', reviewCount: 1 }
          }
        ]
      },
      {
        id: 'chem-c3',
        title: 'Carbonyl Chemistry & Enolates',
        order: 3,
        color: '#7c3aed',
        topics: [
          {
            id: 'chem-carbonyl-add',
            title: 'Aldehydes & Ketones: Nucleophilic Carbonyl Addition',
            chapterId: 'chem-c3',
            difficulty: 'medium',
            estimatedHours: 4.5,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['chem-sn1-sn2'],
            notes: 'Grignard reagents R-MgX, Hydride reductions (NaBH4, LiAlH4), Hemiacetal and acetal protecting groups.',
            keyTakeaways: ['Electrophilicity of carbonyl carbon', 'Hydration and acetal equilibria', 'Wittig reaction for alkene synthesis'],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          },
          {
            id: 'chem-aldol',
            title: 'Enols, Enolates & The Aldol / Claisen Condensation',
            chapterId: 'chem-c3',
            difficulty: 'expert',
            estimatedHours: 6.0,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['chem-carbonyl-add', 'chem-e1-e2'],
            notes: 'Alpha hydrogen acidity pKa ~20. Thermodynamic vs kinetic enolates (LDA at -78 C gives kinetic). Aldol addition followed by E1cB dehydration to alpha,beta-unsaturated carbonyl.',
            keyTakeaways: ['Kinetic vs thermodynamic enolate control', 'Crossed aldol selectivity', 'Michael addition and Robinson annulation'],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          }
        ]
      },
      {
        id: 'chem-c4',
        title: 'Spectroscopy & Structure Elucidation',
        order: 4,
        color: '#dc2626',
        topics: [
          {
            id: 'chem-nmr-ir',
            title: '1H & 13C NMR Spectroscopy & Infrared (IR) Analysis',
            chapterId: 'chem-c4',
            difficulty: 'hard',
            estimatedHours: 5.5,
            actualHours: 0,
            status: 'not_started',
            confidence: 1,
            prerequisites: ['chem-bonding'],
            notes: 'IR: C=O at ~1715 cm^-1, O-H broad at ~3300 cm^-1. NMR: Chemical shift (ppm), integration (number of H), multiplicity (n+1 splitting rule for coupling).',
            keyTakeaways: ['Degree of unsaturation formula (DU = C - H/2 + N/2 + 1)', 'Spin-spin splitting and coupling constants (J values)', 'Solving unknown structural puzzles'],
            revision: { leitnerBox: 1, lastReviewed: null, nextReview: null, reviewCount: 0 }
          }
        ]
      }
    ],
    edges: [
      { from: 'chem-bonding', to: 'chem-stereo' },
      { from: 'chem-bonding', to: 'chem-nmr-ir' },
      { from: 'chem-stereo', to: 'chem-sn1-sn2' },
      { from: 'chem-sn1-sn2', to: 'chem-e1-e2' },
      { from: 'chem-sn1-sn2', to: 'chem-carbonyl-add' },
      { from: 'chem-carbonyl-add', to: 'chem-aldol' },
      { from: 'chem-e1-e2', to: 'chem-aldol' }
    ]
  }
];
