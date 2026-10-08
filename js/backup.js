/**
 * UANK - Backup & Restore
 */

const Backup = {
    async exportData() {
        const data = {
            settings: await DB.getAll('settings'),
            weeks: await DB.getAll('weeks'),
            transactions: await DB.getAll('transactions'),
            categories: await DB.getAll('categories'),
            savings: await DB.getAll('savings'),
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uank_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('Data berhasil diekspor', 'success');
    },

    async importData(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.version || !data.transactions) {
                    throw new Error('Format file tidak valid');
                }
                
                showModal({
                    title: 'Impor Data',
                    message: 'Seluruh data saat ini akan ditimpa. Lanjutkan?',
                    confirmText: 'Timpa Data',
                    danger: true,
                    onConfirm: async () => {
                        // Clear existing
                        await DB.clear('settings');
                        await DB.clear('weeks');
                        await DB.clear('transactions');
                        await DB.clear('categories');
                        await DB.clear('savings');
                        
                        // Import new
                        for (const item of data.settings) await DB.put('settings', item);
                        for (const item of data.weeks) await DB.put('weeks', item);
                        for (const item of data.transactions) await DB.put('transactions', item);
                        for (const item of data.categories) await DB.put('categories', item);
                        for (const item of data.savings) await DB.put('savings', item);
                        
                        showToast('Data berhasil diimpor', 'success');
                        setTimeout(() => window.location.reload(), 1000);
                    }
                });
            } catch (err) {
                console.error(err);
                showToast('Gagal impor data: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    }
};

// Listeners
document.addEventListener('DOMContentLoaded', () => {
    const btnExport = document.getElementById('btn-export');
    if (btnExport) btnExport.addEventListener('click', () => Backup.exportData());
    
    const btnImport = document.getElementById('btn-import');
    const importFile = document.getElementById('import-file');
    if (btnImport && importFile) {
        btnImport.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                Backup.importData(e.target.files[0]);
                e.target.value = ''; // Reset for next selection
            }
        });
    }
});
