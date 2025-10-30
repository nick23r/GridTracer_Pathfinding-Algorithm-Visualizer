# Pathfinding Algorithm Visualizer

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
    * **Path Optimality**
    * **Time Complexity**
    * **Open Set Structure** (Data structure used)
* **Save & Load:** Connects to Firebase Realtime Database to save and load your grid configurations by name.

## 🛠️ How to Use

1.  **Select an Algorithm:** Choose **A\***, **BFS**, or **DFS** from the dropdown menu.
2.  **Set Points:**
    * **Right-click** on a cell to place the **Start** point.
    * **Ctrl + Click** on a cell to place the **Goal** point.
3.  **Draw Obstacles:** **Left-click** and drag to draw (or erase) obstacles (walls).
4.  **Find the Path:**
    * Click **"Find Path"** to see the result instantly.
    * Click **"Animate Search"** to watch the algorithm work. Use the speed slider to adjust the pace.
5.  **Save Your Layout (Optional):**
    * Enter a name in the "Config Name" field.
    * Click **"Save Config"** to save the current grid layout (walls, start, goal) to Firebase.
    * Click **"Load Config"** to retrieve a previously saved layout.

## 💻 Technology Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Graphics:** HTML5 Canvas
* **Database:** Firebase Realtime Database (v9 Compat Mode)
* **Deployment:** Open `index.html` in any modern browser—no installation required

## 📋 Getting Started

Simply open the `index.html` file in your web browser. The application runs entirely client-side and works offline.

**Optional Firebase Integration:**
To enable cloud-based save/load functionality, configure Firebase in `app.js` with your project credentials. Update the database rules to allow read/write access to the `pathfinding-configs` node.

## 🎮 Grid Legend

| Symbol | Meaning |
|--------|---------|
| White | Empty Cell |
| Black | Obstacle/Wall |
| Green | Start Point |
| Red | Goal Point |
| Light Blue | Open Set (Exploring) |
| Light Yellow | Closed Set (Explored) |
| Purple | Final Path |

## 🧠 Algorithm Comparison

| Algorithm | Best For | Optimal Path | Data Structure |
|-----------|----------|--------------|-----------------|
| **A\*** | Efficient pathfinding with heuristics | ✅ Yes | Priority Queue |
| **BFS** | Shortest path in unweighted graphs | ✅ Yes | Queue (FIFO) |
| **DFS** | Memory-efficient exploration | ❌ No | Stack (LIFO) |

## 📊 Performance Tracking

The visualizer displays real-time statistics:
* **Nodes Visited:** Total cells explored during the search
* **Path Length:** Number of cells in the final path
* **Time Taken:** Execution time in milliseconds

---

**Version:** 1.0 | **Status:** Fully Functional ✅
