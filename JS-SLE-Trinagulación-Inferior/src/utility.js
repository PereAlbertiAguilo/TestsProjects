import { matrix } from "./matrixClasses.js";
import { createCell } from "./matrixClasses.js";

export function permuteRows(A, r1, r2) {
  for (let p = 0; p < A.length; p++) {
    const temp = A[r1][p];
    A[r1][p] = A[r2][p];
    A[r2][p] = temp;
  }
}

export function permuteColumns(A, c1, c2) {
  for (let p = 0; p < A.length; p++) {
    const temp = A[p][c1];
    A[p][c1] = A[p][c2];
    A[p][c2] = temp;
  }
}

export function permuteVector(b, pivots) {
  for (let i = pivots.length - 1; i >= 0; i--) {
    const [i1, i2] = pivots[i];
    const temp = b[i1];
    b[i1] = b[i2];
    b[i2] = temp;
  }
}

export function multiplyMatrixTimesVector(A, v) {
  const b = [];
  for (let i = 0; i < A.length; i++) {
    let sum = 0;
    for (let j = 0; j < A[i].length; j++) {
      sum += A[i][j] * v[j];
    }
    b.push(sum);
  }
  return b;
}

export function multiplyMatrices(A, B) {
  const size = A.length;
  const C = new matrix(size);
  for (let i = 0; i < size; i++) {
    C.A.push([]);
    for (let j = 0; j < size; j++) {
      let sum = 0;
      for (let k = 0; k < size; k++) {
        sum += A[i][k] * B[k][j];
      }
      C.A[i].push(sum);
    }
  }
  C.setInputs(C.A);
  return C;
}

export function createIdentityMatrix(size) {
  const I = new matrix(size);

  for (let i = 0; i < size; i++) {
    I.A.push([]);
    for (let j = 0; j < size; j++) {
      if (i === j) {
        I.A[i].push(1);
      } else {
        I.A[i].push(0);
      }
    }
  }
  I.setInputs(I.A);
  return I;
}

export function norm(Ax, b) {
  let sum = 0;
  for (let i = 0; i < Ax.length; i++) {
    sum += (Ax[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

export function largeNumberString(num) {
  const strNum = num.toString();
  const index = strNum.indexOf("e");
  const exponent = Math.abs(Number(strNum.slice(index + 1, strNum.length)));
  const significand = Number(strNum.slice(0, index)) * 10 ** exponent;

  let res = "0.";
  for (let i = 0; i < exponent - 1; i++) {
    res += "0";
  }
  res += significand;

  return res;
}

export function showElement(elem) {
  if (elem.classList.contains("hide")) elem.classList.remove("hide");
}

export function hideElement(elem) {
  if (!elem.classList.contains("hide")) elem.classList.add("hide");
}

export function resultErrorCorrection(res, minMatchCount, maxDecimals) {
  for (let i = 0; i < res.length; i++) {
    const val = res[i];

    if (Number.isInteger(val)) continue;
    if (Math.abs(val) <= 1e-12) {
      res[i] = 0;
      continue;
    }

    const stringVal = String(val);
    const decPoint = stringVal.indexOf(".");

    let round = false;
    let digits = 0;

    for (let j = decPoint + 1; j < stringVal.length; j++) {
      let matchCount = 0;

      digits++;

      if (digits >= maxDecimals) round = true;

      for (let k = j; k < j + minMatchCount; k++) {
        if (stringVal[k] === undefined) break;
        if (stringVal[k] !== stringVal[j]) break;
        matchCount++;
      }
      if (matchCount === minMatchCount) round = true;

      if (round) {
        const correction = Math.round(val * 10 ** digits) / 10 ** digits;
        res[i] = correction;
        break;
      }
    }
  }
}

export function systemCompatibility(A, b, alertUser = true) {
  let incompatible = false;

  for (let i = 0; i < A.length; i++) {
    let counter = 0;
    for (let j = 0; j < A.length; j++) {
      if (A[i][j] === 0) counter++;
    }
    if (counter >= A.length && b[i] === 0) {
      if (alertUser) alert("The system has infinitely many solutions");
      return false;
    }
    if (A[i][i] === 0) {
      incompatible = true;
    }
  }

  if (incompatible) {
    if (alertUser) alert("The system has no solutions");
    return false;
  }

  return true;
}
