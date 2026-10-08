/**
 * UANK - Analysis & Reports Logic
 */

const Reports = {
    charts: {
        category: null,
        savings: null
    },

    async refreshPage() {
        const period = document.querySelector('.filter-tab[data-period].active').dataset.period;
        const transactions = await Transactions.getAll();
        const savings = await Savings.getAll();
        
        const now = new Date();
        let filteredTx = [];
        
        if (period === 'weekly') {
            const { start, end } = getWeekPeriod();
            filteredTx = transactions.filter(t => {
                const d = new Date(t.date);
                return d >= start && d <= end;
            });
        } else {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            filteredTx = transactions.filter(t => new Date(t.date) >= startOfMonth);
        }
        
        this.updateSummary(filteredTx, period);
        this.renderCategoryChart(filteredTx);
        this.renderSavingsChart(savings);
    },

    updateSummary(tx, period) {
        const income = tx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = tx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expense;
        
        let days = 1;
        if (period === 'weekly') days = 7;
        else {
            const now = new Date();
            days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        }
        
        const daily = expense / days;
        
        document.getElementById('analysis-income').textContent = formatRupiah(income);
        document.getElementById('analysis-expense').textContent = formatRupiah(expense);
        document.getElementById('analysis-balance').textContent = formatRupiah(balance);
        document.getElementById('analysis-daily').textContent = formatRupiah(daily);
    },

    renderCategoryChart(tx) {
        const ctx = document.getElementById('category-chart').getContext('2d');
        const expenseTx = tx.filter(t => t.type === 'expense');
        
        const summary = {};
        expenseTx.forEach(t => {
            summary[t.category] = (summary[t.category] || 0) + t.amount;
        });
        
        const labels = Object.keys(summary);
        const data = Object.values(summary);
        
        if (this.charts.category) this.charts.category.destroy();
        
        if (labels.length === 0) return;

        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: [
                        '#1A1A1A', '#404040', '#666666', '#8C8C8C', '#B3B3B3', '#D9D9D9'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { boxWidth: 12, font: { size: 10 } } }
                }
            }
        });
    },

    renderSavingsChart(savings) {
        const ctx = document.getElementById('savings-chart').getContext('2d');
        if (savings.length === 0) return;
        
        // Last entries
        const history = [...savings].reverse();
        let runningTotal = 0;
        const labels = [];
        const data = [];
        
        history.forEach(item => {
            runningTotal += (item.type === 'deposit' ? item.amount : -item.amount);
            labels.push(item.date);
            data.push(runningTotal);
        });
        
        if (this.charts.savings) this.charts.savings.destroy();

        this.charts.savings = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tabungan',
                    data: data,
                    borderColor: '#1A1A1A',
                    backgroundColor: 'rgba(26, 26, 26, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { display: false },
                    y: { beginAtZero: true }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
};

// Period tabs listener
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.filter-tab[data-period]').forEach(tab => {
        tab.addEventListener('click', () => {
            tab.parentElement.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            Reports.refreshPage();
        });
    });
});
