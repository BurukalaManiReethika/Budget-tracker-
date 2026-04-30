function formatINR(amount) {
  return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function renderMonth() {
  const el = document.getElementById('current-month');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function renderStats(state) {
  const spent = getTotalSpent(state.expenses);
  const remaining = getRemaining(state.budget, state.expenses);
  document.getElementById('stat-budget').textContent    = formatINR(state.budget);
  document.getElementById('stat-spent').textContent     = formatINR(spent);
  document.getElementById('stat-remaining').textContent = formatINR(remaining);
  const remainEl = document.getElementById('stat-remaining');
  remainEl.style.color = remaining < 0
    ? 'var(--accent-red)'
    : remaining < state.budget * 0.15
      ? 'var(--accent-amber)'
      : 'var(--accent-green)';
}

function renderProgress(state) {
  const fill   = document.getElementById('progress-fill');
  const textEl = document.getElementById('progress-text');
  const pctEl  = document.getElementById('progress-pct');
  const spent  = getTotalSpent(state.expenses);
  const pct    = getPct(state.budget, state.expenses);
  const rawPct = state.budget ? (spent / state.budget) * 100 : 0;

  fill.style.width = `${pct}%`;
  fill.classList.remove('warn', 'alert');
  if (rawPct >= 90) fill.classList.add('alert');
  else if (rawPct >= 70) fill.classList.add('warn');

  textEl.textContent = `${formatINR(spent)} spent`;
  pctEl.textContent  = `${Math.round(rawPct)}%`;
}

function renderExpenses(state, filterCat = 'All') {
  const listEl   = document.getElementById('expense-list');
  const emptyEl  = document.getElementById('empty-state');
  const expenses = filterCat === 'All'
    ? state.expenses
    : state.expenses.filter(e => e.category === filterCat);

  Array.from(listEl.children).forEach(child => {
    if (child !== emptyEl) child.remove();
  });

  if (expenses.length === 0) {
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';
  for (const expense of expenses) {
    listEl.appendChild(buildExpenseItem(expense));
  }
}

function buildExpenseItem(expense) {
  const color = CAT_COLORS[expense.category] || '#94a3b8';
  const item = document.createElement('div');
  item.className = 'expense-item';
  item.dataset.id = expense.id;
  item.innerHTML = `
    <div class="expense-left">
      <span class="expense-cat-dot" style="background:${color}"></span>
      <div class="expense-info">
        <span class="expense-name">${escapeHTML(expense.name)}</span>
        <div class="expense-meta">
          <span class="expense-cat-tag" style="color:${color};border-color:${color}40">${expense.category}</span>
          <span>${expense.date}</span>
        </div>
      </div>
    </div>
    <div class="expense-right">
      <span class="expense-amount">${formatINR(expense.amount)}</span>
      <button class="delete-btn" data-id="${expense.id}" title="Delete expense">✕</button>
    </div>
  `;
  return item;
}

let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function flashInput(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.style.borderColor = 'var(--accent-green)';
  setTimeout(() => { el.style.borderColor = ''; }, 800);
}
