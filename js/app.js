let state = loadState();
let selectedCategory = 'Food';
let filterCategory   = 'All';

function render() {
  renderStats(state);
  renderProgress(state);
  renderExpenses(state, filterCategory);
  updateChart(state.expenses);
}

function init() {
  renderMonth();
  initChart();
  render();
  const budgetInput = document.getElementById('budget-input');
  if (state.budget > 0) budgetInput.value = state.budget;
  wireEvents();
}

function wireEvents() {
  document.getElementById('set-budget-btn').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('budget-input').value);
    if (!val || val <= 0) { showToast('Enter a valid budget amount'); return; }
    state = setBudget(state, val);
    saveState(state);
    render();
    flashInput('budget-input');
    showToast(`Budget set to ₹${val.toLocaleString('en-IN')}`);
  });

  document.getElementById('budget-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('set-budget-btn').click();
  });

  document.getElementById('category-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) return;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedCategory = btn.dataset.cat;
  });

  document.getElementById('add-expense-btn').addEventListener('click', addExpenseHandler);

  document.getElementById('expense-amount').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addExpenseHandler();
  });

  document.getElementById('expense-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-btn');
    if (!btn) return;
    const id = btn.dataset.id;
    const expense = state.expenses.find(ex => ex.id === id);
    state = removeExpense(state, id);
    saveState(state);
    render();
    if (expense) showToast(`Removed "${expense.name}"`);
  });

  document.getElementById('filter-cat').addEventListener('change', (e) => {
    filterCategory = e.target.value;
    renderExpenses(state, filterCategory);
  });

  document.getElementById('clear-all-btn').addEventListener('click', () => {
    if (state.expenses.length === 0) { showToast('No expenses to clear'); return; }
    if (!confirm('Clear all expenses? This cannot be undone.')) return;
    state = clearExpenses(state);
    saveState(state);
    render();
    showToast('All expenses cleared');
  });

  document.getElementById('export-csv-btn').addEventListener('click', () => {
    if (state.expenses.length === 0) { showToast('No expenses to export'); return; }
    exportCSV(state);
    showToast('CSV downloaded!');
  });
}

function addExpenseHandler() {
  const nameEl   = document.getElementById('expense-name');
  const amountEl = document.getElementById('expense-amount');
  const name     = nameEl.value.trim();
  const amount   = parseFloat(amountEl.value);

  if (!name)              { showToast('Enter an expense name'); nameEl.focus(); return; }
  if (!amount || amount <= 0) { showToast('Enter a valid amount'); amountEl.focus(); return; }
  if (state.budget === 0) { showToast('Set a monthly budget first'); document.getElementById('budget-input').focus(); return; }

  state = addExpense(state, { name, amount, category: selectedCategory });
  saveState(state);
  render();

  const spent  = getTotalSpent(state.expenses);
  const rawPct = (spent / state.budget) * 100;
  if (rawPct >= 100)     showToast('⚠ Budget exceeded!');
  else if (rawPct >= 90) showToast('⚠ 90% of budget used');
  else                   showToast(`Added "${name}" — ₹${amount.toLocaleString('en-IN')}`);

  nameEl.value   = '';
  amountEl.value = '';
  nameEl.focus();
}

document.addEventListener('DOMContentLoaded', init);
