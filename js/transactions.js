/**
 * UANK - Transactions Management
 */

const Transactions = {
    async getAll() {
        return await DB.getAll('transactions');
    },

    async getByWeek(weekId) {
        return await DB.query('transactions', 'weekId', weekId);
    },

    async refreshList() {
        const listContainer = document.getElementById('all-transactions');
        const filter = document.querySelector('.filter-tab.active').dataset.filter;
        
        let transactions = await this.getAll();
        
        // Sort by date desc
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filter !== 'all') {
            transactions = transactions.filter(tx => tx.type === filter);
        }
        
        if (transactions.length === 0) {
            listContainer.innerHTML = '<div class="empty-state"><p>Belum ada transaksi</p></div>';
            return;
        }
        
        listContainer.innerHTML = transactions.map(tx => UI.renderTransactionItem(tx)).join('');
    },

    async showAddSheet() {
        const categories = await DB.getAll('categories');
        const categoryOptions = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        
        const content = `
            <div class="sheet-header">
                <h3 class="sheet-title">Tambah Transaksi</h3>
                <button class="sheet-close" onclick="hideSheet()">Batal</button>
            </div>
            <div class="sheet-content">
                <form id="form-transaction">
                    <div class="form-group">
                        <label class="form-label">Nominal</label>
                        <input type="number" id="tx-amount" class="form-input numeric" placeholder="0" required autofocus>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Jenis</label>
                        <div class="toggle-group" id="tx-type-toggle">
                            <button type="button" class="toggle-option active" data-value="expense">Pengeluaran</button>
                            <button type="button" class="toggle-option" data-value="income">Pemasukan</button>
                        </div>
                        <input type="hidden" id="tx-type" value="expense">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Kategori</label>
                        <select id="tx-category" class="form-select">
                            ${categoryOptions}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Catatan (Opsional)</label>
                        <input type="text" id="tx-note" class="form-input" placeholder="Misal: Makan siang">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tanggal</label>
                        <input type="date" id="tx-date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <button type="submit" class="button primary full mt-md">Simpan Transaksi</button>
                </form>
            </div>
        `;
        
        showSheet(content);
        
        // Handle toggle
        const toggleOptions = document.querySelectorAll('#tx-type-toggle .toggle-option');
        toggleOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                toggleOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                document.getElementById('tx-type').value = opt.dataset.value;
            });
        });
        
        // Handle submit
        document.getElementById('form-transaction').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = parseRupiah(document.getElementById('tx-amount').value);
            const type = document.getElementById('tx-type').value;
            const category = document.getElementById('tx-category').value;
            const note = document.getElementById('tx-note').value;
            const date = document.getElementById('tx-date').value;
            
            if (amount <= 0) {
                showToast('Nominal harus lebih dari 0', 'error');
                return;
            }
            
            const weekId = getWeekId(new Date(date));
            
            const tx = {
                id: generateId(),
                weekId,
                date: new Date(date).toISOString(),
                type,
                amount,
                category,
                note,
                createdAt: new Date().toISOString()
            };
            
            await DB.put('transactions', tx);
            hideSheet();
            showToast('Transaksi berhasil disimpan', 'success');
            
            // Refresh current view
            if (App.currentPage === 'home') Budget.refreshDashboard();
            if (App.currentPage === 'transactions') Transactions.refreshList();
        });
    },

    async showEditSheet(id) {
        const tx = await DB.get('transactions', id);
        if (!tx) return;
        
        const categories = await DB.getAll('categories');
        const categoryOptions = categories.map(c => 
            `<option value="${c.name}" ${c.name === tx.category ? 'selected' : ''}>${c.name}</option>`
        ).join('');
        
        const content = `
            <div class="sheet-header">
                <h3 class="sheet-title">Edit Transaksi</h3>
                <button class="sheet-close" onclick="hideSheet()">Batal</button>
            </div>
            <div class="sheet-content">
                <form id="form-edit-transaction">
                    <div class="form-group">
                        <label class="form-label">Nominal</label>
                        <input type="number" id="tx-amount" class="form-input numeric" value="${tx.amount}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Jenis</label>
                        <div class="toggle-group" id="tx-type-toggle">
                            <button type="button" class="toggle-option ${tx.type === 'expense' ? 'active' : ''}" data-value="expense">Pengeluaran</button>
                            <button type="button" class="toggle-option ${tx.type === 'income' ? 'active' : ''}" data-value="income">Pemasukan</button>
                        </div>
                        <input type="hidden" id="tx-type" value="${tx.type}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Kategori</label>
                        <select id="tx-category" class="form-select">
                            ${categoryOptions}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Catatan (Opsional)</label>
                        <input type="text" id="tx-note" class="form-input" value="${tx.note || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tanggal</label>
                        <input type="date" id="tx-date" class="form-input" value="${tx.date.split('T')[0]}">
                    </div>
                    
                    <div class="button-group" style="display: flex; gap: 10px;">
                        <button type="button" class="button danger full mt-md" id="btn-delete-tx">Hapus</button>
                        <button type="submit" class="button primary full mt-md">Update</button>
                    </div>
                </form>
            </div>
        `;
        
        showSheet(content);
        
        // Handle toggle
        const toggleOptions = document.querySelectorAll('#tx-type-toggle .toggle-option');
        toggleOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                toggleOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                document.getElementById('tx-type').value = opt.dataset.value;
            });
        });
        
        // Handle delete
        document.getElementById('btn-delete-tx').addEventListener('click', () => {
            showModal({
                title: 'Hapus Transaksi',
                message: 'Apakah Anda yakin ingin menghapus transaksi ini?',
                confirmText: 'Hapus',
                danger: true,
                onConfirm: async () => {
                    await DB.delete('transactions', id);
                    hideSheet();
                    showToast('Transaksi dihapus', 'success');
                    if (App.currentPage === 'home') Budget.refreshDashboard();
                    if (App.currentPage === 'transactions') Transactions.refreshList();
                }
            });
        });
        
        // Handle submit
        document.getElementById('form-edit-transaction').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = parseRupiah(document.getElementById('tx-amount').value);
            const type = document.getElementById('tx-type').value;
            const category = document.getElementById('tx-category').value;
            const note = document.getElementById('tx-note').value;
            const date = document.getElementById('tx-date').value;
            
            const weekId = getWeekId(new Date(date));
            
            const updatedTx = {
                ...tx,
                weekId,
                date: new Date(date).toISOString(),
                type,
                amount,
                category,
                note,
                updatedAt: new Date().toISOString()
            };
            
            await DB.put('transactions', updatedTx);
            hideSheet();
            showToast('Transaksi diperbarui', 'success');
            
            if (App.currentPage === 'home') Budget.refreshDashboard();
            if (App.currentPage === 'transactions') Transactions.refreshList();
        });
    }
};

// Initial filter tabs setup
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const parent = tab.parentElement;
            parent.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (App.currentPage === 'transactions') Transactions.refreshList();
        });
    });
});
