/* V2 Edduverse Academy & College Coding Curriculum Catalog.
   Includes CBSE/State School (Classes 6-12) and B.Tech / BCA / CS College Coding tracks.
   Features full interactive Coding Notes, DSA, Web Dev, OS, DBMS, CN & AI/ML. */
(() => {
  const chapter = (title, slug) => ({ title, slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') });
  const generic = (count) => Array.from({length: count}, (_,i) => chapter(`Chapter ${String(i+1).padStart(2,'0')}`));

  const known = {
    '6|Science': [
      'The Wonderful World of Science','Diversity in the Living World','Mindful Eating: A Path to a Healthy Body','Exploring Magnets','Measurement of Length and Motion','Materials Around Us','Temperature and its Measurement','A Journey through States of Water','Methods of Separation in Everyday Life','Living Creatures: Exploring their Characteristics','Nature’s Treasures','Beyond Earth'
    ],
    '6|Mathematics': ['Patterns in Mathematics','Lines and Angles','Number Play','Data Handling and Presentation','Prime Time','Perimeter and Area','Fractions','Playing with Constructions','Symmetry','The Other Side of Zero'],
    '6|Social Science': ['Locating Places on the Earth','Oceans and Continents','Landforms and Life','India, That Is Bharat','India’s Cultural Roots','Unity in Diversity, or Many in the One','Family and Community','Grassroots Democracy – Part 1: Governance','Grassroots Democracy – Part 2: Local Government in Rural Areas','Grassroots Democracy – Part 3: Local Government in Urban Areas','The Value of Work','Economic Activities Around Us'],
    '7|Science': ['Curiosity: Exploring the World of Science','Nutrition in Plants','Nutrition in Animals','Heat and Temperature','Acids, Bases and Salts','Physical and Chemical Changes','Weather, Climate and Adaptations','Winds, Storms and Cyclones','Life Processes in Plants','Life Processes in Animals','Light','Electric Current and its Effects'],
    '7|Mathematics': ['Integers','Fractions and Decimals','Data Handling','Simple Equations','Lines and Angles','The Triangle and its Properties','Comparing Quantities','Rational Numbers','Perimeter and Area','Algebraic Expressions','Exponents and Powers','Symmetry','Visualising Solid Shapes'],
    '8|Science': ['Exploring the World of Science','Cell: The Basic Unit of Life','Reproduction in Animals and Plants','Force and Pressure','Friction','Sound','Chemical Effects of Electric Current','Light','Stars and the Solar System','The Universe','Conservation of Plants and Animals','Microorganisms','Coal and Petroleum'],
    '8|Mathematics': ['Rational Numbers','Linear Equations in One Variable','Understanding Quadrilaterals','Data Handling','Squares and Square Roots','Cubes and Cube Roots','Comparing Quantities','Algebraic Expressions and Identities','Mensuration','Exponents and Powers','Direct and Inverse Proportions','Factorisation','Introduction to Graphs','Playing with Numbers'],
    '9|Science': ['Exploration: Entering the World of Science','Cell: The Basic Unit of Life','Tissues','Describing Motion Around Us','Exploring Mixtures and their Separation','Forces and their Effects','Work, Energy and Simple Machines','Journey Inside the Atom','Atomic Foundations of Matter','Sound: The Fundamental of Music','Matter Around Us','The Living World','Natural Resources'],
    '9|Mathematics': ['Number Systems','Polynomials','Coordinate Geometry','Linear Equations in Two Variables','Introduction to Euclid’s Geometry','Lines and Angles','Triangles','Quadrilaterals','Circles','Heron’s Formula','Surface Areas and Volumes','Statistics'],
    '9|Social Science': ['India and the Contemporary World – I','Contemporary India – I','Democratic Politics – I','Economics','Disaster Management and Society'],
    '10|Science': ['Chemical Reactions and Equations','Acids, Bases and Salts','Metals and Non-metals','Carbon and its Compounds','Life Processes','Control and Coordination','How do Organisms Reproduce?','Heredity','Light – Reflection and Refraction','The Human Eye and the Colourful World','Electricity','Magnetic Effects of Electric Current','Our Environment'],
    '10|Mathematics': ['Real Numbers','Polynomials','Pair of Linear Equations in Two Variables','Quadratic Equations','Arithmetic Progressions','Triangles','Coordinate Geometry','Introduction to Trigonometry','Some Applications of Trigonometry','Circles','Areas Related to Circles','Surface Areas and Volumes','Statistics','Probability'],
    '10|Social Science': ['Resources and Development','Forest and Wildlife Resources','Water Resources','Agriculture','Minerals and Energy Resources','Manufacturing Industries','Lifelines of National Economy','Power Sharing','Federalism','Gender, Religion and Caste','Political Parties','Outcomes of Democracy','Development','Sectors of the Indian Economy','Money and Credit','Globalisation and the Indian Economy','Consumer Rights'],
    '11|Physics': ['Physical World','Units and Measurements','Motion in a Straight Line','Motion in a Plane','Laws of Motion','Work, Energy and Power','System of Particles and Rotational Motion','Gravitation','Mechanical Properties of Solids','Mechanical Properties of Fluids','Thermal Properties of Matter','Thermodynamics','Kinetic Theory','Oscillations','Waves'],
    '11|Chemistry': ['Some Basic Concepts of Chemistry','Structure of Atom','Classification of Elements and Periodicity in Properties','Chemical Bonding and Molecular Structure','Thermodynamics','Equilibrium','Redox Reactions','Organic Chemistry – Some Basic Principles and Techniques','Hydrocarbons'],
    '11|Biology': ['The Living World','Biological Classification','Plant Kingdom','Animal Kingdom','Morphology of Flowering Plants','Anatomy of Flowering Plants','Structural Organisation in Animals','Cell: The Unit of Life','Biomolecules','Cell Cycle and Cell Division','Photosynthesis in Plants','Respiration in Plants','Plant Growth and Development','Breathing and Exchange of Gases','Body Fluids and Circulation','Excretory Products and their Elimination','Locomotion and Movement','Neural Control and Coordination','Chemical Coordination and Integration','Digestion and Absorption','Mineral Nutrition','Transport in Plants'],
    '11|Mathematics': ['Sets','Relations and Functions','Trigonometric Functions','Principle of Mathematical Induction','Complex Numbers and Quadratic Equations','Linear Inequalities','Permutations and Combinations','Binomial Theorem','Sequences and Series','Straight Lines','Conic Sections','Introduction to Three Dimensional Geometry','Limits and Derivatives','Statistics','Probability'],
    '12|Physics': ['Electric Charges and Fields','Electrostatic Potential and Capacitance','Current Electricity','Moving Charges and Magnetism','Magnetism and Matter','Electromagnetic Induction','Alternating Current','Electromagnetic Waves','Ray Optics and Optical Instruments','Wave Optics','Dual Nature of Radiation and Matter','Atoms','Nuclei','Semiconductor Electronics','Communication Systems'],
    '12|Chemistry': ['Solutions','Electrochemistry','Chemical Kinetics','The d- and f-Block Elements','Coordination Compounds','Haloalkanes and Haloarenes','Alcohols, Phenols and Ethers','Aldehydes, Ketones and Carboxylic Acids','Amines','Biomolecules','Polymers','Chemistry in Everyday Life'],
    '12|Biology': ['Reproduction','Sexual Reproduction in Flowering Plants','Human Reproduction','Reproductive Health','Principles of Inheritance and Variation','Molecular Basis of Inheritance','Evolution','Human Health and Disease','Strategies for Enhancement in Food Production','Microbes in Human Welfare','Biotechnology: Principles and Processes','Biotechnology and its Applications','Organisms and Populations','Ecosystem','Biodiversity and Conservation','Environmental Issues'],
    '12|Mathematics': ['Relations and Functions','Inverse Trigonometric Functions','Matrices','Determinants','Continuity and Differentiability','Application of Derivatives','Integrals','Application of Integrals','Differential Equations','Vector Algebra','Three Dimensional Geometry','Linear Programming','Probability']
  };

  const subjectSets = {
    6: ['Mathematics','Science','Social Science','English','Hindi','Sanskrit','Computer Science','General Knowledge','Art Education','Physical Education'],
    7: ['Mathematics','Science','Social Science','English','Hindi','Sanskrit','Computer Science','General Knowledge','Art Education','Physical Education'],
    8: ['Mathematics','Science','Social Science','English','Hindi','Sanskrit','Computer Science','General Knowledge','Art Education','Physical Education'],
    9: ['Mathematics','Science','Social Science','English','Hindi','Sanskrit','Computer Applications','Information Technology','Art Education','Physical Education'],
    10:['Mathematics','Science','Social Science','English','Hindi','Sanskrit','Computer Applications','Information Technology','Art Education','Physical Education'],
    11:['Physics','Chemistry','Mathematics','Biology','English','Hindi','Computer Science','Informatics Practices','Accountancy','Business Studies','Economics','History','Geography','Political Science','Sociology','Psychology','Physical Education','Fine Arts','Entrepreneurship'],
    12:['Physics','Chemistry','Mathematics','Biology','English','Hindi','Computer Science','Informatics Practices','Accountancy','Business Studies','Economics','History','Geography','Political Science','Sociology','Psychology','Physical Education','Fine Arts','Entrepreneurship']
  };

  const genericCounts = {English:10,Hindi:10,Sanskrit:10,'Computer Science':12,'Computer Applications':10,'Information Technology':10,'General Knowledge':12,'Art Education':8,'Physical Education':10,'Informatics Practices':10,Accountancy:11,'Business Studies':12,Economics:10,History:12,Geography:12,'Political Science':10,Sociology:10,Psychology:9,'Fine Arts':8,Entrepreneurship:9};

  const classes=[];
  for(let n=6;n<=12;n++){
    const subjects=subjectSets[n].map((name,si)=>{
      const key=`${n}|${name}`;
      const titles=known[key] || generic(genericCounts[name] || 10).map(x=>x.title);
      return {name, sort_order:si+1, chapters:titles.map((title,ci)=>chapter(title, `class-${n}-${name}-${ci+1}-${title}`))};
    });
    classes.push({class_number:n,name:`Class ${n}`,subjects,category:'school'});
  }

  /* =========================================================================
     COLLEGE & CODING CURRICULUM (B.Tech / BCA / MCA / Computer Science)
     ========================================================================= */
  const collegeTracks = [
    {
      id: "college-dsa",
      name: "Data Structures & Algorithms (DSA)",
      icon: "🌳",
      badge: "Core Placements",
      description: "Complete DSA mastery from linear arrays to graphs, DP and greedy algorithms with interview patterns.",
      subjects: [
        {
          name: "Arrays, Two-Pointers & Sliding Window",
          chapters: [
            chapter("Array Fundamentals & Memory Representation", "dsa-arrays-intro"),
            chapter("Two-Pointers & Sliding Window Technique", "dsa-two-pointers"),
            chapter("Prefix Sum, Kadane’s Algorithm & Subarrays", "dsa-kadane-subarrays"),
            chapter("Matrix Manipulation & 2D Arrays", "dsa-matrix-2d")
          ]
        },
        {
          name: "Linked Lists, Stacks & Queues",
          chapters: [
            chapter("Singly & Doubly Linked List Operations", "dsa-linked-list"),
            chapter("Fast & Slow Pointers: Floyd’s Cycle Detection", "dsa-floyd-cycle"),
            chapter("Stack Implementation & Monotonic Stack", "dsa-stack-monotonic"),
            chapter("Queue, Circular Queue & Deque (Sliding Window Max)", "dsa-queues-deque")
          ]
        },
        {
          name: "Trees & Binary Search Trees",
          chapters: [
            chapter("Binary Tree Traversals (DFS, BFS, Level-Order)", "dsa-binary-trees"),
            chapter("Binary Search Tree (BST) Properties & Operations", "dsa-bst-operations"),
            chapter("Height, Diameter & Lowest Common Ancestor (LCA)", "dsa-tree-lca"),
            chapter("Heaps, Priority Queues & Top-K Elements", "dsa-heaps-pq")
          ]
        },
        {
          name: "Graphs & Advanced Algorithms",
          chapters: [
            chapter("Graph Representation & BFS/DFS Traversals", "dsa-graph-traversals"),
            chapter("Dijkstra’s & Bellman-Ford Shortest Path", "dsa-shortest-path"),
            chapter("Disjoint Set Union (DSU) & Kruskal’s MST", "dsa-dsu-kruskal"),
            chapter("Topological Sort & Cycle Detection in DAG", "dsa-topological-sort")
          ]
        },
        {
          name: "Dynamic Programming & Recursion",
          chapters: [
            chapter("Recursion Tree & Backtracking (N-Queens)", "dsa-recursion-backtracking"),
            chapter("Introduction to DP: Memoization vs Tabulation", "dsa-dp-intro"),
            chapter("0/1 Knapsack & Unbounded Knapsack Patterns", "dsa-dp-knapsack"),
            chapter("Longest Common Subsequence (LCS) & String DP", "dsa-dp-lcs")
          ]
        }
      ]
    },
    {
      id: "college-languages",
      name: "Programming Languages (C, C++, Python, Java)",
      icon: "⚡",
      badge: "Syntax to Depth",
      description: "Low-level pointers, C++ STL, Python for developers, and Java OOP architecture.",
      subjects: [
        {
          name: "C & Modern C++",
          chapters: [
            chapter("C Pointers, Memory Allocation (malloc/free) & Structs", "lang-c-pointers"),
            chapter("C++ OOP: Classes, Encapsulation & Inheritance", "lang-cpp-oop"),
            chapter("C++ Standard Template Library (STL Mastery)", "lang-cpp-stl"),
            chapter("Pointers vs References & Smart Pointers (unique_ptr, shared_ptr)", "lang-cpp-smart-pointers")
          ]
        },
        {
          name: "Python for Developers",
          chapters: [
            chapter("Python Essentials: Data Structures, Comprehensions & Lambdas", "lang-python-core"),
            chapter("OOP in Python, Dunder Methods & Magic Functions", "lang-python-oop"),
            chapter("Iterators, Generators, Decorators & Context Managers", "lang-python-advanced"),
            chapter("NumPy & Pandas for Scientific Computing", "lang-python-datascience")
          ]
        },
        {
          name: "Java & Enterprise Concepts",
          chapters: [
            chapter("Java JVM Architecture, Bytecode & Garbage Collection", "lang-java-jvm"),
            chapter("Java Collections Framework (List, Set, Map, Queue)", "lang-java-collections"),
            chapter("Multithreading, Concurrency & Synchronization", "lang-java-multithreading"),
            chapter("Java 8+ Streams API, Lambdas & Optional", "lang-java-streams")
          ]
        }
      ]
    },
    {
      id: "college-webdev",
      name: "Full-Stack Web Development",
      icon: "🌐",
      badge: "Industry Ready",
      description: "Modern JavaScript, React.js frontend architecture, Node.js backend, and REST APIs.",
      subjects: [
        {
          name: "Frontend Fundamentals & Modern JS",
          chapters: [
            chapter("HTML5 Semantic Architecture & Responsive CSS3 Flex/Grid", "web-html-css"),
            chapter("JavaScript ES6+: Closures, Event Loop, Promises & Async/Await", "web-js-async"),
            chapter("DOM Manipulation, Web APIs & Browser Storage", "web-dom-apis")
          ]
        },
        {
          name: "React.js Engineering",
          chapters: [
            chapter("React Component Lifecycle, Props & Virtual DOM", "web-react-basics"),
            chapter("React Hooks: useState, useEffect, useRef & Custom Hooks", "web-react-hooks"),
            chapter("Global State Management (Context API & Redux Toolkit)", "web-react-state"),
            chapter("Routing, Code Splitting & Performance Optimization", "web-react-routing")
          ]
        },
        {
          name: "Backend with Node.js & Express",
          chapters: [
            chapter("Node.js Runtime, Event Loop & Non-Blocking I/O", "web-node-runtime"),
            chapter("Building RESTful APIs with Express.js & Middleware", "web-express-rest"),
            chapter("Authentication & Security (JWT, bcrypt, CORS & Sessions)", "web-auth-security")
          ]
        }
      ]
    },
    {
      id: "college-core-cs",
      name: "Core Computer Science (OS, DBMS, CN)",
      icon: "💻",
      badge: "Gate & Interviews",
      description: "The three foundational pillars of computer science engineering: Operating Systems, Database Systems, and Computer Networks.",
      subjects: [
        {
          name: "Operating Systems (OS)",
          chapters: [
            chapter("OS Kernel, System Calls & Process Lifecycle", "os-process-lifecycle"),
            chapter("CPU Scheduling Algorithms (FCFS, SJF, Round Robin)", "os-cpu-scheduling"),
            chapter("Process Synchronization, Critical Section & Semaphores", "os-process-sync"),
            chapter("Deadlocks: Detection, Prevention & Banker’s Algorithm", "os-deadlocks"),
            chapter("Memory Management: Paging, Segmentation & Virtual Memory", "os-virtual-memory")
          ]
        },
        {
          name: "Database Management Systems (DBMS)",
          chapters: [
            chapter("Relational Model, Keys & ER Diagrams", "dbms-er-model"),
            chapter("SQL Mastery: DDL, DML, Complex Joins & Subqueries", "dbms-sql-joins"),
            chapter("Database Normalization (1NF, 2NF, 3NF, BCNF)", "dbms-normalization"),
            chapter("Transactions, ACID Properties & Concurrency Control", "dbms-acid-transactions"),
            chapter("Indexing, B+ Trees & NoSQL Databases (MongoDB)", "dbms-indexing-nosql")
          ]
        },
        {
          name: "Computer Networks (CN)",
          chapters: [
            chapter("OSI 7-Layer Model vs TCP/IP Protocol Suite", "cn-osi-layers"),
            chapter("Network Layer: IP Addressing, CIDR, Subnetting & Routing", "cn-ip-subnetting"),
            chapter("Transport Layer: TCP 3-Way Handshake, Flow Control vs UDP", "cn-tcp-udp"),
            chapter("Application Layer: HTTP/1.1 vs HTTP/2/3, DNS, WebSocket & TLS", "cn-http-dns")
          ]
        }
      ]
    },
    {
      id: "college-ai-sysdesign",
      name: "System Design & AI / ML",
      icon: "🧠",
      badge: "High Level & Tech",
      description: "Scalable distributed system architecture, Git workflows, and Machine Learning foundations.",
      subjects: [
        {
          name: "Software Engineering & System Design",
          chapters: [
            chapter("High-Level Design (HLD): Client-Server, Microservices & Monolith", "sd-microservices"),
            chapter("Scalability: Load Balancing, Horizontal Scaling & CDN", "sd-scalability-caching"),
            chapter("Caching Strategies (Redis), Message Queues & DB Sharding", "sd-caching-queues"),
            chapter("Git Version Control, Branching Models & CI/CD Pipelines", "sd-git-cicd")
          ]
        },
        {
          name: "Artificial Intelligence & Machine Learning",
          chapters: [
            chapter("AI & ML Foundations: Supervised vs Unsupervised Learning", "ai-ml-foundations"),
            chapter("Linear Regression, Logistic Regression & Cost Functions", "ai-regression-cost"),
            chapter("Neural Networks, Backpropagation & Deep Learning Basics", "ai-neural-networks"),
            chapter("Generative AI, Transformers, LLMs & Prompt Engineering", "ai-genai-llms")
          ]
        }
      ]
    }
  ];

  /* =========================================================================
     COMPREHENSIVE COLLEGE CODING STUDY NOTES (Ready-to-study interactive notes)
     ========================================================================= */
  const codingNotes = {
    "dsa-two-pointers": {
      title: "Two-Pointers & Sliding Window Technique",
      track: "Data Structures & Algorithms",
      difficulty: "Medium",
      readTime: "8 min read",
      tags: ["DSA", "Arrays", "LeetCode", "Interviews"],
      overview: "The Two-Pointer technique optimizes brute-force $O(N^2)$ nested loops into blazing-fast $O(N)$ linear time by maintaining two reference points that move towards each other or in the same direction.",
      keyPrinciples: [
        "Opposite Ends: Useful when the array is sorted (e.g. Two Sum II, Valid Palindrome, Trapping Rain Water).",
        "Fast & Slow: One pointer moves faster than the other (e.g. Cycle detection in Linked List, removing duplicates in-place).",
        "Sliding Window (Expand & Shrink): Left and Right pointers define a dynamic window for subarray problems (e.g. Longest Substring Without Repeating Characters, Minimum Window Substring)."
      ],
      codeExample: {
        lang: "C++ / Python",
        snippet: `// C++: Two Sum in Sorted Array - O(N) Time, O(1) Space
bool hasTwoSum(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return true;
        else if (sum < target) left++;  // Need a bigger sum
        else right--;                  // Need a smaller sum
    }
    return false;
}

# Python: Sliding Window - Max Sum of Subarray of size K
def max_sub_array_of_size_k(k, arr):
    max_sum, window_sum = 0, 0
    window_start = 0
    for window_end in range(len(arr)):
        window_sum += arr[window_end] # Add the next element
        # Slide window if we've reached size k
        if window_end >= k - 1:
            max_sum = max(max_sum, window_sum)
            window_sum -= arr[window_start] # Subtract the element going out
            window_start += 1 # Slide the window ahead
    return max_sum`
      },
      complexity: [
        { metric: "Time Complexity", value: "O(N)", note: "Each element is processed at most twice" },
        { metric: "Space Complexity", value: "O(1)", note: "In-place pointers without extra allocation" }
      ],
      interviewQuestions: [
        {
          q: "When should you NOT use the Two-Pointer opposite-direction approach?",
          a: "When the array is unsorted and sorting it would destroy the required index mapping or cost more than using a Hash Map (O(N log N) vs O(N) Hash Map)."
        },
        {
          q: "What is the key condition for a dynamic sliding window?",
          a: "The problem must satisfy monotonicity: expanding the right pointer only increases/maintains the property, and shrinking the left pointer monotonically decreases it."
        }
      ]
    },

    "lang-cpp-stl": {
      title: "C++ Standard Template Library (STL Mastery)",
      track: "Programming Languages (C++)",
      difficulty: "Essential",
      readTime: "10 min read",
      tags: ["C++", "STL", "DSA", "Competitive Programming"],
      overview: "The Standard Template Library (STL) provides powerful, battle-tested algorithms, containers, and iterators in C++. Mastering STL is critical for technical coding rounds and competitive programming.",
      keyPrinciples: [
        "Sequential Containers: vector (dynamic array, amortized O(1) push_back), deque (double-ended queue), list (doubly linked list).",
        "Associative Containers: set / map (Self-balancing Red-Black Tree, O(log N) lookup/insert, elements are sorted).",
        "Unordered Containers: unordered_set / unordered_map (Hash Table implementation, average O(1) lookup, O(N) worst-case on hash collisions).",
        "Container Adapters: stack (LIFO), queue (FIFO), priority_queue (Max-Heap by default, Min-Heap using greater<T>)."
      ],
      codeExample: {
        lang: "C++",
        snippet: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <queue>
#include <algorithm>
using namespace std;

int main() {
    // 1. Vector & Modern Sorting
    vector<int> nums = {4, 1, 9, 3, 7};
    sort(nums.begin(), nums.end(), greater<int>()); // Descending: 9, 7, 4, 3, 1

    // 2. Unordered Map (Hash Map) - Average O(1)
    unordered_map<string, int> freq;
    freq["apple"] = 3;
    if (freq.find("apple") != freq.end()) {
        cout << "Apple count: " << freq["apple"] << "\\n";
    }

    // 3. Min-Heap (Priority Queue)
    priority_queue<int, vector<int>, greater<int>> minHeap;
    minHeap.push(10); minHeap.push(2); minHeap.push(8);
    cout << "Smallest element: " << minHeap.top() << "\\n"; // Outputs 2

    // 4. Binary Search in O(log N)
    sort(nums.begin(), nums.end()); // Must be sorted first
    bool exists = binary_search(nums.begin(), nums.end(), 7);
    cout << "7 exists? " << (exists ? "Yes" : "No") << "\\n";
    return 0;
}`
      },
      complexity: [
        { metric: "vector push_back", value: "O(1) amortized", note: "Doubles capacity when full" },
        { metric: "map / set insert & find", value: "O(log N)", note: "Red-Black Tree balanced height" },
        { metric: "unordered_map find", value: "O(1) average", note: "O(N) in rare adversarial collisions" }
      ],
      interviewQuestions: [
        {
          q: "What is the difference between map and unordered_map in C++?",
          a: "std::map is implemented using Red-Black Trees (Self-balancing BST), keeps keys strictly sorted, and guarantees O(log N) for search/insert. std::unordered_map is backed by a Hash Table, does not preserve order, and offers O(1) average time."
        },
        {
          q: "How does priority_queue implement a Min-Heap instead of the default Max-Heap?",
          a: "Pass greater<T> comparator: priority_queue<int, vector<int>, greater<int>> pq;"
        }
      ]
    },

    "web-react-hooks": {
      title: "React.js Hooks: useState, useEffect & Custom Hooks",
      track: "Full-Stack Web Development",
      difficulty: "Intermediate",
      readTime: "9 min read",
      tags: ["Frontend", "React", "JavaScript", "Web Dev"],
      overview: "React Hooks allow functional components to maintain state, handle side effects, and share reusable stateful logic without needing legacy ES6 class components.",
      keyPrinciples: [
        "useState: Declares reactive component state. Calling setState triggers a re-render with the new value.",
        "useEffect: Manages side effects (API calls, subscriptions, DOM mutations). The dependency array controls when it runs: [] runs once on mount, [dep] runs when dep changes, omitted runs on every render.",
        "useRef: Retains mutable values across renders WITHOUT triggering re-renders, and provides direct references to DOM nodes.",
        "useMemo & useCallback: Cache expensive calculation results (useMemo) and function definitions (useCallback) to avoid unneeded re-renders."
      ],
      codeExample: {
        lang: "JavaScript (React)",
        snippet: `import React, { useState, useEffect, useRef } from 'react';

// Custom Hook for Debounced Input Search
function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler); // Cleanup on rapid typing
    }, [value, delay]);
    return debouncedValue;
}

export function CodeSearchComponent() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const debouncedQuery = useDebounce(query, 400);
    const searchInputRef = useRef(null);

    // Focus input automatically on mount
    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    // Perform API fetch when debouncedQuery changes
    useEffect(() => {
        if (!debouncedQuery.trim()) { setResults([]); return; }
        let isCurrent = true;
        fetch(\`/api/notes?q=\${encodeURIComponent(debouncedQuery)}\`)
            .then(res => res.json())
            .then(data => { if (isCurrent) setResults(data); });
        return () => { isCurrent = false; }; // Prevent race conditions
    }, [debouncedQuery]);

    return (
        <div className="search-box">
            <input ref={searchInputRef} value={query} 
                   onChange={e => setQuery(e.target.value)} 
                   placeholder="Search coding notes..." />
            <ul>{results.map(r => <li key={r.id}>{r.title}</li>)}</ul>
        </div>
    );
}`
      },
      complexity: [
        { metric: "Virtual DOM Diffing", value: "O(N)", note: "React Heuristic Reconciliation Algorithm" },
        { metric: "Cleanup Execution", value: "Before next effect & Unmount", note: "Guarantees no memory leaks" }
      ],
      interviewQuestions: [
        {
          q: "Why can't you call Hooks inside loops, conditions, or nested functions?",
          a: "React relies on the strict call order of hooks on every render to associate state with the component. Calling hooks conditionally breaks the internal linked list of hooks."
        },
        {
          q: "What is the difference between useEffect and useLayoutEffect?",
          a: "useEffect runs asynchronously after the browser paints the screen. useLayoutEffect runs synchronously immediately after DOM mutations, before paint (used to measure DOM or prevent layout flickering)."
        }
      ]
    },

    "dbms-normalization": {
      title: "Database Normalization (1NF, 2NF, 3NF & BCNF)",
      track: "Database Management Systems (DBMS)",
      difficulty: "Core Theory",
      readTime: "9 min read",
      tags: ["DBMS", "SQL", "Database", "College Core"],
      overview: "Normalization is the systematic process of organizing tables to minimize data redundancy and prevent Insertion, Deletion, and Update anomalies.",
      keyPrinciples: [
        "1NF (First Normal Form): Eliminate repeating groups; ensure all column values are atomic (indivisible) and each record has a unique primary key.",
        "2NF (Second Normal Form): Table is in 1NF AND contains NO Partial Dependency (no non-prime attribute should depend on a subset of a composite candidate key).",
        "3NF (Third Normal Form): Table is in 2NF AND contains NO Transitive Dependency (non-prime attributes must not depend on other non-prime attributes: X -> Y where neither is key).",
        "BCNF (Boyce-Codd Normal Form): Stricter version of 3NF. For every non-trivial functional dependency X -> Y, X MUST be a superkey."
      ],
      codeExample: {
        lang: "SQL Schema",
        snippet: `-- Denormalized table with anomalies (Violates 2NF and 3NF)
-- StudentCourse(student_id, course_id, student_name, teacher_id, teacher_name)

-- Normalized into 3NF / BCNF:
CREATE TABLE Students (
    student_id INT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL
);

CREATE TABLE Teachers (
    teacher_id INT PRIMARY KEY,
    teacher_name VARCHAR(100) NOT NULL,
    department VARCHAR(50)
);

CREATE TABLE Courses (
    course_id VARCHAR(20) PRIMARY KEY,
    course_name VARCHAR(150) NOT NULL,
    teacher_id INT,
    FOREIGN KEY (teacher_id) REFERENCES Teachers(teacher_id)
);

CREATE TABLE Enrollments (
    student_id INT,
    course_id VARCHAR(20),
    enrolled_date DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);`
      },
      complexity: [
        { metric: "Normal Forms Tradeoff", value: "Redundancy vs Joins", note: "Higher normal forms reduce duplicates but require more JOIN operations" }
      ],
      interviewQuestions: [
        {
          q: "What is a Transitive Dependency?",
          a: "When a non-prime attribute depends on another non-prime attribute rather than directly on the candidate key (A -> B and B -> C, where A is PK and B, C are regular columns)."
        },
        {
          q: "When is Denormalization intentionally preferred in production?",
          a: "In Read-heavy analytical OLAP data warehouses and reporting systems, denormalization is used to avoid expensive multi-table JOINs and improve query read throughput."
        }
      ]
    },

    "os-cpu-scheduling": {
      title: "CPU Scheduling Algorithms & Process Lifecycle",
      track: "Operating Systems (OS)",
      difficulty: "Medium",
      readTime: "8 min read",
      tags: ["OS", "College CS", "GATE", "System Calls"],
      overview: "The CPU scheduler determines which ready process is allocated the CPU core. Scheduling aims to maximize CPU utilization, maximize throughput, and minimize turnaround, waiting, and response times.",
      keyPrinciples: [
        "FCFS (First-Come, First-Served): Non-preemptive, simple, suffers from the Convoy Effect (short jobs wait behind a massive CPU burst job).",
        "SJF (Shortest Job First): Provably optimal average waiting time. Preemptive version is Shortest Remaining Time First (SRTF).",
        "Round Robin (RR): Preemptive scheduling with a fixed time slice (Time Quantum). Well-suited for time-sharing systems.",
        "Priority Scheduling: Each process has a priority; starvation can occur for low-priority processes (solved using Aging)."
      ],
      codeExample: {
        lang: "Algorithm Logic & Metrics",
        snippet: `/* Key Formulas for OS Numerical Problems:
   Turnaround Time (TAT) = Completion Time (CT) - Arrival Time (AT)
   Waiting Time (WT)    = Turnaround Time (TAT) - Burst Time (BT)
   Response Time (RT)   = First CPU Time - Arrival Time (AT) */

// Example: 3 Processes with Round Robin (Time Quantum = 2)
// P1: AT=0, BT=5
// P2: AT=1, BT=3
// P3: AT=2, BT=1

// Gantt Chart:
// [0--P1--2] [2--P2--4] [4--P3--5] [5--P1--7] [7--P2--8] [8--P1--9]
// Completion Times: P3 = 5, P2 = 8, P1 = 9
// TAT:
// P1: 9 - 0 = 9
// P2: 8 - 1 = 7
// P3: 5 - 2 = 3
// Average TAT = (9 + 7 + 3) / 3 = 6.33`
      },
      complexity: [
        { metric: "Time Quantum Too Large", value: "Degenerates to FCFS", note: "Response time suffers" },
        { metric: "Time Quantum Too Small", value: "High Context Switch Overhead", note: "CPU spends too much time saving/restoring registers" }
      ],
      interviewQuestions: [
        {
          q: "What is the Convoy Effect in CPU Scheduling?",
          a: "In FCFS, when one large CPU-intensive process executes, several I/O-bound processes wait idly in the ready queue, leading to poor CPU and device utilization."
        },
        {
          q: "How does 'Aging' solve starvation in priority scheduling?",
          a: "Aging gradually increases the priority of processes that wait in the ready queue for a long time, guaranteeing that even low-priority processes will eventually execute."
        }
      ]
    },

    "cn-tcp-udp": {
      title: "Transport Layer: TCP vs UDP & 3-Way Handshake",
      track: "Computer Networks (CN)",
      difficulty: "Essential",
      readTime: "8 min read",
      tags: ["Networks", "Protocols", "TCP/IP", "Web"],
      overview: "The Transport Layer provides logical communication between process applications on different hosts. TCP guarantees reliable, ordered stream delivery, whereas UDP prioritizes minimal latency and fast datagram transmission.",
      keyPrinciples: [
        "TCP (Transmission Control Protocol): Connection-oriented, reliable (ACKs + Retransmission), ordered, flow controlled (Sliding Window), congestion controlled.",
        "UDP (User Datagram Protocol): Connectionless, unreliable (fire-and-forget), packet-oriented, zero connection establishment overhead.",
        "TCP 3-Way Handshake: SYN -> SYN-ACK -> ACK establishes sequence numbers and socket connection state.",
        "TCP 4-Way Teardown: FIN -> ACK -> FIN -> ACK safely terminates connection with TIME_WAIT state."
      ],
      codeExample: {
        lang: "Network Sequence & Socket Comparison",
        snippet: `/* TCP 3-Way Handshake:
   Client                     Server
     | ------ SYN (seq=x) ------> |  Client sends SYN
     | <--- SYN-ACK (seq=y,ack=x+1) | Server acknowledges & sends SYN
     | ------ ACK (ack=y+1) ----> |  Client acknowledges -> ESTABLISHED */

// Python TCP Server
import socket
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM) # SOCK_STREAM = TCP
server.bind(('0.0.0.0', 8080))
server.listen(5)
conn, addr = server.accept() # Blocks until 3-way handshake completes

// Python UDP Socket (No listen, no accept)
udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # SOCK_DGRAM = UDP
udp_sock.sendto(b"Quick telemetry", ('192.168.1.10', 9999))`
      },
      complexity: [
        { metric: "TCP Header Size", value: "20 to 60 Bytes", note: "Contains sequence, ack, flags, window size" },
        { metric: "UDP Header Size", value: "8 Bytes fixed", note: "Source port, dest port, length, checksum" }
      ],
      interviewQuestions: [
        {
          q: "Why does DNS use UDP for queries but TCP for Zone Transfers?",
          a: "DNS queries are small (< 512 bytes) and benefit from UDP's speed without 3-way handshake delay. Zone transfers involve large bulk data synchronization where TCP's reliability and ordering are essential."
        },
        {
          q: "Why is the TIME_WAIT state necessary in TCP connection termination?",
          a: "It ensures the final ACK is reliably delivered to the remote host (otherwise retransmitted FINs would fail) and prevents duplicate delayed packets from an old connection interfering with a new connection."
        }
      ]
    }
  };

  window.V2_CURRICULUM = Object.freeze({
    classes,
    collegeTracks,
    codingNotes
  });
})();
