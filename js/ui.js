/**
 * UANK - UI Helpers
 * Reusable UI components and rendering logic
 */

const UI = {
    renderCategoryItem(category, spent, total) {
        const percentage = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
        const remaining = total - spent;
        
        return `
            <div class="category-item" data-id="${category.id}">
                <div class="category-info">
                    <span class="category-name">${category.name}</span>
                    <span class="category-remaining">${formatRupiah(remaining)}</span>
                </div>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    },

    renderTransactionItem(tx) {
        const isIncome = tx.type === 'income';
        const amountClass = isIncome ? 'income' : '';
        const iconClass = isIncome ? 'income' : '';
        const prefix = isIncome ? '+' : '-';
        
        return `
            <div class="transaction-item" onclick="Transactions.showEditSheet('${tx.id}')">
                <div class="transaction-icon ${iconClass}">
                    ${isIncome ? 
                        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>' : 
                        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>'
                    }
                </div>
                <div class="transaction-details">
                    <div class="transaction-category">${tx.category}</div>
                    <div class="transaction-meta">${formatTimeAgo(tx.date)}${tx.note ? ` • ${tx.note}` : ''}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${prefix}${formatRupiah(tx.amount)}
                </div>
            </div>
        `;
    },

    renderHistoryItem(item) {
        const isDeposit = item.type === 'deposit';
        const iconClass = isDeposit ? 'deposit' : 'withdrawal';
        const amountClass = isDeposit ? 'deposit' : 'withdrawal';
        const prefix = isDeposit ? '+' : '-';
        
        let sourceLabel = '';
        switch(item.source) {
            case 'initial': sourceLabel = 'Setoran Awal'; break;
            case 'remaining': sourceLabel = 'Sisa Anggaran'; break;
            case 'manual': sourceLabel = 'Setoran Manual'; break;
            case 'withdrawal': sourceLabel = 'Penarikan'; break;
            default: sourceLabel = item.note || 'Transaksi Tabungan';
        }

        return `
            <div class="history-item">
                <div class="history-icon ${iconClass}">
                    ${isDeposit ? 
                        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>' : 
                        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
                    }
                </div>
                <div class="history-details">
                    <div class="history-source">${sourceLabel}</div>
                    <div class="history-date">${formatDate(item.date)}</div>
                </div>
                <div class="history-amount ${amountClass}">
                    ${prefix}${formatRupiah(item.amount)}
                </div>
            </div>
        `;
    }
};
