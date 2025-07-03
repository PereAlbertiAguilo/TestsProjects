const cellSize = 20;
const width = 600 - cellSize;
const height = 600 - cellSize;

let snakeSize = 5;

let canChangeDir = true;
let isGameOver = false;

const platform = document.getElementById("platform-boundary");
const cScoreDisplay = document.getElementById("cScore");
const bScoreDisplay = document.getElementById("bScore");

let currentAim = 0;
let currentDir = 1;

let head;
let point;

let snakePositions = [];

const MAX_FPS = 60;
const FRAME_INTERVAL_MS = 1000 / MAX_FPS;
let previousTimeMs = 0;

const startTime = 0.08;
let currentTime = startTime;

// Calls the start behaviour on every page refresh
window.onload = start;

// Handles all the behaviours at the start of the game
function start() {
  createPoint();
  createSnake();
  displayCurrentScore();
  displayBestScore();
  update();
}

// Handles all the animation/dynamic behaviour (snake movement)
function update() {
  requestAnimationFrame((currentTimeMs) => {
    if (!isGameOver) {
      const deltaTimeMs = currentTimeMs - previousTimeMs;
      const deltaTime = deltaTimeMs / 1000;
      if (deltaTimeMs >= FRAME_INTERVAL_MS) {
        // FIXED frames
        updatePhysics(deltaTime);
        previousTimeMs = currentTimeMs;
      }
      // UNFIXED frames
    }
    update();
  });
}

// Handles all the FIXED frames behaviour
function updatePhysics(deltaTime) {
  currentTime -= deltaTime;
  if (currentTime <= 0) {
    moveSnake();
    currentTime = startTime;
  }
}

// Checks if the the head of the snake is inside of the platform limits
function isInBounds() {
  const pos = getCellPos(head);
  return pos.left >= 0 && pos.left < width && pos.top >= 0 && pos.top < height;
}

// Checks if the snake is clliding with its own body or other cells (like the points)
function isCollidingWithCell(cell, isHead = false) {
  let isColliding = false;
  const cellPos = getCellPos(cell);
  if (isHead) {
    const headPos = getCellPos(head);
    if (cellPos.left === headPos.left && cellPos.top === headPos.top)
      isColliding = true;
  } else {
    snakePositions.forEach((pos) => {
      if (cellPos.left === pos.left && cellPos.top === pos.top)
        isColliding = true;
    });
  }

  return isColliding;
}

// Returns all the current parts of the snake body
function getAllSnakeCells() {
  return document.getElementsByClassName("body");
}

// Returns a random number from 0 to the max range
// normalized to a number divisible by the cellSize
function getRandomCellCoord(max) {
  return Math.floor(Math.random() * (max / cellSize)) * cellSize;
}

// Returns two random values x, y within the limits of the platform
function randomPosInBounds() {
  return {
    x: getRandomCellCoord(width),
    y: getRandomCellCoord(height),
  };
}

// Creates a div cell in a specific position (0, 0 => left, top)
function createCell(x = 0, y = 0) {
  let cell = document.createElement("div");

  platform.appendChild(cell);

  cell.classList.add("cell");
  cell.style.left = x + "px";
  cell.style.top = y + "px";

  return cell;
}

// Creates a point cell from a normal cell in a random position within the platform
function createPoint() {
  const randomPos = randomPosInBounds();
  const cell = createCell(randomPos.x, randomPos.y);
  cell.classList.add("apple");
  cell.id = snakeSize;
  point = cell;
  return cell;
}

// Creates a snake cell body or head in a specific position with a specific id
function createSnakeCell(x, y, id, type = "body") {
  const cell = createCell(x, y);
  cell.classList.add("snake", type);
  cell.id = id;
  return cell;
}

// Creates the first instance of the snake in the 0, 0
// coors depending on the initial size of the snake
function createSnake() {
  head = createSnakeCell(0, 0, 0, "head");
  for (let i = 1; i < snakeSize; i++) {
    createSnakeCell(0, 0, i);
  }
}

