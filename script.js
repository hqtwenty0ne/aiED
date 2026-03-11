let display = document.getElementById('display');
let currentInput = '0';
let previousInput = '';
let operator = null;
let shouldResetDisplay = false;

function appendNumber(num) {
    if (shouldResetDisplay) {
        currentInput = num;
        shouldResetDisplay = false;
    } else {
        if (currentInput === '0' && num !== '.') {
            currentInput = num;
        } else if (num === '.' && currentInput.includes('.')) {
            return;
        } else {
            currentInput += num;
        }
    }
    updateDisplay();
}

function appendOperator(op) {
    if (operator !== null && !shouldResetDisplay) {
        calculate();
    }
    previousInput = currentInput;
    operator = op;
    shouldResetDisplay = true;
}

function calculate() {
    if (operator === null || shouldResetDisplay) {
        return;
    }

    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            result = current !== 0 ? prev / current : 'Error';
            break;
        default:
            return;
    }

    currentInput = result.toString();
    operator = null;
    shouldResetDisplay = true;
    updateDisplay();
}

function clearDisplay() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    shouldResetDisplay = false;
    updateDisplay();
}

function deleteLastDigit() {
    if (shouldResetDisplay) {
        // After a calculation, backspace should clear rather than edit the result
        clearDisplay();
        return;
    }

    if (currentInput.length <= 1) {
        currentInput = '0';
    } else {
        currentInput = currentInput.slice(0, -1);
    }

    updateDisplay();
}

function updateDisplay() {
    display.textContent = currentInput;
}

// Add keyboard support (numbers/operators/enter/clear)
window.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key >= '0' && key <= '9') {
        appendNumber(key);
        return;
    }

    if (key === '.' || key === ',') {
        // Allow comma on some keyboards as decimal separator
        appendNumber('.');
        return;
    }

    if (['+', '-', '*', '/'].includes(key)) {
        appendOperator(key);
        return;
    }

    if (key === 'Enter' || key === '=') {
        calculate();
        return;
    }

    if (key === 'Backspace') {
        deleteLastDigit();
        return;
    }

    if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
    }
});