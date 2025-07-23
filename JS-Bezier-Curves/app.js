const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const defaultCol = "#9b69ffff";
const defaultLineWidth = 4;
const curveSampleOffset = 0.01;

let curve = [];
let currPoint = 0;
let curveDrawing = false;

window.onresize = () => window.location.reload();
window.onload = start;

// Logic called when the window is loaded
function start() {
  resize();
  setContextToDefault();

  // Draws title texts
  ctx.fillStyle = "white";
  createText("Bézier Curves", (yOffset = 80), (fontSize = 40));
  createText("(Click to add points)", (yOffset = 110), (fontSize = 15));
  createText("(4 points = curve)", (yOffset = 130), (fontSize = 15));
  createText(
    "Pere Albertí Aguiló",
    (yOffset = window.innerHeight - 30),
    (fontSize = 15)
  );

  document.addEventListener("mousedown", (e) => {
    if (curveDrawing) return;
    curve[currPoint] = { x: e.clientX, y: e.clientY };
    createPoint(curve[currPoint]);
    currPoint++;
    switch (curve.length) {
      case 2:
        createLine(curve[0], curve[1], (isDoted = true));
        break;
      case 3:
        createLine(curve[1], curve[2], (isDoted = true));
        break;
      case 4:
        createLine(curve[2], curve[3], (isDoted = true));
        break;
    }
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

// Default context styles
function setContextToDefault() {
  ctx.strokeStyle = defaultCol;
  ctx.lineWidth = defaultLineWidth;
  ctx.setLineDash([]);
  ctx.lineCap = "round";
  ctx.globalCompositeOperation = "destination-over";
}

// Draws a text center justified with a given size
function createText(text, yOffset, fontSize) {
  ctx.font = fontSize + "px monospace";
  const textWidth = ctx.measureText(text).width;
  const xPos = window.innerWidth / 2 - textWidth / 2;
  ctx.fillText(text, xPos, yOffset);
}

// Draws a point to a specified x and y coord
function createPoint(P, radius = 8) {
  ctx.beginPath();
  ctx.arc(P.x, P.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.stroke();
}

// Draws a Line from one point (x , y) to another
// with a point at the start and end positions
function createLine(P1, P2, isDoted = false) {
  if (isDoted) {
    ctx.setLineDash([10, 15]);
    ctx.strokeStyle = "#ffffff80";
    ctx.lineWidth = Math.floor(defaultLineWidth / 2);
  }

  ctx.beginPath();
  ctx.moveTo(P1.x, P1.y);
  ctx.lineTo(P2.x, P2.y);
  ctx.stroke();

  setContextToDefault();
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
  curveDrawing = true;

  let t = 0;
  ctx.beginPath();
  ctx.moveTo(P1.x, P1.y);

  // Interpolates the t value from 0 to 1 by a
  // curveSampleOffset constant with a Interval
  // set to ≈ 60 fps
  let drawInterval = setInterval(() => {
    if (t >= 1) {
      t = 1;
      ctx.lineTo(P4.x, P4.y);
      ctx.stroke();
      clearInterval(drawInterval);
      curveDrawing = false;
      return;
    }
    const pos = bezierPos(P1, P2, P3, P4, t);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    t += curveSampleOffset;
  }, 16);
}
