/**
 * UANK - Budget & Week Logic
 */

const Budget = {
    currentWeek: null,

    async checkWeekStatus() {
        const weekId = getWeekId();
        let week = await DB.get('weeks', weekId);
        
        if (!week) {
            // Check if there's an active week from the past that needs closing
            const allWeeks = await DB.getAll('weeks');
            const activeWeek = allWeeks.find(w => w.status === 'active');
            
            if (activeWeek) {
                this.currentWeek = activeWeek;
                // Show banner if the active week's end date has passed
                const now = new Date();
                const endDate = new Date(activeWeek.endDate);
                if (now > endDate) {
                    document.getElementById('week-banner').classList.remove('hidden');
                }
            } else {
                this.currentWeek = null;
                // No active week, prompt to start new week
                this.showStartWeekPrompt();
            }
        } else {
            this.currentWeek = week;
            if (week.status === 'closed') {
                this.showStartWeekPrompt();
            }
        }
    },

    showStartWeekPrompt() {
        // Only show if on home page and no active week
        if (App.currentPage === 'home' && (!this.currentWeek || this.currentWeek.status === 'closed')) {
            const listContainer = document.getElementById('categories-list');
            listContainer.innerHTML = `
                <div class="empty-state">
                    <p class="mb-md">Belum ada minggu aktif.</p>
                    <button class="button primary" onclick="Budget.showNewWeekSheet()">Mulai Minggu Baru</button>
                </div>
            `;
        }
    },

    async refreshDashboard() {
        await this.checkWeekStatus();
        
        if (!this.currentWeek || this.currentWeek.status === 'closed') {
            this.showStartWeekPrompt();
            document.getElementById('remaining-budget').textContent = 'Rp0';
            document.getElementById('total-budget').textContent = 'Rp0';
            document.getElementById('total-spent').textContent = 'Rp0';
            document.getElementById('budget-progress').style.width = '0%';
            document.getElementById('current-week').textContent = '-';
            return;
        }

        const week = this.currentWeek;
        const transactions = await Transactions.getByWeek(week.id);
        
        // Calculate totals
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        // Week income is base + additional income
        const totalAvailable = week.income + totalIncome;
        const remaining = totalAvailable - totalExpense;
        const progress = totalAvailable > 0 ? (totalExpense / totalAvailable) * 100 : 0;

        // UI Updates
        document.getElementById('remaining-budget').textContent = formatRupiah(remaining);
        document.getElementById('total-budget').textContent = formatRupiah(totalAvailable);
        document.getElementById('total-spent').textContent = formatRupiah(totalExpense);
        document.getElementById('budget-progress').style.width = `${Math.min(progress, 100)}%`;
        
        const start = formatDate(week.startDate);
        const end = formatDate(week.endDate);
        document.getElementById('current-week').textContent = `${start} - ${end}`;

        // Categories List
        this.renderCategories(transactions, week.allocations);

        // Recent Transactions
        this.renderRecentTransactions(transactions);

        // Total Savings
        Savings.updateSummary();
    },

    renderCategories(transactions, allocations) {
        const listContainer = document.getElementById('categories-list');
        if (!allocations) return;

        const categorySummary = {};
        // Initialize with allocations
        Object.keys(allocations).forEach(catName => {
            categorySummary[catName] = { spent: 0, total: allocations[catName] };
        });

        // Add spending
        transactions.filter(t => t.type === 'expense').forEach(t => {
            if (categorySummary[t.category]) {
                categorySummary[t.category].spent += t.amount;
            } else {
                // If category was deleted from settings but exists in tx
                categorySummary[t.category] = { spent: t.amount, total: 0 };
            }
        });

        const html = Object.keys(categorySummary).map(name => {
            const { spent, total } = categorySummary[name];
            return UI.renderCategoryItem({ name, id: name }, spent, total);
        }).join('');

        listContainer.innerHTML = html;
    },

    renderRecentTransactions(transactions) {
        const container = document.getElementById('recent-transactions');
        const recent = transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Belum ada transaksi minggu ini</p></div>';
            return;
        }

        container.innerHTML = recent.map(tx => UI.renderTransactionItem(tx)).join('');
    },

    async showNewWeekSheet() {
        const template = App.settings.budgetTemplate;
        
        // Find last week's total income or active week's income as default
        const allWeeks = await DB.getAll('weeks');
        const sortedWeeks = allWeeks.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        const lastIncome = sortedWeeks.length > 0 ? (sortedWeeks[0].income + (sortedWeeks[0].allocations?.tabungan || 0)) : '';

        const content = `
            <div class="sheet-header">
                <h3 class="sheet-title">Mulai Minggu Baru</h3>
                <button class="sheet-close" onclick="hideSheet()">Batal</button>
            </div>
            <div class="sheet-content">
                <div class="form-group">
                    <label class="form-label">Uang Mingguan (Income)</label>
                    <input type="text" id="new-week-income" class="form-input numeric" value="${lastIncome ? lastIncome.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}" placeholder="0" autofocus inputmode="numeric">
                </div>
                
                <div class="section-header mt-md">
                    <h4 class="section-title">Alokasi Anggaran</h4>
                </div>
                <div id="allocation-preview" class="mb-md">
                    <p class="text-secondary text-center">Masukkan nominal untuk melihat pembagian</p>
                </div>
                
                <button id="btn-confirm-week" class="button primary full mt-md">Konfirmasi & Mulai</button>
            </div>
        `;
        
        showSheet(content);
        
        const inputIncome = document.getElementById('new-week-income');
        const preview = document.getElementById('allocation-preview');
        
        // Auto-format numeric input
        inputIncome.addEventListener('input', () => {
            formatInputRupiah(inputIncome);
            updatePreview();
        });
        
        const updatePreview = () => {
            const income = parseRupiah(inputIncome.value);
            if (income <= 0) {
                preview.innerHTML = '<p class="text-secondary text-center">Masukkan nominal untuk melihat pembagian</p>';
                return;
            }
            
            const allocations = calculateBudgetAllocation(income, template);
            
            let html = '<div class="categories-scroll">';
            for (const [name, amount] of Object.entries(allocations)) {
                const percent = template[name] || 0;
                html += `
                    <div class="category-item">
                        <div class="category-info">
                            <span class="category-name" style="text-transform: capitalize">${name} (${percent}%)</span>
                            <span class="category-remaining">${formatRupiah(amount)}</span>
                        </div>
                    </div>
                `;
            }
            html += '</div>';
            preview.innerHTML = html;
        };
        
        inputIncome.addEventListener('input', updatePreview);
        if (lastIncome) updatePreview();
        
        document.getElementById('btn-confirm-week').addEventListener('click', async () => {
            const income = parseRupiah(inputIncome.value);
            if (!income || income <= 0) {
                showToast('Masukkan nominal uang mingguan', 'error');
                return;
            }
            
            await this.startNewWeek(income);
            hideSheet();
        });
    },

    async startNewWeek(income) {
        const { start, end } = getWeekPeriod();
        const weekId = getWeekId();
        const template = App.settings.budgetTemplate;
        
        const allocations = calculateBudgetAllocation(income, template);
        let tabunganAwal = allocations.tabungan || 0;
        
        const storageAllocations = { ...allocations };
        delete storageAllocations.tabungan;
        
        const week = {
            id: weekId,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            income: income - tabunganAwal,
            status: 'active',
            allocations: storageAllocations,
            createdAt: new Date().toISOString()
        };
        
        // Atomic transaction for week creation and initial savings deposit
        return new Promise((resolve, reject) => {
            const tx = DB.db.transaction(['weeks', 'savings'], 'readwrite');
            const weeksStore = tx.objectStore('weeks');
            const savingsStore = tx.objectStore('savings');
            
            weeksStore.put(week);
            if (tabunganAwal > 0) {
                savingsStore.put({
                    id: generateId(),
                    date: new Date().toISOString(),
                    amount: tabunganAwal,
                    type: 'deposit',
                    source: 'initial',
                    note: `Setoran awal minggu ${formatDate(start)}`
                });
            }
            
            tx.oncomplete = () => {
                this.currentWeek = week;
                showToast('Minggu baru dimulai!', 'success');
                this.refreshDashboard();
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        });
    },

    async closeCurrentWeek() {
        if (!this.currentWeek) return;
        
        const week = this.currentWeek;
        const transactions = await Transactions.getByWeek(week.id);
        
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const totalAvailable = week.income + totalIncome;
        const totalRemaining = totalAvailable - totalExpense;
        
        const categorySummary = {};
        Object.keys(week.allocations).forEach(catName => {
            categorySummary[catName] = { spent: 0, total: week.allocations[catName] };
        });
        transactions.filter(t => t.type === 'expense').forEach(t => {
            if (categorySummary[t.category]) categorySummary[t.category].spent += t.amount;
        });

        const content = `
            <div class="sheet-header">
                <h3 class="sheet-title">Tutup Minggu</h3>
                <button class="sheet-close" onclick="hideSheet()">Batal</button>
            </div>
            <div class="sheet-content">
                <div class="card mb-md">
                    <div class="card-label">Ringkasan Sisa</div>
                    <div class="hero-amount" style="font-size: var(--font-size-xl)">${formatRupiah(totalRemaining)}</div>
                </div>
                
                <div class="categories-scroll mb-md">
                    ${Object.keys(categorySummary).map(name => `
                        <div class="category-item">
                            <div class="category-info">
                                <span class="category-name" style="text-transform: capitalize">${name}</span>
                                <span class="category-remaining">${formatRupiah(Math.max(0, categorySummary[name].total - categorySummary[name].spent))}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="form-group">
                    <label class="setting-item" style="padding: 12px; margin-bottom: 0;">
                        <span class="setting-label">Pindahkan sisa ke tabungan?</span>
                        <input type="checkbox" id="save-remaining" checked style="width: 20px; height: 20px;">
                    </label>
                </div>
                
                <button id="btn-finalize-close" class="button primary full mt-md">Tutup Minggu & Mulai Baru</button>
            </div>
        `;
        
        showSheet(content);
        
        document.getElementById('btn-finalize-close').addEventListener('click', async () => {
            const shouldSave = document.getElementById('save-remaining').checked;
            
            // Atomic closing & savings operation
            await new Promise((resolve, reject) => {
                const tx = DB.db.transaction(['weeks', 'savings'], 'readwrite');
                const weeksStore = tx.objectStore('weeks');
                const savingsStore = tx.objectStore('savings');
                
                if (shouldSave && totalRemaining > 0) {
                    savingsStore.put({
                        id: generateId(),
                        date: new Date().toISOString(),
                        amount: totalRemaining,
                        type: 'deposit',
                        source: 'remaining',
                        note: `Sisa anggaran minggu ${formatDate(week.startDate)}`
                    });
                }
                
                week.status = 'closed';
                week.closedAt = new Date().toISOString();
                weeksStore.put(week);
                
                tx.oncomplete = resolve;
                tx.onerror = reject;
            });
            
            this.currentWeek = null;
            document.getElementById('week-banner').classList.add('hidden');
            hideSheet();
            showToast('Minggu berhasil ditutup', 'success');
            
            // Automatically prompt start new week sheet
            this.showNewWeekSheet();
            this.refreshDashboard();
        });
    }
};

// Global action listeners
document.addEventListener('click', e => {
    if (e.target.dataset.action === 'close-week') {
        Budget.closeCurrentWeek();
    }
});
