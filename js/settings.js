/**
 * UANK - Settings Management
 */

const Settings = {
    async load() {
        const settings = await DB.get('settings', 'main');
        if (settings) {
            App.settings = { ...App.settings, ...settings };
        } else {
            // First time setup
            await this.save();
        }
        
        // Set UI values
        const themeSelect = document.getElementById('theme-select');
        const weekStartSelect = document.getElementById('week-start-select');
        
        if (themeSelect) themeSelect.value = App.settings.theme;
        if (weekStartSelect) weekStartSelect.value = App.settings.weekStartDay;
    },

    async save() {
        await DB.put('settings', {
            id: 'main',
            theme: App.settings.theme,
            weekStartDay: App.settings.weekStartDay,
            budgetTemplate: App.settings.budgetTemplate
        });
    },

    getCategories() {
        // Return category names from template + default ones
        return Object.keys(App.settings.budgetTemplate).map(name => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            id: name
        }));
    },

    refreshPage() {
        this.load();
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            setTheme(e.target.value);
            Settings.save();
        });
    }
    
    const weekStartSelect = document.getElementById('week-start-select');
    if (weekStartSelect) {
        weekStartSelect.addEventListener('change', (e) => {
            App.settings.weekStartDay = parseInt(e.target.value);
            Settings.save();
            Budget.refreshDashboard(); // Refresh because week period might change
        });
    }
    
    const btnTemplate = document.getElementById('btn-template');
    if (btnTemplate) {
        btnTemplate.addEventListener('click', () => {
            const template = App.settings.budgetTemplate;
            const content = `
                <div class="sheet-header">
                    <h3 class="sheet-title">Template Anggaran (%)</h3>
                    <button class="sheet-close" onclick="hideSheet()">Batal</button>
                </div>
                <div class="sheet-content">
                    <form id="form-template">
                        ${Object.entries(template).map(([name, val]) => `
                            <div class="form-group">
                                <label class="form-label" style="text-transform: capitalize">${name}</label>
                                <input type="number" name="${name}" class="form-input" value="${val}" min="0" max="100">
                            </div>
                        `).join('')}
                        <div id="template-total" class="text-secondary text-center mb-md">Total: 100%</div>
                        <button type="submit" class="button primary full">Simpan Template</button>
                    </form>
                </div>
            `;
            
            showSheet(content);
            
            const form = document.getElementById('form-template');
            const totalDisplay = document.getElementById('template-total');
            
            const calculateTotal = () => {
                const formData = new FormData(form);
                let total = 0;
                for (let [name, value] of formData.entries()) {
                    total += parseInt(value) || 0;
                }
                totalDisplay.textContent = `Total: ${total}%`;
                totalDisplay.style.color = total === 100 ? 'var(--color-success)' : 'var(--color-danger)';
                return total;
            };
            
            form.addEventListener('input', calculateTotal);
            calculateTotal();
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (calculateTotal() !== 100) {
                    showToast('Total persentase harus 100%', 'error');
                    return;
                }
                
                const formData = new FormData(form);
                const newTemplate = {};
                for (let [name, value] of formData.entries()) {
                    newTemplate[name] = parseInt(value);
                }
                
                App.settings.budgetTemplate = newTemplate;
                await Settings.save();
                hideSheet();
                showToast('Template diperbarui', 'success');
            });
        });
    }

    const btnNewWeek = document.getElementById('btn-new-week');
    if (btnNewWeek) btnNewWeek.addEventListener('click', () => Budget.showNewWeekSheet());
    
    const btnCloseWeek = document.getElementById('btn-close-week');
    if (btnCloseWeek) btnCloseWeek.addEventListener('click', () => Budget.closeCurrentWeek());
});
