const display = document.getElementById("display");

// prettier-ignore
const buttonIds = [
  "clear", "backSpace", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "zero",
  "dot", "add", "sub", "mult", "div", "pow", "root", "open", "close", "equal"
];

const buttons = {};

// Gets all the HTML buttons by a list of buttonIds
buttonIds.forEach((id) => {
  buttons[id] = document.getElementById(id);
});

// A list of all valid keyboard inputs
const validInputs = {
  nums: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  oper: ["+", "-", "*", "/", "^", "|", "(", ")"],
  dot: [",", "."],
  eq: "Enter",
  backSpace: "Backspace",
  clear: "Escape",
};

const symbols = ["+", "-", "x", "÷", "^", "√", "(", ")"];

const operators = {
  add: 0,
  sub: 1,
  mult: 2,
  div: 3,
  pow: 4,
  root: 5,
  open: 6,
  close: 7,
};

let input = "";

let lastClick = -1;

// Resets the input and the display
const reset = () => {
  display.innerHTML = "0";
  input = "";
  lastClick = -1;
};

// Updates the dysplay by some value and or resets the input
const updateDisplay = (value, reset = false) => {
  input = reset ? "" : input + value;
  display.innerHTML = reset ? value : input;
};

// Removes last input in the display
const removeLastInput = () => {
  if (input.length <= 1) {
    reset();
    return;
  }
  input = input.slice(0, -1);
  updateDisplay("");
};

// Handles the the behaviour to add a decimal symbol to the input
const clickDecimal = () => {
  let decimalDisplay = lastClick === 0 ? "." : "0.";
  updateDisplay(decimalDisplay);
};

// Handles the the behaviour to add a number to the input
const clickNumber = (value) => {
  lastClick = 0;
  updateDisplay(value);
};

// Handles the the behaviour to add an operator to the input
const clickOperator = (action) => {
  const currentSymb = symbols[action];
  lastClick = 1;
  updateDisplay(currentSymb);
};

// Operates the input
const operate = () => {
  try {
    // Corrects all the input values that aren't able to be evaluated
    input = input.replace(/\^/g, "**");
    input = input.replace(/\÷/g, "/");
    input = input.replace(/\x/g, "*");
    input = input.replace(
      /(\d*)√(\(([^()]+|\([^()]*\))*\)|\d+(\.\d+)?)/g,
      (match, indice, base) => {
        const n = indice === "" ? 2 : parseFloat(indice);
        return `Math.pow(${base}, 1/${n})`;
      }
    );

    // Evaluates the corrected input like JS code and executes it
    let finalResult = eval(input);

    // If the result is not a number displays "Math Error"
    if (isNaN(finalResult)) {
      updateDisplay("Math Error", true);
      return;
    }

    // Resets the display
    reset();

    // Displays the final result by clicking it as a number
    clickNumber(finalResult);
  } catch (e) {
    // If the result can't be evaluated displays "Syntax Error"
    updateDisplay("Syntax Error", true);
  }
};

// Prevents the zoom comands from acting since it would disturb the keyboard inputs
document.addEventListener("keydown", function (event) {
  if (
    (event.ctrlKey || event.metaKey) &&
    (event.key === "+" ||
      event.key === "-" ||
      event.key === "=" ||
      event.key === "0")
  ) {
    event.preventDefault();
  }
});

// Handles all the valid inputs and adds its corresponding behaviour
document.addEventListener("keydown", function (event) {
  const key = event.key;
  if (validInputs.nums.includes(key)) {
    clickNumber(Number.parseInt(key));
  } else if (validInputs.oper.includes(key)) {
    clickOperator(validInputs.oper.indexOf(key));
  } else if (key === validInputs.eq) {
    operate();
  } else if (key === validInputs.backSpace) {
    removeLastInput();
  } else if (key === validInputs.clear) {
    reset();
  } else if (validInputs.dot.includes(key)) {
    clickDecimal();
  }
});

// Adds the event listeners to every button
buttons.clear.addEventListener("click", reset);
buttons.backSpace.addEventListener("click", removeLastInput);
buttons.dot.addEventListener("click", clickDecimal);
buttons.equal.addEventListener("click", operate);

// prettier-ignore
["zero","one","two","three","four","five","six","seven","eight","nine"].forEach((id, index) => {
  buttons[id].addEventListener("click", () => clickNumber(index));
});

Object.entries(operators).forEach(([id, code]) => {
  buttons[id].addEventListener("click", () => clickOperator(code));
});
