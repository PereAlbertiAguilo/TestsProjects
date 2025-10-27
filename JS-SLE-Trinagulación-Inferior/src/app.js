import {
  createIdentityMatrix,
  permuteColumns,
  permuteRows,
  permuteVector,
  multiplyMatrixTimesVector,
  norm,
  showElement,
  hideElement,
  largeNumberString,
  systemCompatibility,
  resultErrorCorrection,
} from "./utility.js";

import { matrix, augmentedMatrix, createCell } from "./matrixClasses.js";

const container = document.getElementById("container");
const matrixHolder = document.getElementById("matrix-holder");
const luHolder = document.getElementById("lu-holder");
const resHolder = document.getElementById("res-holder");

const settingsContainer = document.getElementById("settings-container");
const sizerDisplay = document.getElementById("sizer-display");
const sizerInput = document.getElementById("sizer");
const errorCorrectionCheckbox = document.getElementById("error-correction");
const matrixBuilderForm = document.getElementById("matrix-builder-form");
const inputsGetterBtn = document.getElementById("inputs-getter");
const triangulatorBtn = document.getElementById("triangultor");
const solverBtn = document.getElementById("solver");
const resultCheckerBtn = document.getElementById("result-checker");
const matrixRemoverBtn = document.getElementById("matrix-remover");

const MIN_SIZE = 2;
const MAX_SIZE = 8;

let size = 2;
let result = [];
let pivots = [];

let augmentedInputsMatrix = null;
let augmentedGaussMatrix = null;

let gaussMethod = null;
let gaussLUMethod = null;

window.onload = addListeners;

function eraseMatrix() {
  matrixHolder.replaceChildren();
  luHolder.replaceChildren();
  resHolder.replaceChildren();
  result = [];
  pivots = [];
}

function partialPivoting(A, b, k) {
  let im = k;
  for (let l = k + 1; l < size; l++) {
    if (Math.abs(A[im][k]) < Math.abs(A[l][k])) {
      im = l;
    }
  }

  if (im != k) {
    pivotRows(A, k, im);

    const tempB = b[k];
    b[k] = b[im];
    b[im] = tempB;
  }
}

function completePivoting(A, b, k) {
  let fm = k;
  let cm = k;
  for (let i = k + 1; i < size; i++) {
    for (let j = k + 1; j < size; j++) {
      if (Math.abs(A[i][j]) > Math.abs(A[fm][cm])) {
        fm = i;
        cm = j;
      }
    }
  }

  if (fm != k) {
    pivotRows(A, k, fm);

    const tempB = b[k];
    b[k] = b[fm];
    b[fm] = tempB;
  }

  if (cm != k) {
    pivots.push([cm, k]);

    pivotColumns(A, k, cm);
  }
}

function gauss(A, b, pivotingFunc) {
  for (let k = 0; k < size - 1; k++) {
    if (pivotingFunc) pivotingFunc(A, b, k);

    for (let i = k + 1; i < size; i++) {
      if (A[k][k] === 0) continue;
      const m = A[i][k] / A[k][k];
      A[i][k] = 0;
      for (let j = k + 1; j < size; j++) {
        A[i][j] -= m * A[k][j];
        if (Math.abs(A[i][j]) < 1e-12) A[i][j] = 0;
      }
      b[i] -= m * b[k];
      if (Math.abs(b[i]) < 1e-12) b[i] = 0;
    }
  }
}

function pivotRows(A, k, fm) {
  for (let p = k; p < size; p++) {
    const tempA = A[k][p];
    A[k][p] = A[fm][p];
    A[fm][p] = tempA;
  }
}

function pivotColumns(A, k, cm) {
  for (let p = 0; p < size; p++) {
    const tempA = A[p][k];
    A[p][k] = A[p][cm];
    A[p][cm] = tempA;
  }
}

function noPivotingLU(L, U, P, Q, k) {
  P.elem.remove();
  Q.elem.remove();

  return 0;
}

function partialPivotingLU(L, U, P, Q, k) {
  let im = k;
  for (let l = k + 1; l < size; l++) {
    if (Math.abs(U.A[im][k]) < Math.abs(U.A[l][k])) {
      im = l;
    }
  }

  if (fm != k) {
    pivotRows(U.A, k, im);
    permuteRows(L.A, k, im);
    permuteRows(P.A, k, im);
  }

  Q.elem.remove();

  return 1;
}