// Handles the logic when a point is bewing consumed
// Removes the previous points, adds a snake cell,
// creates a new randomly placed point and updates
// the score UI
function consumePoint() {
  point.remove();

  const snake = getAllSnakeCells();
  const spawnPos = getCellPos(snake[snake.length - 1]);

  createSnakeCell(spawnPos.left, spawnPos.top, snakeSize);

  snakeSize++;

  createPoint();
  displayCurrentScore();
}

// Handles the logic to display the CURRENT score to an HTML element
function displayCurrentScore() {
  cScoreDisplay.innerHTML = "Current Score: " + snakeSize;
}

// Handles the logic to display the BEST score to an HTML element
function displayBestScore() {
  const savedScore = localStorage.getItem("bScore");
  bScoreDisplay.innerHTML = "Best Score: " + (savedScore ? savedScore : 0);
}

// Checks wether the current score is higher than the
// best score if so it updates the best score in the
// browser local storage and displays it to the UI
function saveBestScore(score) {
  const savedScore = Number.parseInt(localStorage.getItem("bScore") || "0");
  if (score > savedScore) {
    localStorage.setItem("bScore", score);
    displayBestScore();
  }
}

// Handles the game over logic
function gameOver() {
  isGameOver = true;
  console.log("Gameover: " + isGameOver);

  saveBestScore(snakeSize);
}

// Resets all the game properties and restarts the game
function resetGame() {
  platform.innerHTML = "";
  snakeSize = 5;
  currentAim = 0;
  currentDir = 1;
  canChangeDir = true;
  isGameOver = false;
  snakePositions = [];
  start();
}

// Handles all the logic for the snake to move
function moveSnake() {
  const currentSnakeCells = getAllSnakeCells();

  // If the the game is over and is out of bounds
  // or has collided with its own body => Game Over
  if (!isGameOver && (!isInBounds() || isCollidingWithCell(head))) {
    gameOver();
    return;
  }

  // Consumes a point if the head of the snake has collided with one
  if (isCollidingWithCell(point, true)) consumePoint();

  const currentSnakePositions = [];

  // Loops through all the current body parts and moves
  // the to its next position in the snake queue
  for (let i = 0; i < currentSnakeCells.length; i++) {
    const cell = currentSnakeCells[i];
    let nextCell = currentSnakeCells[i + 1];

    if (i + 1 >= currentSnakeCells.length) nextCell = head;

    const pos = getCellPos(nextCell);

    cell.style.left = pos.left + "px";
    cell.style.top = pos.top + "px";

    currentSnakePositions.push(getCellPos(cell));
  }

  // Moves the head depending on the current aim and direction
  const hPos = getCellPos(head);

  if (currentAim === 0) {
    const newLeft = hPos.left + cellSize * currentDir;
    head.style.left = newLeft + "px";
  } else {
    const newTop = hPos.top + cellSize * currentDir;
    head.style.top = newTop + "px";
  }

  // Finaly saves all the snake cells positions to a global array
  snakePositions = currentSnakePositions;

  canChangeDir = true;
}

// Returns the coords of a cell
function getCellPos(cell) {
  const left = Number.parseInt(cell.style.left.slice(0, -2));
  const top = Number.parseInt(cell.style.top.slice(0, -2));

  return { left, top };
}

// Handles all the inputs logic
document.addEventListener("keydown", function (event) {
  const key = event.key;

  // Checks if the snake is able to change directions
  // and, if so, updates the aim and direction based
  // on their current values
  if (canChangeDir) {
    canChangeDir = false;
    if (key === "w" || key === "ArrowUp") {
      if (currentAim === 0) {
        currentAim = 1;
        currentDir = -1;
      }
    } else if (key === "a" || key === "ArrowLeft") {
      if (currentAim === 1) {
        currentAim = 0;
        currentDir = -1;
      }
    } else if (key === "s" || key === "ArrowDown") {
      if (currentAim === 0) {
        currentAim = 1;
        currentDir = 1;
      }
    } else if (key === "d" || key === "ArrowRight") {
      if (currentAim === 1) {
        currentAim = 0;
        currentDir = 1;
      }
    }
  }

  // Key to reset the game
  if (key === "r") {
    resetGame();
  }
});
