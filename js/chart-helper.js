let donutChart = null;

function initChart() {
  const ctx = document.getElementById('donut-chart').getContext('2d');
  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(CAT_COLORS),
      datasets: [{
        data: Object.keys(CAT_COLORS).map(() => 0),
        backgroundColor: Object.values(CAT_COLORS),
        borderColor: '#1a1a1f',
        borderWidth: 3,
        hoverBorderColor: '#1a1a1f',
        hoverBorderWidth: 3,
      }],
    },
    options: {
      cutout: '70%',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a1a1f',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f0efea',
          bodyColor: '#6b6a70',
          titleFont: { family: "'Syne', sans-serif", weight: '600', size: 13 },
          bodyFont: { family: "'DM Mono', monospace", size: 12 },
          padding: 10,
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed;
              return val > 0 ? ` ₹${val.toLocaleString('en-IN')}` : ' No expenses';
            },
          },
        },
      },
      animation: { duration: 400, easing: 'easeInOutQuart' },
    },
  });
}

function updateChart(expenses) {
  if (!donutChart) return;
  const byCategory = getSpentByCategory(expenses);
  const cats = Object.keys(CAT_COLORS);
  const values = cats.map(c => byCategory[c] || 0);
  const total = values.reduce((a, b) => a + b, 0);

  if (total === 0) {
    donutChart.data.datasets[0].data = [1];
    donutChart.data.labels = ['Empty'];
    donutChart.data.datasets[0].backgroundColor = ['#2a2a2f'];
  } else {
    donutChart.data.datasets[0].data = values;
    donutChart.data.labels = cats;
    donutChart.data.datasets[0].backgroundColor = Object.values(CAT_COLORS);
  }

  donutChart.update();

  const centerEl = document.getElementById('chart-center-value');
  if (centerEl) centerEl.textContent = `₹${total.toLocaleString('en-IN')}`;

  updateLegend(byCategory, total);
}

function updateLegend(byCategory, total) {
  const legendEl = document.getElementById('chart-legend');
  if (!legendEl) return;
  legendEl.innerHTML = '';
  const cats = Object.keys(CAT_COLORS).filter(c => byCategory[c] > 0);
  if (cats.length === 0) {
    legendEl.innerHTML = '<p style="font-size:12px;color:var(--text-hint);text-align:center">No spending yet</p>';
    return;
  }
  for (const cat of cats) {
    const amount = byCategory[cat];
    const pct = total > 0 ? ((amount / total) * 100).toFixed(0) : 0;
    const color = CAT_COLORS[cat];
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-left">
        <span class="legend-dot" style="background:${color}"></span>
        <span>${cat}</span>
        <span style="color:var(--text-hint);font-size:11px">${pct}%</span>
      </div>
      <span class="legend-amount">₹${amount.toLocaleString('en-IN')}</span>
    `;
    legendEl.appendChild(item);
  }
}