function completePivotingLU(L, U, P, Q, k) {
  let fm = k;
  let cm = k;
  for (let i = k + 1; i < size; i++) {
    for (let j = k + 1; j < size; j++) {
      if (Math.abs(U.A[i][j]) > Math.abs(U.A[fm][cm])) {
        fm = i;
        cm = j;
      }
    }
  }

  if (fm != k) {
    pivotRows(U.A, k, fm);
    permuteRows(L.A, k, fm);
    permuteRows(P.A, k, fm);
  }
  if (cm != k) {
    pivotColumns(U.A, k, cm);
    permuteColumns(Q.A, cm, k);
  }

  return 2;
}

function createFactorizationMatrices(A) {
  const L = new matrix(size);
  const U = new matrix(size);
  const P = createIdentityMatrix(size);
  const Q = createIdentityMatrix(size);
  L.elem.classList.add("braces");
  U.elem.classList.add("braces");
  P.elem.classList.add("braces");
  Q.elem.classList.add("braces");
  L.getInputs();
  U.setInputs(A);
  U.getInputs();
  luHolder.appendChild(L.elem);
  luHolder.appendChild(U.elem);
  luHolder.appendChild(P.elem);
  luHolder.appendChild(Q.elem);

  return [L, U, P, Q];
}

function gaussLU(A, b, pivotingLUFunc) {
  const [L, U, P, Q] = createFactorizationMatrices(A);

  let pivotType = 0;
  for (let k = 0; k < size - 1; k++) {
    pivotType = pivotingLUFunc ? pivotingLUFunc(L, U, P, Q, k) : 0;

    for (let i = k + 1; i < size; i++) {
      if (U.A[k][k] === 0) continue;
      const m = U.A[i][k] / U.A[k][k];

      L.A[i][k] = m;
      L.inputField[i][k].value = m;

      U.A[i][k] = 0;
      for (let j = k + 1; j < size; j++) {
        U.A[i][j] -= m * U.A[k][j];
        if (Math.abs(U.A[i][j]) < 1e-12) U.A[i][j] = 0;
      }
    }
  }

  U.setInputs(U.A);
  P.setInputs(P.A);
  Q.setInputs(Q.A);

  for (let i = 0; i < size; i++) {
    L.A[i][i] = 1;
    L.setInputs(L.A);
  }

  return [L, U, P, Q, pivotType];
}

function solverLU(L, U, P, Q, b, pivotType) {
  if (!systemCompatibility(U.A, b, false)) return;

  let res = [];
  switch (pivotType) {
    case 0:
      res = solverLUNP(L.A, U.A, b);
      break;
    case 1:
      res = solverLUPP(L.A, U.A, P.A, b);
      break;
    case 2:
      res = solverLUCP(L.A, U.A, P.A, Q.A, b);
      break;
  }

  if (errorCorrectionCheckbox.checked) {
    resultErrorCorrection(res, 3, 4);
  }

  createResultVector(
    res,
    (pivotType === 0
      ? "Ly=b | Ux=y"
      : pivotType === 1
      ? "Ly=Pb | Ux=y"
      : "Ly=Pb | Uz=y | x=Qx") + " result vector"
  );
}

function solverLUNP(L, U, b) {
  const y = solverFSub(L, b);
  const x = solverBSub(U, y);
  return x;
}

function solverLUPP(L, U, P, b) {
  const Pb = multiplyMatrixTimesVector(P, b);
  const y = solverFSub(L, Pb);
  const x = solverBSub(U, y);
  return x;
}

function solverLUCP(L, U, P, Q, b) {
  const Pb = multiplyMatrixTimesVector(P, b);
  const y = solverFSub(L, Pb);
  const x = solverBSub(U, y);
  const res = multiplyMatrixTimesVector(Q, x);
  return res;
}

function solverBSub(A, b) {
  if (!systemCompatibility(A, b)) return;

  const result = [size];

  const n = size - 1;
  result[n] = b[n] / A[n][n];

  for (let i = n - 1; i >= 0; i--) {
    let S = 0;
    for (let j = i + 1; j <= n; j++) {
      S = S + A[i][j] * result[j];
    }
    result[i] = (b[i] - S) / A[i][i];
  }

  return result;
}

function solverFSub(A, b) {
  if (!systemCompatibility(A, b)) return;

  const result = [size];

  const n = size;
  result[0] = b[0] / A[0][0];

  for (let i = 1; i < n; i++) {
    let S = 0;
    for (let j = 0; j < i; j++) {
      S = S + A[i][j] * result[j];
    }
    result[i] = (b[i] - S) / A[i][i];
  }

  return result;
}

