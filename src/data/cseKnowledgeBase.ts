/**
 * CSVTU / Vidya Setu CSE (Computer Science & Engineering) Semester 1–8 Knowledge Base
 * Scope: Strictly CSE (Computer Science & Engineering) Semesters 1 through 8.
 * Covers: Syllabus, Core Concepts, CSVTU Previous Year Questions (PYQs), and Reference Guides.
 */

export interface CSESubject {
  semester: number;
  code: string;
  name: string;
  category: "Theory" | "Lab";
  units: {
    unitNumber: number;
    title: string;
    topics: string[];
    keyConcepts: string;
  }[];
  pyqs: {
    year: string;
    question: string;
    marks: number;
    solutionPoints: string[];
  }[];
  references: string[];
}

export const CSE_CURRICULUM_DATA: CSESubject[] = [
  // ================= SEMESTER 1 & 2 =================
  {
    semester: 1,
    code: "BTECH-101",
    name: "Programming for Problem Solving in C",
    category: "Theory",
    units: [
      {
        unitNumber: 1,
        title: "Introduction to Programming & C Fundamentals",
        topics: ["Algorithms", "Flowcharts", "Data types", "Operators", "Control statements (if-else, switch, loops)"],
        keyConcepts: "C compilation process (Preprocessor -> Compiler -> Assembler -> Linker). Memory allocation for primitive types (int, float, char, double). Loop optimization."
      },
      {
        unitNumber: 2,
        title: "Arrays, Strings & Pointers",
        topics: ["1D & 2D Arrays", "String manipulation functions", "Pointer arithmetic", "Dynamic memory allocation (malloc, calloc, realloc, free)"],
        keyConcepts: "Pointer arithmetic: ptr + 1 advances by sizeof(*ptr) bytes. Dangling pointers, memory leaks, and buffer overflow prevention."
      },
      {
        unitNumber: 3,
        title: "Functions & Recursion",
        topics: ["Function prototypes", "Call by value vs Call by reference", "Recursion", "Storage classes (auto, static, extern, register)"],
        keyConcepts: "Stack frame organization during recursive calls. Base condition requirement to prevent stack overflow."
      },
      {
        unitNumber: 4,
        title: "Structures, Unions & File Handling",
        topics: ["Structures vs Unions", "Pointers to structures", "File I/O (fopen, fclose, fread, fwrite, fprintf, fscanf)", "File modes"],
        keyConcepts: "Structure memory alignment & padding. Union memory allocation sharing the largest member size."
      }
    ],
    pyqs: [
      {
        year: "CSVTU Dec 2023",
        question: "Differentiate between call by value and call by reference in C with suitable programming examples.",
        marks: 7,
        solutionPoints: [
          "Call by value passes a copy of the actual argument; changes in function do not affect caller.",
          "Call by reference passes the memory address of the argument using pointers; modifies original value in caller.",
          "Code example showing swap() function implemented using pointers (int *a, int *b)."
        ]
      },
      {
        year: "CSVTU May 2023",
        question: "Explain dynamic memory allocation functions in C (malloc, calloc, realloc, free) with syntax and usage.",
        marks: 7,
        solutionPoints: [
          "malloc(size): allocates uninitialized contiguous memory block.",
          "calloc(num, size): allocates and zero-initializes memory block.",
          "realloc(ptr, new_size): resizes existing allocated block.",
          "free(ptr): releases allocated memory to prevent memory leaks."
        ]
      },
      {
        year: "CSVTU Nov 2022",
        question: "What is a structure in C? How is it different from a union in terms of memory allocation?",
        marks: 7,
        solutionPoints: [
          "Structure allocates separate memory for every member (total size >= sum of member sizes with padding).",
          "Union shares a single memory location equal to the size of its largest member.",
          "Show memory diagram and sizeof() evaluation."
        ]
      }
    ],
    references: ["E. Balagurusamy - Programming in ANSI C", "Kernighan & Ritchie - The C Programming Language"]
  },

  // ================= SEMESTER 3 =================
  {
    semester: 3,
    code: "CS301",
    name: "Data Structures & Algorithms",
    category: "Theory",
    units: [
      {
        unitNumber: 1,
        title: "Linear Data Structures: Arrays & Linked Lists",
        topics: ["Asymptotic notation (Big O, Omega, Theta)", "Singly, Doubly and Circular Linked Lists", "Sparse matrix"],
        keyConcepts: "Time complexity analysis. Linked list insertion/deletion at head, tail, and arbitrary positions in O(1) and O(N)."
      },
      {
        unitNumber: 2,
        title: "Stacks & Queues",
        topics: ["Stack operations (Push, Pop, Peek)", "Infix to Postfix conversion", "Postfix evaluation", "Circular Queue", "Priority Queue", "Deque"],
        keyConcepts: "Stack applications (expression parsing, recursion simulation). Circular queue avoids memory wastage using modulo arithmetic ((rear + 1) % size)."
      },
      {
        unitNumber: 3,
        title: "Non-Linear Data Structures: Trees",
        topics: ["Binary Tree traversals (Inorder, Preorder, Postorder)", "Binary Search Tree (BST)", "AVL Trees & Rotations (LL, RR, LR, RL)", "B-Trees & B+ Trees", "Heap data structure"],
        keyConcepts: "BST search/insert O(h). AVL tree maintains balance factor in {-1, 0, 1} through rotations to guarantee O(log N) worst-case."
      },
      {
        unitNumber: 4,
        title: "Graphs & Sorting Algorithms",
        topics: ["Adjacency Matrix & Adjacency List", "BFS & DFS", "Dijkstra Algorithm", "Kruskal & Prim MST", "Quick Sort", "Merge Sort", "Heap Sort"],
        keyConcepts: "BFS uses Queue (O(V+E)). DFS uses Stack/Recursion (O(V+E)). Merge Sort O(N log N) stable; Quick Sort O(N log N) average, O(N^2) worst case."
      }
    ],
    pyqs: [
      {
        year: "CSVTU Dec 2023",
        question: "Explain the algorithm to convert an Infix expression to Postfix using Stack. Trace with: (A + B * C) / (D - E).",
        marks: 10,
        solutionPoints: [
          "Precedence & associativity table (parenthesis > ^ > * / > + -).",
          "Step-by-step stack status trace table.",
          "Resulting postfix expression: A B C * + D E - /"
        ]
      },
      {
        year: "CSVTU May 2023",
        question: "What is an AVL Tree? Explain the 4 types of rotations (LL, RR, LR, RL) with diagrams.",
        marks: 10,
        solutionPoints: [
          "AVL is a self-balancing BST where Balance Factor = Height(Left) - Height(Right) is strictly -1, 0, or +1.",
          "Single Rotations: LL (Right Rotation), RR (Left Rotation).",
          "Double Rotations: LR (Left on child, Right on root), RL (Right on child, Left on root)."
        ]
      },
      {
        year: "CSVTU Nov 2022",
        question: "Explain Quick Sort algorithm. Trace it for array [38, 27, 43, 3, 9, 82, 10] and analyze its time complexity.",
        marks: 10,
        solutionPoints: [
          "Partitioning logic using pivot element (Lomuto or Hoare).",
          "Best & Average case: O(N log N). Worst case (already sorted array): O(N^2).",
          "Auxiliary space: O(log N) for call stack."
        ]
      }
    ],
    references: ["Ellis Horowitz & Sartaj Sahni - Fundamentals of Data Structures", "Reema Thareja - Data Structures Using C"]
  },
  {
    semester: 3,
    code: "CS302",
    name: "Digital Electronics & Logic Design",
    category: "Theory",
    units: [
      {
        unitNumber: 1,
        title: "Number Systems & Boolean Algebra",
        topics: ["Binary, Octal, Hexadecimal conversions", "2's complement arithmetic", "De Morgan's laws", "Karnaugh Maps (K-Maps up to 5 variables)", "Don't care conditions"],
        keyConcepts: "Boolean minimization using K-map grouping (pairs, quads, octets). Hazard conditions in combinational logic."
      },
      {
        unitNumber: 2,
        title: "Combinational Logic Circuits",
        topics: ["Half Adder & Full Adder", "Carry Look-Ahead Adder", "Multiplexers (MUX)", "Demultiplexers (DEMUX)", "Decoders & Encoders", "Priority Encoder"],
        keyConcepts: "Designing logic functions using 4:1 or 8:1 Multiplexers. Decoder expansion."
      },
      {
        unitNumber: 3,
        title: "Sequential Logic Circuits & Flip-Flops",
        topics: ["SR, JK, D, T Flip-Flops", "Master-Slave JK Flip-Flop", "Race around condition", "Excitation tables", "State diagrams"],
        keyConcepts: "Race around condition occurs in level-triggered JK flip-flops when J=1, K=1 and clock pulse width > propagation delay. Solved using Master-Slave or Edge Triggering."
      }
    ],
    pyqs: [
      {
        year: "CSVTU Dec 2023",
        question: "What is race-around condition in JK Flip-Flop? How does Master-Slave JK Flip-Flop eliminate it?",
        marks: 7,
        solutionPoints: [
          "Condition definition: output toggles continuously during clock high when J=K=1 and tp > td.",
          "Master-Slave architecture: Master active on clock high, Slave active on clock low (falling edge).",
          "Truth table, timing diagram and internal circuit."
        ]
      }
    ],
    references: ["M. Morris Mano - Digital Logic and Computer Design", "R.P. Jain - Modern Digital Electronics"]
  },

  // ================= SEMESTER 4 =================
  {
    semester: 4,
    code: "CS401",
    name: "Operating Systems",
    category: "Theory",
    units: [
      {
        unitNumber: 1,
        title: "OS Services, System Calls & Process Management",
        topics: ["Kernel architecture (Monolithic vs Microkernel)", "Process Control Block (PCB)", "Process states", "Context switching", "System calls (fork, exec, wait, exit)"],
        keyConcepts: "Context switch overhead: saving registers and program counter into PCB. Fork() duplicate process with independent address space."
      },
      {
        unitNumber: 2,
        title: "CPU Scheduling & Process Synchronization",
        topics: ["FCFS, SJF, SRTF, Round Robin, Priority Scheduling", "Convoy Effect", "Critical Section Problem", "Peterson's Solution", "Semaphores (Binary & Counting)", "Classic synchronization: Producer-Consumer, Dining Philosophers"],
        keyConcepts: "Turnaround Time = Completion Time - Arrival Time. Waiting Time = Turnaround Time - Burst Time. Semaphore wait(P) and signal(V) atomic operations."
      },
      {
        unitNumber: 3,
        title: "Deadlocks",
        topics: ["Four Coffman conditions", "Resource Allocation Graph (RAG)", "Deadlock prevention", "Deadlock avoidance (Banker's Algorithm)", "Deadlock detection & recovery"],
        keyConcepts: "Four necessary conditions: Mutual exclusion, Hold & Wait, No preemption, Circular wait. Banker's algorithm checks safe state using Need = Max - Allocation."
      },
      {
        unitNumber: 4,
        title: "Memory Management & Virtual Memory",
        topics: ["Logical vs Physical address", "Paging", "Page Table & TLB", "Segmentation", "Page faults", "Page replacement (FIFO, LRU, Optimal)", "Belady's Anomaly", "Thrashing"],
        keyConcepts: "Page table maps logical page number to physical frame number. TLB hit/miss ratio. Belady's anomaly: increasing page frames increases page faults in FIFO."
      }
    ],
    pyqs: [
      {
        year: "CSVTU May 2023",
        question: "Explain Banker's Algorithm for deadlock avoidance with safety algorithm. Given Allocation, Max, and Available matrices, determine if system is safe.",
        marks: 10,
        solutionPoints: [
          "Define Need matrix = Max - Allocation.",
          "Step-by-step vector comparison (Need_i <= Work).",
          "Safe sequence deduction (e.g., <P1, P3, P4, P0, P2>) and verification."
        ]
      },
      {
        year: "CSVTU Dec 2022",
        question: "What is Belady's Anomaly? Illustrate with FIFO page replacement for reference string: 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5 with 3 and 4 frames.",
        marks: 10,
        solutionPoints: [
          "Phenomenon where increasing frame count leads to more page faults under FIFO.",
          "Table tracing: 3 frames yields 9 page faults.",
          "Table tracing: 4 frames yields 10 page faults (demonstrating anomaly)."
        ]
      },
      {
        year: "CSVTU May 2022",
        question: "Explain the Critical Section problem. How do Semaphores solve the Producer-Consumer bounded buffer problem?",
        marks: 8,
        solutionPoints: [
          "Mutual exclusion, Progress, Bounded Waiting conditions.",
          "Three semaphores: mutex (binary, 1), empty (counting, N), full (counting, 0).",
          "Producer code with wait(empty), wait(mutex), signal(mutex), signal(full).",
          "Consumer code with wait(full), wait(mutex), signal(mutex), signal(empty)."
        ]
      }
    ],
    references: ["Silberschatz, Galvin & Gagne - Operating System Concepts (9th/10th Ed.)", "Andrew S. Tanenbaum - Modern Operating Systems"]
  },
  {
    semester: 4,
    code: "CS402",
    name: "Computer Organization & Architecture (COA)",
    category: "Theory",
    units: [
      {
        unitNumber: 1,
        title: "Basic Computer Architecture & Instruction Set",
        topics: ["Von Neumann vs Harvard architecture", "Instruction cycle", "Addressing modes", "RISC vs CISC"],
        keyConcepts: "Von Neumann bottleneck (shared bus for code and data). Direct, Indirect, Register, Indexed addressing modes."
      },
      {
        unitNumber: 2,
        title: "Pipelining & Parallelism",
        topics: ["Instruction pipeline (IF, ID, EX, MEM, WB)", "Pipeline hazards (Structural, Data, Control)", "Branch prediction"],
        keyConcepts: "Speedup = (k * n) / (k + n - 1). Data hazards (RAW, WAR, WAW) handled by operand forwarding or pipeline stalls."
      },
      {
        unitNumber: 3,
        title: "Memory Hierarchy & Cache Memory",
        topics: ["Locality of reference (Temporal & Spatial)", "Cache mapping (Direct, Fully Associative, Set-Associative)", "Cache write policies (Write-through vs Write-back)"],
        keyConcepts: "Effective Access Time (EAT) = h * Tc + (1 - h) * Tm. Direct mapping index bits = log2(number of cache lines)."
      }
    ],
    pyqs: [
      {
        year: "CSVTU Dec 2023",
        question: "Differentiate between Direct Mapping, Associative Mapping, and Set-Associative Mapping in Cache Memory.",
        marks: 10,
        solutionPoints: [
          "Direct: block k maps strictly to line (k mod N). Fast lookup, high conflict misses.",
          "Associative: block k can reside in any line. Zero conflict misses, expensive hardware comparison.",
          "Set-Associative: block k maps to set (k mod S), lines per set = n. Optimum balance."
        ]
      }
    ],
    references: ["William Stallings - Computer Organization and Architecture", "Carl Hamacher - Computer Organization"]
  },

  // ================= SEMESTER 5 =================
  {
    semester: 5,
    code: "CS501",
    name: "Database Management Systems (DBMS)",
    category: "Theory",
    units: [
      {
        unitNumber: 1,
        title: "Data Models & Relational Algebra",
        topics: ["3-Tier DBMS Architecture", "ER Modeling", "Primary, Candidate, Foreign, Super Keys", "Relational Algebra operations (Select, Project, Cartesian Product, Join, Division)"],
        keyConcepts: "Physical and logical data independence. Relational integrity constraints."
      },
      {
        unitNumber: 2,
        title: "SQL & Normalization",
        topics: ["DDL, DML, DCL", "Nested subqueries", "Views", "Functional dependencies", "1NF, 2NF, 3NF, BCNF", "Lossless decomposition & Dependency preservation"],
        keyConcepts: "2NF eliminates partial dependencies. 3NF eliminates transitive dependencies. BCNF: every determinant is a superkey."
      },
      {
        unitNumber: 3,
        title: "Transaction Processing & Concurrency Control",
        topics: ["ACID Properties", "Schedule serializability (Conflict & View)", "Two-Phase Locking (2PL)", "Deadlock in DBMS", "Timestamp ordering"],
        keyConcepts: "Conflict serializability tested using Precedence Graph (acyclic = conflict serializable). Strict 2PL guarantees recoverability and cascade-free schedules."
      }
    ],
    pyqs: [
      {
        year: "CSVTU Dec 2023",
        question: "Define Normalization. Explain 1NF, 2NF, 3NF and BCNF with suitable relational schema examples.",
        marks: 10,
        solutionPoints: [
          "Goal: eliminate insertion, deletion, and update anomalies.",
          "1NF: atomic values only.",
          "2NF: in 1NF + no non-prime attribute partially dependent on composite PK.",
          "3NF: in 2NF + no non-prime attribute transitively dependent on PK.",
          "BCNF: for every X -> Y, X must be superkey."
        ]
      },
      {
        year: "CSVTU May 2023",
        question: "Explain ACID properties of transactions. How does Two-Phase Locking (2PL) ensure conflict serializability?",
        marks: 10,
        solutionPoints: [
          "Atomicity (all or nothing), Consistency (preserves invariants), Isolation (concurrent executions equivalent to serial), Durability (committed changes persist).",
          "Growing phase: acquire locks, cannot release.",
          "Shrinking phase: release locks, cannot acquire new.",
          "Rigorous / Strict 2PL prevents cascading aborts."
        ]
      }
    ],
    references: ["Korth, Silberschatz & Sudarshan - Database System Concepts", "Elmasri & Navathe - Fundamentals of Database Systems"]
  },
  {
    semester: 5,
    code: "CS502",
    name: "Theory of Computation (Automata)",
    category: "Theory",
    units: [
      {
        unitNumber: 1,
        title: "Finite Automata & Regular Languages",
        topics: ["Deterministic Finite Automata (DFA)", "NFA & NFA-to-DFA conversion (Subset Construction)", "Regular expressions", "Pumping Lemma for Regular Languages"],
        keyConcepts: "DFA: delta(q, a) -> q'. NFA: delta(q, a) -> 2^Q. Equivalence of DFA and NFA expressive power."
      },
      {
        unitNumber: 2,
        title: "Context-Free Grammars (CFG) & Pushdown Automata (PDA)",
        topics: ["Derivation trees", "Ambiguous grammars", "Chomsky Normal Form (CNF)", "Pushdown Automata (DPDA vs NPDA)"],
        keyConcepts: "PDA = Finite state control + infinite stack memory. NPDA is strictly more powerful than DPDA."
      },
      {
        unitNumber: 3,
        title: "Turing Machines & Decidability",
        topics: ["Turing Machine model", "Chomsky Hierarchy", "Halting Problem", "Undecidability"],
        keyConcepts: "Turing Machine accepts recursively enumerable languages. Halting problem is undecidable by diagonal proof."
      }
    ],
    pyqs: [
      {
        year: "CSVTU Dec 2023",
        question: "State and prove Pumping Lemma for Regular Languages. Prove that L = {0^n 1^n | n >= 1} is not regular.",
        marks: 10,
        solutionPoints: [
          "Theorem statement: any regular language with string |w| >= p can be split into w = xyz where |xy| <= p, |y| > 0, and xy^i z in L for all i >= 0.",
          "Assumption: L is regular.",
          "Pumping y leads to contradiction (unequal number of 0s and 1s)."
        ]
      }
    ],
    references: ["Peter Linz - An Introduction to Formal Languages and Automata", "Hopcroft, Motwani & Ullman - Introduction to Automata Theory"]
  },

  // ================= SEMESTER 6 =================
  {
    semester: 6,
    code: "CS601",
    name: "Computer Networks",
    category: "Theory",
    units: [
      {
        unitNumber: 1,
        title: "Network Architecture & Physical / Data Link Layer",
        topics: ["OSI 7 Layers vs TCP/IP Suite", "Framing", "Error detection (CRC, Checksum)", "Sliding Window Protocols (Stop-and-Wait, Go-Back-N, Selective Repeat)", "CSMA/CD & Ethernet"],
        keyConcepts: "CRC polynomial division. Go-Back-N efficiency = N / (1 + 2a). CSMA/CD minimum frame length = 2 * Propagation Delay * Bandwidth."
      },
      {
        unitNumber: 2,
        title: "Network Layer & Routing",
        topics: ["IPv4 addressing & Subnetting (CIDR)", "IPv6 format", "Distance Vector Routing (Bellman-Ford & Count to Infinity)", "Link State Routing (Dijkstra/OSPF)", "ARP, RARP, ICMP"],
        keyConcepts: "Subnet mask calculations. Network ID, Broadcast ID, usable host range."
      },
      {
        unitNumber: 3,
        title: "Transport Layer & Application Protocols",
        topics: ["TCP vs UDP", "TCP 3-Way Handshake & Connection Teardown", "Flow control (Sliding Window)", "Congestion control (Slow Start, Congestion Avoidance, Fast Retransmit)", "DNS, HTTP/1.1, HTTP/2, SMTP, DHCP"],
        keyConcepts: "TCP provides reliable byte-stream with sequence numbers, ACKs and retransmission timers. UDP is lightweight, connectionless datagram."
      }
    ],
    pyqs: [
      {
        year: "CSVTU Dec 2023",
        question: "Explain the TCP 3-Way Handshake and 4-way termination with timing sequence diagrams.",
        marks: 10,
        solutionPoints: [
          "Handshake: 1. Client sends SYN (seq=x). 2. Server replies SYN+ACK (seq=y, ack=x+1). 3. Client sends ACK (ack=y+1).",
          "Teardown: FIN -> ACK -> FIN -> ACK with TIME_WAIT state.",
          "Sequence number synchronization and socket port binding."
        ]
      },
      {
        year: "CSVTU May 2023",
        question: "Given IP address 192.168.10.0/24, divide it into 4 equal subnets. Find subnet mask, network address, broadcast address, and host ranges.",
        marks: 10,
        solutionPoints: [
          "Need 4 subnets: borrow 2 bits -> /26 (mask: 255.255.255.192).",
          "Subnet 1: Net 192.168.10.0, Range 192.168.10.1 - 192.168.10.62, Bcast 192.168.10.63.",
          "Subnet 2: Net 192.168.10.64, Range 192.168.10.65 - 192.168.10.126, Bcast 192.168.10.127.",
          "Subnet 3: Net 192.168.10.128, Range 192.168.10.129 - 192.168.10.190, Bcast 192.168.10.191.",
          "Subnet 4: Net 192.168.10.192, Range 192.168.10.193 - 192.168.10.254, Bcast 192.168.10.255."
        ]
      }
    ],
    references: ["Andrew S. Tanenbaum - Computer Networks", "James F. Kurose & Keith W. Ross - Computer Networking: A Top-Down Approach"]
  },
  {
    semester: 6,
    code: "CS602",
    name: "Compiler Design",
    category: "Theory",
    units: [
      {
        unitNumber: 1,
        title: "Lexical Analysis & Parsing",
        topics: ["Phases of a Compiler", "Lexical analysis (Tokens, Lexemes, Patterns)", "Top-Down Parsing (LL(1))", "Bottom-Up Parsing (LR(0), SLR(1), LALR(1), CLR(1))", "First & Follow sets"],
        keyConcepts: "LL(1) parser construction: First and Follow computation, detecting grammar conflicts."
      },
      {
        unitNumber: 2,
        title: "Intermediate Code Generation & Code Optimization",
        topics: ["Syntax-Directed Translation (SDT)", "Three Address Code (TAC - Quadruples, Triples, Indirect Triples)", "Basic Blocks & Flow Graphs", "Loop Optimization (Code Motion, Loop Unrolling, Strength Reduction)"],
        keyConcepts: "Common subexpression elimination. Dead code removal. DAG representation of basic blocks."
      }
    ],
    pyqs: [
      {
        year: "CSVTU Dec 2023",
        question: "Explain the 6 phases of a compiler with a block diagram and trace for the statement: position = initial + rate * 60.",
        marks: 10,
        solutionPoints: [
          "Lexical Analyzer (tokens), Syntax Analyzer (parse tree), Semantic Analyzer (type checking).",
          "Intermediate Code Generator (TAC), Code Optimizer, Target Code Generator.",
          "Symbol table manager and Error handler interaction across all phases."
        ]
      }
    ],
    references: ["Aho, Lam, Sethi & Ullman - Compilers: Principles, Techniques, and Tools (Dragon Book)"]
  },

  // ================= SEMESTER 7 =================
  {
    semester: 7,
    code: "CS701",
    name: "Artificial Intelligence & Expert Systems",
    category: "Theory",
    units: [
      {
        unitNumber: 1,
        title: "Search Algorithms & Problem Solving",
        topics: ["State space representation", "Uninformed Search (BFS, DFS, Uniform Cost Search)", "Informed Search (A* algorithm, Greedy Best First)", "Admissible & Consistent heuristics", "Minimax algorithm & Alpha-Beta Pruning"],
        keyConcepts: "A* evaluation function f(n) = g(n) + h(n). Admissible heuristic never overestimates true cost to goal. Alpha-Beta pruning avoids evaluating branches that cannot influence the final decision."
      },
      {
        unitNumber: 2,
        title: "Knowledge Representation & Reasoning",
        topics: ["Propositional logic", "First-Order Predicate Logic (FOPL)", "Forward & Backward chaining", "Resolution & Unification", "Expert Systems architecture"],
        keyConcepts: "Resolution refutation proof algorithm. Converting sentences to Conjunctive Normal Form (CNF)."
      }
    ],
    pyqs: [
      {
        year: "CSVTU Dec 2023",
        question: "Explain A* Search Algorithm. Prove that A* is optimal if the heuristic function h(n) is admissible.",
        marks: 10,
        solutionPoints: [
          "f(n) = g(n) + h(n) where g(n) is path cost from start to n and h(n) is estimated cost to goal.",
          "Admissibility definition: 0 <= h(n) <= h*(n).",
          "Proof by contradiction that a sub-optimal goal cannot be expanded before an optimal one."
        ]
      }
    ],
    references: ["Stuart Russell & Peter Norvig - Artificial Intelligence: A Modern Approach", "Elaine Rich & Kevin Knight - Artificial Intelligence"]
  },

  // ================= SEMESTER 8 =================
  {
    semester: 8,
    code: "CS801",
    name: "Machine Learning & Deep Learning",
    category: "Theory",
    units: [
      {
        unitNumber: 1,
        title: "Supervised Learning",
        topics: ["Linear Regression & Gradient Descent", "Cost functions (MSE)", "Logistic Regression & Sigmoid", "Decision Trees & ID3/Gini Impurity", "Support Vector Machines (SVM & Kernel trick)", "Ensemble methods (Random Forest, AdaBoost)"],
        keyConcepts: "Gradient descent weight update rule: w = w - alpha * dJ/dw. Overfitting vs Underfitting (Bias-Variance tradeoff). Regularization (L1 Lasso, L2 Ridge)."
      },
      {
        unitNumber: 2,
        title: "Unsupervised Learning & Neural Networks",
        topics: ["K-Means Clustering", "Principal Component Analysis (PCA)", "Perceptron model", "Multi-Layer Perceptron (MLP)", "Backpropagation algorithm", "Activation functions (ReLU, Sigmoid, Softmax)"],
        keyConcepts: "Backpropagation applies the chain rule of calculus to calculate partial derivatives of loss with respect to every weight in the network."
      }
    ],
    pyqs: [
      {
        year: "CSVTU May 2023",
        question: "Explain the Backpropagation algorithm in Artificial Neural Networks with mathematical derivations.",
        marks: 10,
        solutionPoints: [
          "Forward pass: activation computation z = W * x + b and a = f(z).",
          "Loss computation: E = 1/2 * (y - a)^2.",
          "Backward pass: chain rule application dE/dw = (dE/da) * (da/dz) * (dz/dw).",
          "Weight update formula with learning rate."
        ]
      }
    ],
    references: ["Tom M. Mitchell - Machine Learning", "Ian Goodfellow, Yoshua Bengio & Aaron Courville - Deep Learning"]
  }
];

