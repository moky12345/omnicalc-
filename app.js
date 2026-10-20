/**
 * OMNICALC - PRECISION CALCULATOR & ROAS LAB LOGIC
 * Author: Karl Andre Gutierrez
 * Features:
 * - Dual Mode: Standard Arithmetic + E-Commerce Unit Economics
 * - Full Physical Keyboard Event Handling
 * - History Tape with Click-to-Recall
 * - Dynamic ROAS & Financial Breakdown Visualizer
 */

// Calculator Engine State
const calc = {
  currentInput: '0',
  previousInput: '',
  operator: null,
  waitingForSecondOperand: false,
  history: []
};

document.addEventListener('DOMContentLoaded', () => {
  setupKeyboardListeners();
  calculateEcom();
});

/* -------------------------------------------------------------
   MODE SWITCHER
   ------------------------------------------------------------- */
function switchMode(mode) {
  const stdView = document.getElementById('standardView');
  const ecomView = document.getElementById('ecomView');
  const tabStd = document.getElementById('tabStandard');
  const tabEcom = document.getElementById('tabEcom');

  if (mode === 'ecom') {
    stdView.style.display = 'none';
    ecomView.style.display = 'grid';
    tabEcom.classList.add('active');
    tabStd.classList.remove('active');
    calculateEcom();
  } else {
    ecomView.style.display = 'none';
    stdView.style.display = 'grid';
    tabStd.classList.add('active');
    tabEcom.classList.remove('active');
  }
}

/* -------------------------------------------------------------
   STANDARD CALCULATOR LOGIC
   ------------------------------------------------------------- */
function updateDisplay() {
  const primaryEl = document.getElementById('screenPrimary');
  const historyEl = document.getElementById('screenHistory');

  primaryEl.textContent = formatNumber(calc.currentInput);
  
  if (calc.operator && calc.previousInput !== '') {
    const symbol = calc.operator === '*' ? '×' : calc.operator === '/' ? '÷' : calc.operator;
    historyEl.textContent = `${formatNumber(calc.previousInput)} ${symbol}`;
  } else {
    historyEl.textContent = '';
  }
}

function formatNumber(numStr) {
  if (numStr === 'Error' || numStr === 'NaN') return 'Error';
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

function handleNumber(digit) {
  if (calc.waitingForSecondOperand) {
    calc.currentInput = digit;
    calc.waitingForSecondOperand = false;
  } else {
    calc.currentInput = calc.currentInput === '0' ? digit : calc.currentInput + digit;
  }
  updateDisplay();
}

function handleDecimal() {
  if (calc.waitingForSecondOperand) {
    calc.currentInput = '0.';
    calc.waitingForSecondOperand = false;
    updateDisplay();
    return;
  }
  if (!calc.currentInput.includes('.')) {
    calc.currentInput += '.';
    updateDisplay();
  }
}

function handleOperator(nextOp) {
  const inputValue = parseFloat(calc.currentInput);

  if (calc.operator && calc.waitingForSecondOperand) {
    calc.operator = nextOp;
    updateDisplay();
    return;
  }

  if (calc.previousInput === '') {
    calc.previousInput = calc.currentInput;
  } else if (calc.operator) {
    const result = performCalculation(calc.operator, parseFloat(calc.previousInput), inputValue);
    calc.currentInput = String(result);
    calc.previousInput = String(result);
  }

  calc.waitingForSecondOperand = true;
  calc.operator = nextOp;
  updateDisplay();
}

function handleCalculate() {
  if (!calc.operator || calc.previousInput === '') return;

  const prev = parseFloat(calc.previousInput);
  const current = parseFloat(calc.currentInput);
  const symbol = calc.operator === '*' ? '×' : calc.operator === '/' ? '÷' : calc.operator;

  const result = performCalculation(calc.operator, prev, current);
  const expr = `${formatNumber(calc.previousInput)} ${symbol} ${formatNumber(calc.currentInput)}`;
  
  // Add to History
  addHistoryEntry(expr, String(result));

  calc.currentInput = String(result);
  calc.previousInput = '';
  calc.operator = null;
  calc.waitingForSecondOperand = true;
  updateDisplay();
}

function performCalculation(op, a, b) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? 'Error' : a / b;
    default: return b;
  }
}

function handleToggleSign() {
  if (calc.currentInput !== '0' && calc.currentInput !== 'Error') {
    calc.currentInput = calc.currentInput.startsWith('-') ? calc.currentInput.slice(1) : '-' + calc.currentInput;
    updateDisplay();
  }
}

function handleClearAll() {
  calc.currentInput = '0';
  calc.previousInput = '';
  calc.operator = null;
  calc.waitingForSecondOperand = false;
  updateDisplay();
}

