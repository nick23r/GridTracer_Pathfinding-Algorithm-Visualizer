// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiqSITxorEYF4Vky9zTvXOgZPIQR6A61o",
  authDomain: "chess-ai-89c5b.firebaseapp.com",
  databaseURL: "https://chess-ai-89c5b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chess-ai-89c5b",
  storageBucket: "chess-ai-89c5b.firebasestorage.app",
  messagingSenderId: "266653660921",
  appId: "1:266653660921:web:4ee0d5114dc3bdfb3ed428",
  measurementId: "G-MRF4NFPTZH"
};

// Initialize Firebase (comment out if you don't have credentials yet)
let database = null;
try {
  // Uses v8 compat syntax which works with the scripts in index.html
  firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.warn('Firebase not configured. Save/Load features will be disabled.', error);
}

// Grid Configuration
const CELL_SIZE = 25;
const COLORS = {
  EMPTY: '#f0f0f0',
  OBSTACLE: '#000000',
  START: '#00ff00',
  GOAL: '#ff0000',
  OPEN_SET: '#add8e6',
  CLOSED_SET: '#ffffe0',
  PATH: '#800080',
  GRID_LINE: '#cccccc'
};

// Cell Types
const CELL_TYPE = {
  EMPTY: 0,
  OBSTACLE: 1,
  START: 2,
  GOAL: 3
};

// Grid State
let gridWidth = 30;
let gridHeight = 20;
let grid = [];
let startCell = null;
let goalCell = null;
let currentAlgorithm = 'A_STAR'; // Default algorithm

// Canvas
let canvas = document.getElementById('gridCanvas');
let ctx = canvas.getContext('2d');

// Algorithm State
let isAnimating = false;
let animationSpeed = 1.0;

// Initialize Grid
function initGrid() {
  grid = [];
  for (let y = 0; y < gridHeight; y++) {
    grid[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      grid[y][x] = {
        x: x,
        y: y,
        type: CELL_TYPE.EMPTY,
        g: 0,
        h: 0,
        f: 0,
        parent: null,
        status: null, // 'open' or 'closed'
        isPath: false
      };
    }
  }
  startCell = null;
  goalCell = null;
  
  // Update canvas size
  canvas.width = gridWidth * CELL_SIZE;
  canvas.height = gridHeight * CELL_SIZE;
  
  drawGrid();
  updateStatus('Ready');
  resetStats();
  updateAlgorithmLabel(); // Initial label update
}

// Draw Grid
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw cells
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cell = grid[y][x];
      let color = COLORS.EMPTY;
      
      // Check type first
      if (cell.type === CELL_TYPE.OBSTACLE) {
        color = COLORS.OBSTACLE;
      } else if (cell.type === CELL_TYPE.START) {
        color = COLORS.START;
      } else if (cell.type === CELL_TYPE.GOAL) {
        color = COLORS.GOAL;
      } 
      // Then check A* visual state (fast O(1) checks)
      else if (cell.isPath) {
        color = COLORS.PATH;
      } else if (cell.status === 'closed') {
        color = COLORS.CLOSED_SET;
      } else if (cell.status === 'open') {
        color = COLORS.OPEN_SET;
      }
      
      ctx.fillStyle = color;
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
  
  // Draw grid lines
  ctx.strokeStyle = COLORS.GRID_LINE;
  ctx.lineWidth = 1;
  
  for (let x = 0; x <= gridWidth; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL_SIZE, 0);
    ctx.lineTo(x * CELL_SIZE, canvas.height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= gridHeight; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL_SIZE);
    ctx.lineTo(canvas.width, y * CELL_SIZE);
    ctx.stroke();
  }
}

// Get cell from mouse position
function getCellFromMouse(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  
  const x = Math.floor(mouseX / CELL_SIZE);
  const y = Math.floor(mouseY / CELL_SIZE);
  
  if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
    return { x, y };
  }
  return null;
}

