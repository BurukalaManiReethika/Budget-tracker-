const STORAGE_KEY = 'budget_tracker_v1';

const CAT_COLORS = {
  Food:      '#4ade80',
  Transport: '#60a5fa',
  Shopping:  '#f472b6',
  Bills:     '#fbbf24',
  Health:    '#a78bfa',
  Other:     '#94a3b8',
};

function defaultState() {
  return { budget: 0, expenses: [] };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      budget: parsed.budget || 0,
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    };
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

function getTotalSpent(expenses) {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

function getRemaining(budget, expenses) {
  return budget - getTotalSpent(expenses);
}

function getSpentByCategory(expenses) {
  const result = {};
  for (const cat of Object.keys(CAT_COLORS)) result[cat] = 0;
  for (const e of expenses) {
    if (result[e.category] !== undefined) result[e.category] += e.amount;
  }
  return result;
}

function getPct(budget, expenses) {
  if (!budget) return 0;
  return Math.min((getTotalSpent(expenses) / budget) * 100, 100);
}

function addExpense(state, { name, amount, category }) {
  const expense = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    name: name.trim(),
    amount: parseFloat(amount),
    category,
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
  };
  return { ...state, expenses: [expense, ...state.expenses] };
}

function removeExpense(state, id) {
  return { ...state, expenses: state.expenses.filter(e => e.id !== id) };
}

function clearExpenses(state) {
  return { ...state, expenses: [] };
}

function setBudget(state, amount) {
  return { ...state, budget: parseFloat(amount) || 0 };
}

function exportCSV(state) {
  const rows = [['Name', 'Amount (₹)', 'Category', 'Date']];
  for (const e of state.expenses) {
    rows.push([e.name, e.amount.toFixed(2), e.category, e.date]);
  }
  rows.push(['', '', '', '']);
  rows.push(['Total Spent', getTotalSpent(state.expenses).toFixed(2), '', '']);
  rows.push(['Budget', state.budget.toFixed(2), '', '']);
  rows.push(['Remaining', getRemaining(state.budget, state.expenses).toFixed(2), '', '']);

  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `budget-${new Date().toISOString().slice(0, 7)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