/**
 * RAG search utility across CSVTU CSE Knowledge Base.
 * Returns relevant curriculum units, notes, or PYQs with exact citation sources.
 */
export function searchCSEKnowledge(query: string): {
  isCSEAcademic: boolean;
  semesterMatched: number | null;
  subjectMatched: string | null;
  codeMatched: string | null;
  relevantContext: string;
  sourceCitations: string[];
} {
  const cleanQ = query.toLowerCase().trim();

  // Keywords that signal CSVTU / CSE Academic intent
  const cseKeywords = [
    "csvtu", "b.tech", "btech", "semester", "sem 1", "sem 2", "sem 3", "sem 4", "sem 5", "sem 6", "sem 7", "sem 8",
    "pyq", "syllabus", "exam", "marks", "unit", "discrete", "operating system", "os", "dbms", "database",
    "computer networks", "cn", "automata", "toc", "compiler", "coa", "architecture", "data structure", "dsa",
    "linked list", "binary tree", "avl", "sorting", "two pointer", "sliding window", "paging", "virtual memory",
    "normalization", "1nf", "2nf", "3nf", "bcnf", "acid", "deadlock", "banker", "semaphores", "tcp", "udp",
    "handshake", "subnetting", "ip address", "a*", "heuristic", "machine learning", "regression", "svm"
  ];

  const hasCSEIntent = cseKeywords.some(kw => cleanQ.includes(kw));

  // Try to find matching subject
  let bestSubject: CSESubject | null = null;
  let highestScore = 0;

  for (const subj of CSE_CURRICULUM_DATA) {
    let score = 0;
    const nameLower = subj.name.toLowerCase();
    const codeLower = subj.code.toLowerCase();

    if (cleanQ.includes(nameLower)) score += 10;
    if (cleanQ.includes(codeLower)) score += 10;
    if (cleanQ.includes(`sem ${subj.semester}`) || cleanQ.includes(`semester ${subj.semester}`)) score += 8;

    // Search units
    for (const u of subj.units) {
      if (cleanQ.includes(u.title.toLowerCase())) score += 6;
      for (const top of u.topics) {
        if (cleanQ.includes(top.toLowerCase())) score += 4;
      }
    }

    // Search PYQs
    for (const p of subj.pyqs) {
      if (cleanQ.includes(p.question.toLowerCase().slice(0, 20))) score += 8;
    }

    if (score > highestScore) {
      highestScore = score;
      bestSubject = subj;
    }
  }

  // If no strong subject match, but query mentions specific topics, search across all units
  let contextFragments: string[] = [];
  let sources: string[] = [];

  if (bestSubject && highestScore >= 4) {
    sources.push(`CSVTU CSE Sem ${bestSubject.semester} - ${bestSubject.name} (${bestSubject.code})`);
    
    // Assemble subject overview
    contextFragments.push(`### Course: ${bestSubject.name} [Code: ${bestSubject.code}, Semester: ${bestSubject.semester}, CSVTU CSE Scheme]`);
    
    // Find most relevant units
    for (const u of bestSubject.units) {
      const matchTopic = u.topics.some(t => cleanQ.includes(t.toLowerCase())) || cleanQ.includes(u.title.toLowerCase());
      if (matchTopic || highestScore >= 10) {
        contextFragments.push(`\n**Unit ${u.unitNumber}: ${u.title}**\nTopics: ${u.topics.join(", ")}\nKey Principles: ${u.keyConcepts}`);
      }
    }

    // Include matching PYQs
    const matchingPyqs = bestSubject.pyqs.filter(p => 
      cleanQ.includes("pyq") || cleanQ.includes("question") || cleanQ.includes("exam") ||
      p.question.toLowerCase().split(" ").some(w => w.length > 4 && cleanQ.includes(w))
    );

    if (matchingPyqs.length > 0) {
      contextFragments.push(`\n**Relevant CSVTU Previous Year Questions (PYQs):**`);
      for (const p of matchingPyqs) {
        contextFragments.push(`- **${p.year} (${p.marks} Marks):** ${p.question}\n  *Key Solution Guidelines:* ${p.solutionPoints.join("; ")}`);
      }
    }

    contextFragments.push(`\nRecommended Textbooks: ${bestSubject.references.join(", ")}`);
  }

  const isAcademic = hasCSEIntent || highestScore >= 4;

  return {
    isCSEAcademic: isAcademic,
    semesterMatched: bestSubject?.semester || null,
    subjectMatched: bestSubject?.name || null,
    codeMatched: bestSubject?.code || null,
    relevantContext: contextFragments.join("\n"),
    sourceCitations: sources
  };
}