// Mouse Event Handlers
canvas.addEventListener('click', (e) => {
  if (isAnimating) return;
  
  const cellPos = getCellFromMouse(e);
  if (!cellPos) return;
  
  const cell = grid[cellPos.y][cellPos.x];

  if (e.ctrlKey) {
    // Set goal
    if (goalCell) {
      grid[goalCell.y][goalCell.x].type = CELL_TYPE.EMPTY;
    }
    goalCell = cellPos;
    cell.type = CELL_TYPE.GOAL;
  } else {
    // Toggle obstacle
    if (cell.type === CELL_TYPE.START || cell.type === CELL_TYPE.GOAL) {
      return;
    }
    
    if (cell.type === CELL_TYPE.OBSTACLE) {
      cell.type = CELL_TYPE.EMPTY;
    } else {
      cell.type = CELL_TYPE.OBSTACLE;
    }
  }
  
  clearVisuals(); // Clear path/visited state if grid changes
  drawGrid();
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (isAnimating) return;
  
  const cellPos = getCellFromMouse(e);
  if (!cellPos) return;
  
  // Set start
  if (startCell) {
    grid[startCell.y][startCell.x].type = CELL_TYPE.EMPTY;
  }
  startCell = cellPos;
  grid[cellPos.y][cellPos.x].type = CELL_TYPE.START;
  
  clearVisuals(); // Clear path/visited state if grid changes
  drawGrid();
});

// Manhattan Distance Heuristic
function manhattanDistance(cell1, cell2) {
  return Math.abs(cell1.x - cell2.x) + Math.abs(cell1.y - cell2.y);
}

// Get Neighbors (4-directional)
function getNeighbors(cell) {
  const neighbors = [];
  const directions = [
    { x: 0, y: -1 }, // Up
    { x: 1, y: 0 },  // Right
    { x: 0, y: 1 },  // Down
    { x: -1, y: 0 }  // Left
  ];
  
  for (const dir of directions) {
    const newX = cell.x + dir.x;
    const newY = cell.y + dir.y;
    
    if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight) {
      const neighbor = grid[newY][newX];
      if (neighbor.type !== CELL_TYPE.OBSTACLE) {
        neighbors.push(neighbor);
      }
    }
  }
  
  return neighbors;
}

