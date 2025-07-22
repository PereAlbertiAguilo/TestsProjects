const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const defaultCol = "#69a2ff";
const curveSampleOffset = 0.01;

let curve = [];
let currPoint = 0;

window.onresize = () => window.location.reload();
window.onload = start;

// Logic called when the window is loaded
function start() {
  resize();

  ctx.strokeStyle = defaultCol;
  ctx.lineWidth = 2;

  // Draws title texts
  ctx.fillStyle = "white";
  createText("Bézier Curves", (yOffset = 80), (fontSize = 40));
  createText("(Click to add points)", (yOffset = 110), (fontSize = 15));
  createText(
    "Pere Albertí Aguiló",
    (yOffset = window.innerHeight - 30),
    (fontSize = 15)
  );

  document.addEventListener("mousedown", (e) => {
    curve[currPoint] = { x: e.clientX, y: e.clientY };
    createPoint(curve[currPoint].x, curve[currPoint].y);
    currPoint++;

    if (curve.length === 4) {
      createCurve(...curve);
      currPoint = 0;
      curve = [];
    }
  });
}

// Reseizes the context canvas to the current window size
function resize() {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
}

// Draws a text center justified with a given size
function createText(text, yOffset, fontSize) {
  ctx.font = fontSize + "px monospace";
  const textWidth = ctx.measureText(text).width;
  const xPos = window.innerWidth / 2 - textWidth / 2;
  ctx.fillText(text, xPos, yOffset);
}

// Draws a point to a specified x and y coord
function createPoint(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, (radius = 6), 0, 2 * Math.PI);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.stroke();
}

// Draws a Line from one point (x , y) to another
// with a point at the start and end positions
function createLine(P1, P2, doted = false) {
  if (doted) {
    ctx.setLineDash([10, 15]);
    ctx.strokeStyle = "white";
  }

  ctx.beginPath();
  ctx.moveTo(P1.x, P1.y);
  ctx.lineTo(P2.x, P2.y);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.strokeStyle = defaultCol;

  createPoint(P1.x, P1.y);
  createPoint(P2.x, P2.y);
}

// Calculates an x and y position given 4 points
// and a t value (0 <= t <= 1)
function bezierPos(P1, P2, P3, P4, t) {
  const x =
    (1 - t) ** 3 * P1.x +
    3 * (1 - t) ** 2 * t * P2.x +
    3 * (1 - t) * t ** 2 * P3.x +
    t ** 3 * P4.x;
  const y =
    (1 - t) ** 3 * P1.y +
    3 * (1 - t) ** 2 * t * P2.y +
    3 * (1 - t) * t ** 2 * P3.y +
    t ** 3 * P4.y;

  return { x, y };
}

// Draws a cubic bézier curve given 4 points
function createCurve(P1, P2, P3, P4) {
  let t = 0;
  ctx.beginPath();
  const startPos = bezierPos(P1, P2, P3, P4, t);
  ctx.moveTo(startPos.x, startPos.y);

  // Interpolates the t value from 0 to 1 by a
  // curveSampleOffset constant
  while (t < 1) {
    const pos = bezierPos(P1, P2, P3, P4, t);
    ctx.lineTo(pos.x, pos.y);
    t += curveSampleOffset;
  }

  t = 1;
  const endPos = bezierPos(P1, P2, P3, P4, t);
  ctx.lineTo(endPos.x, endPos.y);
  ctx.stroke();

  // Draws doted lines from the P1 to P2 and from P3 to P4
  // once the curve is drawn
  createLine(P1, P2, (doted = true));
  createLine(P3, P4, (doted = true));
}