function createResultVector(res, name = "Result vector") {
  const resVect = document.createElement("div");
  resVect.classList.add("vector-res");
  for (let i = 0; i < res.length; i++) {
    const cell = createCell();
    cell.value = res[i];
    cell.setAttribute("disabled", true);
    resVect.appendChild(cell);
  }
  resHolder.appendChild(document.createElement("h6")).innerText = name;
  resHolder.appendChild(resVect);

  return resVect;
}

function addListeners() {
  sizerInput.addEventListener("input", (e) => {
    const val = e.target.value;
    sizerDisplay.innerHTML = val;
  });

  matrixBuilderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const gaussMethodRadio = document.getElementsByName("gauss-method");
    const selectedMethod = Array.from(gaussMethodRadio).find(
      (r) => r.checked
    ).id;
    switch (selectedMethod) {
      case "gauss-method":
        gaussMethod = null;
        gaussLUMethod = noPivotingLU;
        break;
      case "partial-pivoting-method":
        gaussMethod = partialPivoting;
        gaussLUMethod = partialPivotingLU;
        break;
      case "complete-pivoting-method":
        gaussMethod = completePivoting;
        gaussLUMethod = completePivotingLU;
        break;
    }

    size = Math.max(MIN_SIZE, Math.min(Number(sizerInput.value), MAX_SIZE));

    augmentedInputsMatrix = new augmentedMatrix(size);
    augmentedGaussMatrix = new augmentedMatrix(size);

    matrixHolder.appendChild(augmentedInputsMatrix.elem);
    matrixHolder.appendChild(augmentedGaussMatrix.elem);

    augmentedInputsMatrix.matrix.inputField[0][0].focus();

    hideElement(augmentedGaussMatrix.elem);
    hideElement(settingsContainer);
    showElement(inputsGetterBtn);
    showElement(matrixRemoverBtn);
  });

  inputsGetterBtn.addEventListener("click", (e) => {
    augmentedInputsMatrix.getInputs();
    augmentedGaussMatrix.setInputs(
      augmentedInputsMatrix.matrix.A,
      augmentedInputsMatrix.vector.b
    );
    augmentedGaussMatrix.getInputs();
    navigator.clipboard.writeText(
      JSON.stringify(augmentedInputsMatrix.matrix.A)
        .replace("[[", "[")
        .replace("]]", "]")
        .replaceAll("],[", ";") +
        " " +
        JSON.stringify(augmentedInputsMatrix.vector.b).replaceAll(",", ";")
    );

    hideElement(inputsGetterBtn);
    showElement(solverBtn);
  });

  solverBtn.addEventListener("click", (e) => {
    hideElement(solverBtn);
    const [L, U, P, Q, pivotType] = gaussLU(
      augmentedGaussMatrix.matrix.A,
      augmentedGaussMatrix.vector.b,
      gaussLUMethod
    );
    solverLU(L, U, P, Q, augmentedGaussMatrix.vector.b, pivotType);

    gauss(
      augmentedGaussMatrix.matrix.A,
      augmentedGaussMatrix.vector.b,
      gaussMethod
    );
    augmentedGaussMatrix.setInputs(
      augmentedGaussMatrix.matrix.A,
      augmentedGaussMatrix.vector.b
    );

    result = solverBSub(
      augmentedGaussMatrix.matrix.A,
      augmentedGaussMatrix.vector.b
    );

    if (!result) return;

    if (pivots.length > 0) permuteVector(result, pivots);

    if (errorCorrectionCheckbox.checked) {
      resultErrorCorrection(result, 3, 4);
    }

    createResultVector(result, "AX=b result vector");

    showElement(augmentedGaussMatrix.elem);

    showElement(resultCheckerBtn);
  });

  resultCheckerBtn.addEventListener("click", (e) => {
    const Ax = multiplyMatrixTimesVector(
      augmentedInputsMatrix.matrix.A,
      result
    );
    const normCheck = norm(Ax, augmentedInputsMatrix.vector.b);
    alert(
      "Vector b:\n" +
        JSON.stringify(augmentedInputsMatrix.vector.b) +
        "\n\n" +
        "Vector result A * X:\n" +
        JSON.stringify(Ax) +
        "\n\n" +
        "Norm of the resulting vector A*X-b:\n" +
        normCheck +
        "\n" +
        largeNumberString(normCheck)
    );
  });

  matrixRemoverBtn.addEventListener("click", (e) => {
    eraseMatrix();

    showElement(settingsContainer);
    hideElement(inputsGetterBtn);
    hideElement(matrixRemoverBtn);
    hideElement(triangulatorBtn);
    hideElement(solverBtn);
    hideElement(resultCheckerBtn);
  });
}