// Universal Search Algorithm (A*, BFS, DFS)
function searchAlgorithm() {
  if (!startCell || !goalCell) {
    updateStatus('Please set start and goal points');
    return null;
  }
  
  const startTime = performance.now();
  
  // Reset grid state for a fresh search
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cell = grid[y][x];
      cell.g = Infinity;
      cell.h = 0;
      cell.f = Infinity;
      cell.parent = null;
      cell.status = null;
      cell.isPath = false;
    }
  }
  
  const start = grid[startCell.y][startCell.x];
  const goal = grid[goalCell.y][goalCell.x];
  
  // Initialization for all algorithms
  start.g = 0;
  start.h = manhattanDistance(start, goal);
  start.f = start.h;
  
  const openSet = [start];
  const closedSet = new Set();
  const visitedOrder = []; 
  
  start.status = 'open';
  
  while (openSet.length > 0) {
    let current;
    let currentIndex;

    // 1. SELECT CURRENT NODE based on algorithm
    switch (currentAlgorithm) {
      case 'A_STAR':
        // A*: Find cell with lowest f score (Priority Queue behavior)
        currentIndex = 0;
        for (let i = 1; i < openSet.length; i++) {
          if (openSet[i].f < openSet[currentIndex].f) {
            currentIndex = i;
          }
        }
        current = openSet[currentIndex];
        break;
      case 'BFS':
        // BFS: First-In, First-Out (Queue behavior)
        current = openSet.shift(); // Remove from front
        break;
      case 'DFS':
        // DFS: Last-In, First-Out (Stack behavior)
        current = openSet.pop(); // Remove from end
        break;
    }

    // Goal reached
    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let temp = current;
      while (temp) {
        path.unshift(temp);
        temp.isPath = true; 
        temp = temp.parent;
      }
      
      const endTime = performance.now();
      return {
        path: path,
        visitedOrder: visitedOrder,
        timeTaken: endTime - startTime,
        nodesVisited: visitedOrder.length
      };
    }
    
    // 2. Move current from open to closed
    // Note: A_STAR already removed the node via splice above. BFS/DFS must remove now if they didn't.
    if (currentAlgorithm === 'A_STAR') {
      openSet.splice(currentIndex, 1);
    } 

    closedSet.add(`${current.x},${current.y}`);
    current.status = 'closed';
    visitedOrder.push({ x: current.x, y: current.y, status: 'closed' });
    
    // 3. Check neighbors
    const neighbors = getNeighbors(current);
    for (const neighbor of neighbors) {
      if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
        continue;
      }
      
      // BFS/DFS specific logic (simpler, no g/h/f needed, just find the path)
      if (currentAlgorithm === 'BFS' || currentAlgorithm === 'DFS') {
          if (openSet.includes(neighbor)) {
              continue;
          }
          neighbor.parent = current;
          neighbor.status = 'open';
          
          openSet.push(neighbor); // Pushes to back for both BFS (FIFO) and DFS (LIFO .pop() will get it)

          visitedOrder.push({ x: neighbor.x, y: neighbor.y, status: 'open' });
          
          // For BFS/DFS, path can be found immediately upon adding goal to open set
          if (neighbor.x === goal.x && neighbor.y === goal.y) {
             const path = [];
             let temp = neighbor;
             while (temp) {
                 path.unshift(temp);
                 temp.isPath = true; 
                 temp = temp.parent;
             }
             const endTime = performance.now();
             return { path: path, visitedOrder: visitedOrder, timeTaken: endTime - startTime, nodesVisited: visitedOrder.length };
          }
          continue; // Move to next neighbor for BFS/DFS
      }


      // A* specific logic (g/h/f calculation)
      const tentativeG = current.g + 1;
      
      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
        neighbor.status = 'open';
        visitedOrder.push({ x: neighbor.x, y: neighbor.y, status: 'open' });
      } else if (tentativeG >= neighbor.g) {
        continue;
      }
      
      neighbor.parent = current;
      neighbor.g = tentativeG;
      neighbor.h = manhattanDistance(neighbor, goal);
      neighbor.f = neighbor.g + neighbor.h;
    }
  }
  
  const endTime = performance.now();
  return {
    path: null,
    visitedOrder: visitedOrder,
    timeTaken: endTime - startTime,
    nodesVisited: visitedOrder.length
  };
}

// Find Path (Instant)
function findPath() {
  if (isAnimating) return;
  
  updateStatus('Searching...');
  clearVisuals();

  // Run searchAlgorithm - this function now modifies the grid directly
  const result = searchAlgorithm();
  
  if (result) {
    if (result.path) {
      updateStatus('Path found!');
      updateStats(result.nodesVisited, result.path.length, result.timeTaken);
    } else {
      updateStatus('No path found');
      updateStats(result.nodesVisited, 0, result.timeTaken);
    }
    
    // Just draw the grid, all states are set
    drawGrid();
  }
}

// Animate Search
async function animateSearch() {
  if (isAnimating) return;
  
  isAnimating = true;
  updateStatus('Animating search...');
  resetStats();
  
  // 1. Run the search to get the results, but clear visuals first
  clearVisuals();
  const result = searchAlgorithm();
  
  // 2. Clear visuals again to start animation from a clean slate
  clearVisuals();
  drawGrid();
  
  if (result) {
    // 3. Animate visited cells
    for (let i = 0; i < result.visitedOrder.length; i++) {
      const node = result.visitedOrder[i];
      // Set the visual state on the actual grid object
      grid[node.y][node.x].status = node.status; 
      drawGrid();
      await sleep(50 / animationSpeed);
    }
    
    // 4. Animate path
    if (result.path) {
      for (let i = 0; i < result.path.length; i++) {
        const node = result.path[i];
        // Set the path flag on the actual grid object
        grid[node.y][node.x].isPath = true; 
        drawGrid();
        await sleep(100 / animationSpeed);
      }
      updateStatus('Path found!');
      updateStats(result.nodesVisited, result.path.length, result.timeTaken);
    } else {
      updateStatus('No path found');
      updateStats(result.nodesVisited, 0, result.timeTaken);
    }
  }
  
  isAnimating = false;
}

