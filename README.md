# GridTracer (Pathfinding Algorithm Visualizer)

A web-based tool to visualize various pathfinding algorithms like A* Search, Breadth-First Search (BFS), and Depth-First Search (DFS) on a customizable grid. This project provides an interactive way to understand how different search algorithms explore a grid to find the shortest path.

## 🚀 Features

* **Algorithm Visualization:** Watch A* Search, BFS, and DFS in real-time.
* **Interactive Grid:**
    * **Draw Obstacles:** Left-click to add or remove obstacles (walls).
    * **Set Start Point:** Right-click to place the **Start** node (green).
    * **Set Goal Point:** Ctrl+Click to place the **Goal** node (red).
* **Controls & Customization:**
    * **Find Path:** Instantly solve the maze and display the final path.
    * **Animate Search:** Watch the algorithm explore the grid step-by-step.
    * **Adjust Speed:** Control the animation speed with a slider.
    * **Generate Obstacles:** Randomly fill the grid with obstacles.
    * **Clear Grid:** Reset the grid, clearing all obstacles, start, and goal points.
    * **Resize Grid:** Set custom width and height for the grid.
* **Algorithm Insights:** A dynamic panel shows the properties of the selected algorithm, including:
    * Path Optimality
    * Time Complexity
    * Open Set Structure (Data structure used)
* **Performance Tracking:** See real-time stats for the *visualized run*, including Nodes Visited, Path Length, and Time Taken.
* **Automatic Benchmarking:**
    * After finding a path, an **Algorithm Comparison** panel automatically appears.
    * This panel benchmarks **all three algorithms** (A*, BFS, DFS) on the current grid.
    * It runs each algorithm **100 times** to calculate a stable **average execution time**, providing a true speed comparison.
    * A detailed note explains *why* the average time (from 100 "warm" runs) differs from the single "cold" run time.
* **Save & Load:** Connects to Firebase Realtime Database to save and load your grid configurations by name.

## 🛠️ How to Use

1.  **Select an Algorithm:** Choose **A\***, **BFS**, or **DFS** from the dropdown menu.
2.  **Set Points:**
    * **Right-click** on a cell to place the **Start** point.
    * **Ctrl + Click** on a cell to place the **Goal** point.
3.  **Draw Obstacles:** **Left-click** (and drag) to draw or erase obstacles (walls).
4.  **Find the Path:**
    * Click **"Find Path"** or **"Animate Search"**.
    * After the path is found, scroll down to see the **Algorithm Comparison** panel with detailed benchmarks for all three algorithms.
5.  **Save Your Layout (Optional):**
    * Enter a name in the "Config Name" field.
    * Click **"Save to Firebase"** to save the current grid layout.
    * Click **"Load from Firebase"** to retrieve a previously saved layout.

## 💻 Technology Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Graphics:** HTML5 Canvas
* **Database:** Firebase Realtime Database (v9 Compat Mode)
* **Deployment:** Open `index.html` in any modern browser—no installation required.

## 📋 Getting Started

Simply open the `index.html` file in your web browser. The application runs entirely client-side.

**Optional Firebase Integration:**
To enable cloud-based save/load functionality, you must configure Firebase in `app.js`.
1.  Create a Firebase project and a Realtime Database.
2.  Copy your project's `firebaseConfig` object into the top of `app.js`.
3.  Set your database rules to allow read/write access (e.g., for `pathfinding-configs`).

## 🎮 Grid Legend

| Symbol | Meaning |
| :--- | :--- |
| White | Empty Cell |
| Black | Obstacle/Wall |
| Green | Start Point |
| Red | Goal Point |
| Light Blue | Open Set (Evaluating) |
| Light Yellow | Closed Set (Evaluated) |
| Purple | Final Path |

## 🧠 Algorithm Comparison (General)

This table shows the general properties of the algorithms.

| Algorithm | Best For | Optimal Path | Data Structure |
| :--- | :--- | :--- | :--- |
| **A\*** | Efficient pathfinding with heuristics | ✅ Yes | Priority Queue |
| **BFS** | Shortest path in unweighted graphs | ✅ Yes | Queue (FIFO) |
| **DFS** | Memory-efficient exploration | ❌ No | Stack (LIFO) |

## 📊 Performance Stats Explained

The app shows two different time measurements:

1.  **Top Info Panel (Time Taken):** This measures the **single run** that was just visualized. This is often a "cold" run, meaning it can be slower because the JavaScript engine is compiling and optimizing the code for the first time.

2.  **Algorithm Comparison Panel (Time Taken):** This table shows a much more accurate benchmark. It measures the **average time over 100 "warm" runs**. By averaging 100 executions, it smooths out "system noise" and measures the algorithm's true speed *after* the JavaScript engine has optimized it.

---

**Version:** 1.1 (Includes Benchmarking Panel) | **Status:** Fully Functional ✅
