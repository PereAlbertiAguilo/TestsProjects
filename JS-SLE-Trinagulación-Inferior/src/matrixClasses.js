export class matrix {
  constructor(size) {
    this.size = size;
    this.inputField = [];
    this.A = [];
    this.elem = this.createMatrixA();
  }

  createRow() {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let i = 0; i < this.size; i++) {
      row.appendChild(createCell());
    }
    this.inputField.push([...row.childNodes]);
    return row;
  }

  createMatrixA() {
    const matrixA = document.createElement("div");
    matrixA.classList.add("matrix-a");
    for (let i = 0; i < this.size; i++) {
      matrixA.appendChild(this.createRow());
    }
    return matrixA;
  }

  getInputs() {
    for (let i = 0; i < this.size; i++) {
      this.A.push([]);
      for (let j = 0; j < this.size; j++) {
        this.inputField[i][j].setAttribute("disabled", true);
        this.A[i].push(Number(this.inputField[i][j].value));
      }
    }
  }

  setInputs(A) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.inputField[i][j].setAttribute("disabled", true);
        this.inputField[i][j].value = A[i][j];
      }
    }
  }
}

export class vector {
  constructor(size) {
    this.size = size;
    this.inputField = [];
    this.b = [];
    this.elem = this.createVectorB();
  }

  createVectorB() {
    const vectorB = document.createElement("div");
    vectorB.classList.add("vector-b");
    for (let i = 0; i < this.size; i++) {
      vectorB.appendChild(createCell());
    }
    this.inputField.push(...vectorB.childNodes);
    return vectorB;
  }

  getInputs() {
    for (let i = 0; i < this.size; i++) {
      this.inputField[i].setAttribute("disabled", true);
      this.b.push(Number(this.inputField[i].value));
    }
  }

  setInputs(b) {
    for (let i = 0; i < this.size; i++) {
      this.inputField[i].setAttribute("disabled", true);
      this.inputField[i].value = b[i];
    }
  }
}

export class augmentedMatrix {
  constructor(size) {
    this.size = size;
    this.matrix = new matrix(size);
    this.vector = new vector(size);
    this.elem = this.create();
  }

  create() {
    const augMatrix = document.createElement("div");
    augMatrix.classList.add("augmented-matrix");
    augMatrix.classList.add("braces");

    augMatrix.appendChild(this.matrix.elem);
    augMatrix.appendChild(document.createElement("hr"));
    augMatrix.appendChild(this.vector.elem);
    return augMatrix;
  }

  getInputs() {
    this.matrix.getInputs();
    this.vector.getInputs();
  }

  setInputs(A, b) {
    this.matrix.setInputs(A);
    this.vector.setInputs(b);
  }
}

export function createCell() {
  const cell = document.createElement("input");
  cell.type = "number";
  cell.classList.add("cell");
  cell.value = 0;
  cell.placeholder = "0";
  return cell;
}