// Helper: Sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: Clear visual state (status and path) from grid
function clearVisuals() {
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      grid[y][x].status = null;
      grid[y][x].isPath = false;
      grid[y][x].parent = null;
    }
  }
}

// Generate Random Obstacles
function generateRandomObstacles() {
  if (isAnimating) return;
  
  clearGrid();
  
  const obstacleCount = Math.floor((gridWidth * gridHeight) * 0.3);
  
  for (let i = 0; i < obstacleCount; i++) {
    const x = Math.floor(Math.random() * gridWidth);
    const y = Math.floor(Math.random() * gridHeight);
    
    const cell = grid[y][x];
    if (cell.type === CELL_TYPE.EMPTY) {
      cell.type = CELL_TYPE.OBSTACLE;
    }
  }
  
  drawGrid();
  updateStatus('Random obstacles generated');
}

// Clear Grid
function clearGrid() {
  if (isAnimating) return;
  
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cell = grid[y][x];
      cell.type = CELL_TYPE.EMPTY;
      cell.status = null;
      cell.isPath = false;
      cell.parent = null;
    }
  }
  
  startCell = null;
  goalCell = null;
  
  drawGrid();
  updateStatus('Grid cleared');
  resetStats();
}

// Apply Grid Size
function applyGridSize() {
  if (isAnimating) return;
  
  const widthInput = document.getElementById('gridWidth').value;
  const heightInput = document.getElementById('gridHeight').value;
  
  gridWidth = Math.max(10, Math.min(50, parseInt(widthInput) || 30));
  gridHeight = Math.max(10, Math.min(40, parseInt(heightInput) || 20));
  
  document.getElementById('gridWidth').value = gridWidth;
  document.getElementById('gridHeight').value = gridHeight;
  
  initGrid();
  updateStatus('Grid size updated');
}

// Update UI
function updateStatus(status) {
  document.getElementById('statusText').textContent = status;
}

function updateStats(nodesVisited, pathLength, timeTaken) {
  document.getElementById('nodesVisited').textContent = nodesVisited;
  document.getElementById('pathLength').textContent = pathLength;
  document.getElementById('timeTaken').textContent = `${timeTaken.toFixed(2)}ms`;
}

function resetStats() {
  updateStats(0, 0, 0);
}

// Updates the algorithm label and the new complexity details
function updateAlgorithmLabel() {
    let label = '';
    switch (currentAlgorithm) {
        case 'A_STAR':
            label = 'A* Search (Best-First)';
            break;
        case 'BFS':
            label = 'BFS (Queue)';
            break;
        case 'DFS':
            label = 'DFS (Stack)';
            break;
    }
    document.getElementById('heuristicType').textContent = label;
    updateAlgorithmDetails(); // Call the new detail function
}

// NEW FUNCTION: Updates the Optimality, Complexity, and Structure fields
function updateAlgorithmDetails() {
    const optimalityEl = document.getElementById('optimality');
    const complexityEl = document.getElementById('timeComplexity');
    const structureEl = document.getElementById('openSetStructure');
    
    // Reset styling
    optimalityEl.classList.remove('detail-value--optimal', 'detail-value--non-optimal');

    switch (currentAlgorithm) {
        case 'A_STAR':
            optimalityEl.textContent = 'Optimal (Guarantees Shortest Path)';
            optimalityEl.classList.add('detail-value--optimal');
            complexityEl.textContent = 'O(b^d) in practice';
            structureEl.textContent = 'Priority Queue';
            break;
        case 'BFS':
            optimalityEl.textContent = 'Optimal (Guarantees Shortest Path)';
            optimalityEl.classList.add('detail-value--optimal');
            complexityEl.textContent = 'O(b^d)';
            structureEl.textContent = 'Queue (FIFO)';
            break;
        case 'DFS':
            optimalityEl.textContent = 'Non-Optimal (Finds a path quickly)';
            optimalityEl.classList.add('detail-value--non-optimal');
            complexityEl.textContent = 'O(b^d)';
            structureEl.textContent = 'Stack (LIFO)';
            break;
    }
}


