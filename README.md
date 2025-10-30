# Pathfinding Algorithm Visualizer

A web-based tool to visualize various pathfinding algorithms like A* Search, Breadth-First Search (BFS), and Depth-First Search (DFS) on a customizable grid. This project provides an interactive way to understand how different search algorithms explore a grid to find the shortest path.

![Demo GIF](demo.gif)
*(You should replace this line with a screenshot or a GIF of your visualizer in action!)*

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

## 🔧 Running Locally & Firebase Setup

You can run this project by simply opening the `index.html` file in your browser.

**To enable the Save/Load feature, you must configure Firebase:**

The project code includes a `firebaseConfig` object, but it will not work unless you set up the database rules in your own Firebase project.

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Add a Web App:** Add a new Web App to your project and copy the `firebaseConfig` object.
3.  **Update `app.js`:** Paste your `firebaseConfig` object at the top of `app.js`, replacing the existing one.
4.  **Set Database Rules:**
    * In your Firebase project, go to **Build** > **Realtime Database**.
    * Click the **Rules** tab.
    * To allow your app to save and load configurations, you *must* update the rules. For testing, you can use the following (this is insecure and not for production):

    ```json
    {
      "rules": {
        "pathfinding-configs": {
          ".read": true,
          ".write": true
        }
      }
    }
    ```
5.  **Publish** the rules. The "Save Config" and "Load Config" buttons will now work.
