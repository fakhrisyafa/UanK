/**
 * UANK - Savings Management
 */

const Savings = {
    async getAll() {
        const history = await DB.getAll('savings');
        return history.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    async getTotal() {
        const history = await DB.getAll('savings');
        return history.reduce((sum, item) => {
            return item.type === 'deposit' ? sum + item.amount : sum - item.amount;
        }, 0);
    },

    async add(data) {
        const entry = {
            id: generateId(),
            date: new Date().toISOString(),
            amount: data.amount,
            type: data.type,
            source: data.source || 'manual',
            note: data.note || ''
        };
        await DB.put('savings', entry);
        return entry;
    },

    async updateSummary() {
        const total = await this.getTotal();
        const elements = ['total-savings', 'savings-total', 'savings-main-amount'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = formatRupiah(total);
        });
    },

    async refreshPage() {
        await this.updateSummary();
        const listContainer = document.getElementById('savings-history');
        const history = await this.getAll();
        
        if (history.length === 0) {
            listContainer.innerHTML = '<div class="empty-state"><p>Belum ada riwayat tabungan</p></div>';
            return;
        }
        
        listContainer.innerHTML = history.map(item => UI.renderHistoryItem(item)).join('');
    },

    showWithdrawSheet() {
        const content = `
            <div class="sheet-header">
                <h3 class="sheet-title">Tarik Tabungan</h3>
                <button class="sheet-close" onclick="hideSheet()">Batal</button>
            </div>
            <div class="sheet-content">
                <form id="form-withdraw">
                    <div class="form-group">
                        <label class="form-label">Nominal Penarikan</label>
                        <input type="text" id="withdraw-amount" class="form-input numeric" placeholder="0" autofocus required inputmode="numeric">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Catatan (Wajib)</label>
                        <input type="text" id="withdraw-note" class="form-input" placeholder="Misal: Keperluan mendesak" required>
                    </div>
                    <button type="submit" class="button danger full mt-md">Tarik Sekarang</button>
                </form>
            </div>
        `;
        
        showSheet(content);
        
        // Auto-format numeric input
        const inputAmount = document.getElementById('withdraw-amount');
        inputAmount.addEventListener('input', () => formatInputRupiah(inputAmount));
        
        document.getElementById('form-withdraw').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = parseRupiah(document.getElementById('withdraw-amount').value);
            const note = document.getElementById('withdraw-note').value.trim();
            const currentTotal = await this.getTotal();
            
            if (amount <= 0) {
                showToast('Nominal harus lebih dari 0', 'error');
                return;
            }
            
            if (!note) {
                showToast('Catatan penarikan wajib diisi', 'error');
                return;
            }
            
            if (amount > currentTotal) {
                showToast('Saldo tabungan tidak cukup', 'error');
                return;
            }
            
            // Double confirmation modal
            showModal({
                title: 'Konfirmasi Penarikan Tabungan',
                message: `Anda akan menarik tabungan sebesar ${formatRupiah(amount)} untuk '${note}'. Lanjutkan?`,
                confirmText: 'Ya, Tarik Saldo',
                cancelText: 'Batal',
                danger: true,
                onConfirm: async () => {
                    await this.add({
                        amount,
                        type: 'withdrawal',
                        source: 'manual',
                        note: note
                    });
                    
                    hideSheet();
                    showToast('Penarikan berhasil dicatat', 'success');
                    this.refreshPage();
                }
            });
        });
    }
};

// Listeners
document.addEventListener('DOMContentLoaded', () => {
    const btnWithdraw = document.getElementById('btn-withdraw');
    if (btnWithdraw) {
        btnWithdraw.addEventListener('click', () => Savings.showWithdrawSheet());
    }
});