// Firebase Functions
function saveToFirebase() {
  if (!database) {
    showFirebaseStatus('Firebase not configured. Please add your Firebase credentials in app.js', 'error');
    return;
  }
  
  const configName = document.getElementById('configName').value.trim();
  if (!configName) {
    showFirebaseStatus('Please enter a configuration name', 'error');
    return;
  }
  
  const config = {
    gridWidth: gridWidth,
    gridHeight: gridHeight,
    grid: grid.map(row => row.map(cell => ({
      x: cell.x,
      y: cell.y,
      type: cell.type
    }))),
    startCell: startCell,
    goalCell: goalCell,
    currentAlgorithm: currentAlgorithm, // Save the selected algorithm
    timestamp: Date.now()
  };
  
  database.ref('pathfinding-configs/' + configName).set(config)
    .then(() => {
      showFirebaseStatus('Configuration saved successfully!', 'success');
    })
    .catch((error) => {
      showFirebaseStatus('Error saving configuration: ' + error.message, 'error');
    });
}

function loadFromFirebase() {
  if (!database) {
    showFirebaseStatus('Firebase not configured. Please add your Firebase credentials in app.js', 'error');
    return;
  }
  
  const configName = document.getElementById('configName').value.trim();
  if (!configName) {
    showFirebaseStatus('Please enter a configuration name', 'error');
    return;
  }
  
  database.ref('pathfinding-configs/' + configName).once('value')
    .then((snapshot) => {
      const config = snapshot.val();
      if (config) {
        gridWidth = config.gridWidth;
        gridHeight = config.gridHeight;
        
        document.getElementById('gridWidth').value = gridWidth;
        document.getElementById('gridHeight').value = gridHeight;
        
        initGrid();
        
        // Restore grid state
        for (let y = 0; y < gridHeight; y++) {
          for (let x = 0; x < gridWidth; x++) {
            if (config.grid[y] && config.grid[y][x]) {
              grid[y][x].type = config.grid[y][x].type;
            }
          }
        }
        
        startCell = config.startCell;
        goalCell = config.goalCell;
        
        // Restore algorithm setting
        currentAlgorithm = config.currentAlgorithm || 'A_STAR';
        document.getElementById('algorithmSelect').value = currentAlgorithm;
        updateAlgorithmLabel();
        
        drawGrid();
        showFirebaseStatus('Configuration loaded successfully!', 'success');
        updateStatus('Configuration loaded');
      } else {
        showFirebaseStatus('Configuration not found', 'error');
      }
    })
    .catch((error) => {
      showFirebaseStatus('Error loading configuration: ' + error.message, 'error');
    });
}

function showFirebaseStatus(message, type) {
  const statusEl = document.getElementById('firebaseStatus');
  statusEl.textContent = message;
  statusEl.className = 'firebase-status ' + type;
  
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'firebase-status';
  }, 5000);
}

// Event Listeners
document.getElementById('applyGridSize').addEventListener('click', applyGridSize);
document.getElementById('generateObstacles').addEventListener('click', generateRandomObstacles);
document.getElementById('clearGrid').addEventListener('click', clearGrid);
document.getElementById('findPath').addEventListener('click', findPath);
document.getElementById('animateSearch').addEventListener('click', animateSearch);
document.getElementById('saveConfig').addEventListener('click', saveToFirebase);
document.getElementById('loadConfig').addEventListener('click', loadFromFirebase);

// New Algorithm Selector Listener
const algorithmSelect = document.getElementById('algorithmSelect');
algorithmSelect.addEventListener('change', (e) => {
    if (isAnimating) return;
    currentAlgorithm = e.target.value;
    updateAlgorithmLabel(); // This updates the new details section
    clearVisuals();
    drawGrid();
    updateStatus(`${document.getElementById('heuristicType').textContent} selected.`);
});

// Animation speed slider
const speedSlider = document.getElementById('animationSpeed');
const speedValue = document.getElementById('speedValue');

speedSlider.addEventListener('input', (e) => {
  const value = parseInt(e.target.value);
  animationSpeed = value / 10;
  speedValue.textContent = animationSpeed.toFixed(1) + 'x';
});

// Initialize on load
initGrid();