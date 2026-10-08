/**
 * UANK - Main Application Controller
 * Handles navigation and app initialization
 */

// ========================================
// App State
// ========================================

const App = {
    currentPage: 'home',
    db: null,
    currentWeek: null,
    settings: {
        theme: 'auto',
        weekStartDay: 1, // 0 = Sunday, 1 = Monday
        budgetTemplate: {
            kebutuhan: 55,
            keinginan: 20,
            tabungan: 15,
            danaCadangan: 10
        }
    }
};

// ========================================
// Navigation
// ========================================

function initNavigation() {
    // Tab bar navigation
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPage = tab.dataset.tab;
            navigateTo(targetPage);
        });
    });
    
    // Text links with data-nav
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.nav;
            navigateTo(target);
        });
    });
    
    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // FAB - Add Transaction
    const fabAdd = document.getElementById('fab-add');
    if (fabAdd) {
        fabAdd.addEventListener('click', () => {
            Transactions.showAddSheet();
        });
    }
}

function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
        App.currentPage = page;
    }
    
    // Update tab bar
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === page);
    });
    
    // Refresh page data
    refreshPageData(page);
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function refreshPageData(page) {
    switch (page) {
        case 'home':
            Budget.refreshDashboard();
            break;
        case 'transactions':
            Transactions.refreshList();
            break;
        case 'savings':
            Savings.refreshPage();
            break;
        case 'analysis':
            Reports.refreshPage();
            break;
        case 'settings':
            Settings.refreshPage();
            break;
    }
}

// ========================================
// Utility Functions (moved to js/utils.js)
// ========================================

// ========================================
// Initialization
// ========================================

async function initApp() {
    console.log('Initializing UANK...');
    
    // Initialize theme
    initTheme();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize database
    try {
        await DB.init();
        console.log('Database initialized');
        
        // Load settings
        await Settings.load();
        
        // Check current week status
        await Budget.checkWeekStatus();
        
        // Refresh dashboard
        await Budget.refreshDashboard();
        
    } catch (error) {
        console.error('Database initialization failed:', error);
        showToast('Gagal memuat database', 'error');
    }
    
    console.log('UANK ready');
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
