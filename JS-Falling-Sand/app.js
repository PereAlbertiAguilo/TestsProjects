const container = document.getElementById("container");

const width = 60;
const height = 60;
const cellSize = 10;

let hue = 0;
let col = "#fff";

let grid = [];

window.onload = start; // Starts the sim when the window loads

// All the logic necessary at the biginning
function start() {
  createGrid();
  update();

  // When the mouse moves over or clicks the container updates the
  // cell that its over to a sand cell if it wasn't sand allready
  container.addEventListener("mouseover", (e) => {
    const cellPos = getCellPos(e.target);
    if (getCell(cellPos.x, cellPos.y).state === 0)
      updateCell(cellPos.x, cellPos.y, 1, col);
  });
  container.addEventListener("mousedown", (e) => {
    const cellPos = getCellPos(e.target);
    if (getCell(cellPos.x, cellPos.y).state === 0)
      updateCell(cellPos.x, cellPos.y, 1, col);
  });
}

// All the intervals that updates the sim
function update() {
  setInterval(() => {
    updateGrid();
  }, 20);

  // Every 100 ms changes the hue of a color
  setInterval(() => {
    hue++;
    col = `hsl(${hue}, 50%, 50%)`;
  }, 100);
}

// Generates a 2 dimensional grid and generates an empty
// cell in all its positions
function createGrid() {
  for (let y = 0; y < width; y++) {
    grid.push([]);
    for (let x = 0; x < height; x++) {
      grid[y].push({ state: 0, cell: createCell(x, y) });
    }
  }
}

// Generates a cell in a specific x and y coords, and returns it self
function createCell(x, y) {
  const cell = container.appendChild(document.createElement("div"));
  cell.id = "cell";
  cell.style.bottom = y * cellSize + "px";
  cell.style.left = x * cellSize + "px";
  return cell;
}

// Returns a the cell at x and y coords
function getCell(x, y) {
  return grid[y][x];
}

// Returns a cell pos (X and Y) normalized to the cells size
function getCellPos(cell) {
  const x = Number(cell.style.left.replace("px", "")) / cellSize;
  const y = Number(cell.style.bottom.replace("px", "")) / cellSize;
  return { x, y };
}

// Updates a cell at x and y coords to a specific state and color
function updateCell(x, y, state = 0, col = "white") {
  const cell = getCell(x, y);
  cell.state = state;
  cell.cell.style.backgroundColor = col;
}

// Updates the grid
function updateGrid() {
  const temp = JSON.parse(JSON.stringify(grid)); // Creates a temporal copy of the grid
  for (let x = width - 1; x >= 0; x--) {
    for (let y = height - 1; y >= 0; y--) {
      const yInBounds = y - 1 >= 0;
      const rightXInBounds = x + 1 < width;
      const lfetXInBounds = x - 1 >= 0;

      // Checks if the current cell is sand and if there is space below
      if (temp[y][x].state === 1 && yInBounds) {
        // Checks if the cell below is empty
        if (temp[y - 1][x].state === 0) {
          updateCell(x, y);
          updateCell(x, y - 1, 1, col);
        } else {
          // If the cell below is not empty
          const rng = Math.random(); // Generates a number between 0 and 1
          // Checks if the down right or left cell is empty and is not out
          // of bounds, and it has a 50 50 chance to go right or left
          if (rightXInBounds && temp[y - 1][x + 1].state === 0 && rng > 0.5) {
            updateCell(x, y);
            updateCell(x + 1, y - 1, 1, col);
          } else if (lfetXInBounds && temp[y - 1][x - 1].state === 0) {
            updateCell(x, y);
            updateCell(x - 1, y - 1, 1, col);
          }
        }
      }
    }
  }
}