function handleBackspace() {
  if (calc.waitingForSecondOperand) return;
  if (calc.currentInput.length > 1) {
    calc.currentInput = calc.currentInput.slice(0, -1);
  } else {
    calc.currentInput = '0';
  }
  updateDisplay();
}

function handleInput(type) {
  if (type === '%') {
    const val = parseFloat(calc.currentInput) / 100;
    calc.currentInput = String(val);
    updateDisplay();
  }
}

/* -------------------------------------------------------------
   CALCULATION HISTORY TAPE
   ------------------------------------------------------------- */
function addHistoryEntry(expr, result) {
  calc.history.unshift({ expr, result });
  if (calc.history.length > 20) calc.history.pop();
  renderHistory();
}

function renderHistory() {
  const listEl = document.getElementById('historyList');
  if (calc.history.length === 0) {
    listEl.innerHTML = '<div style="font-size: 12.5px; color: var(--text-dim); text-align: center; padding: 30px 0;">No past calculations yet.</div>';
    return;
  }

  listEl.innerHTML = calc.history.map((item, idx) => `
    <div class="history-item" onclick="recallHistory('${item.result}')" title="Click to recall result">
      <div class="hist-expr">${item.expr} =</div>
      <div class="hist-res">${formatNumber(item.result)}</div>
    </div>
  `).join('');
}

function recallHistory(val) {
  calc.currentInput = val;
  calc.waitingForSecondOperand = false;
  updateDisplay();
}

function clearHistory() {
  calc.history = [];
  renderHistory();
}

/* -------------------------------------------------------------
   KEYBOARD SUPPORT
   ------------------------------------------------------------- */
function setupKeyboardListeners() {
  window.addEventListener('keydown', (e) => {
    // Only capture keyboard in standard mode and not inside an input box
    if (document.activeElement.tagName === 'INPUT') return;

    if (e.key >= '0' && e.key <= '9') {
      handleNumber(e.key);
    } else if (e.key === '.') {
      handleDecimal();
    } else if (e.key === '+') {
      handleOperator('+');
    } else if (e.key === '-') {
      handleOperator('-');
    } else if (e.key === '*') {
      handleOperator('*');
    } else if (e.key === '/') {
      e.preventDefault();
      handleOperator('/');
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      handleCalculate();
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (e.key === 'Escape') {
      handleClearAll();
    }
  });
}

/* -------------------------------------------------------------
   E-COMMERCE ROAS & MARGIN LAB LOGIC
   ------------------------------------------------------------- */
function calculateEcom() {
  const price = parseFloat(document.getElementById('inSellingPrice').value) || 0;
  const cogs = parseFloat(document.getElementById('inCogs').value) || 0;
  const shipping = parseFloat(document.getElementById('inShipping').value) || 0;
  const adSpend = parseFloat(document.getElementById('inAdSpend').value) || 0;
  const feePct = parseFloat(document.getElementById('inFeePct').value) || 0;

  const platformFee = price * (feePct / 100);
  const totalDirectCosts = cogs + shipping + platformFee;
  const grossProfit = price - totalDirectCosts;
  const netProfit = grossProfit - adSpend;

  const grossMarginPct = price > 0 ? (grossProfit / price) * 100 : 0;
  const netMarginPct = price > 0 ? (netProfit / price) * 100 : 0;
  const breakEvenRoas = grossProfit > 0 ? (price / grossProfit) : 0;
  const actualRoas = adSpend > 0 ? (price / adSpend) : 0;
  const maxCac = Math.max(0, grossProfit);

  // Update UI Elements
  const netProfitEl = document.getElementById('outNetProfit');
  netProfitEl.textContent = `$${netProfit.toFixed(2)}`;
  netProfitEl.style.color = netProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-danger)';

  document.getElementById('outNetMargin').textContent = `${netMarginPct.toFixed(1)}% Net Profit Margin`;
  document.getElementById('outBreakEvenRoas').textContent = `${breakEvenRoas.toFixed(2)}x`;
  document.getElementById('outActualRoas').textContent = `${actualRoas.toFixed(2)}x`;
  document.getElementById('outGrossMargin').textContent = `${grossMarginPct.toFixed(1)}%`;
  document.getElementById('outMaxCac').textContent = `$${maxCac.toFixed(2)}`;

  // Revenue Breakdown Stacked Bar
  if (price > 0) {
    const cogsWidth = Math.max(0, (cogs / price) * 100);
    const feeWidth = Math.max(0, ((shipping + platformFee) / price) * 100);
    const adWidth = Math.max(0, (adSpend / price) * 100);
    const profitWidth = Math.max(0, (netProfit / price) * 100);

    document.getElementById('barCogs').style.width = `${cogsWidth}%`;
    document.getElementById('barFee').style.width = `${feeWidth}%`;
    document.getElementById('barAd').style.width = `${adWidth}%`;
    document.getElementById('barProfit').style.width = `${profitWidth}%`;
  }
}
