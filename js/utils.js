/**
 * UANK - Utility Functions
 * Core utilities for formatting, calculation, and data handling
 */

// ========================================
// Currency Formatting (Rupiah - Integer Only)
// ========================================

/**
 * Format rupiah dari integer ke string dengan format "Rp350.000"
 * Tidak ada desimal, gunakan separator titik untuk ribuan
 */
function formatRupiah(amount) {
    // Ensure integer (remove any decimals)
    const intAmount = Math.floor(Math.abs(amount));
    
    // Manual formatting with dot separator for thousands
    const formatted = intAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `Rp${formatted}`;
}

/**
 * Parse string rupiah (dengan atau tanpa prefix) ke integer
 * Contoh: "Rp350.000" atau "350000" atau 350000
 */
function parseRupiah(value) {
    if (value === null || value === undefined || value === '') return 0;
    
    if (typeof value === 'number') return Math.floor(value);
    
    // Remove "Rp", dots, spaces, and commas
    const cleaned = value.toString().replace(/[Rp.\s,]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Math.floor(num);
}

/**
 * Calculate budget allocation with fair rounding
 * Ensures total equals 100% and handles remainder
 * 
 * @param {number} totalAmount - Total budget in rupiah
 * @param {object} percentages - Key: category name, Value: percentage (0-100)
 * @returns {object} - Key: category name, Value: allocated amount
 */
function calculateBudgetAllocation(totalAmount, percentages) {
    const result = {};
    let totalAllocated = 0;
    let lastCategory = null;
    let lastCategoryAmount = 0;
    
    const entries = Object.entries(percentages);
    
    // Sort entries to process non-last categories first
    // Default last category is 'kebutuhan' as it's usually the largest
    const sortedEntries = [...entries].sort((a, b) => {
        if (a[0] === 'kebutuhan') return 1;
        if (b[0] === 'kebutuhan') return -1;
        return 0;
    });
    
    lastCategory = sortedEntries[sortedEntries.length - 1][0];
    
    for (const [name, percentage] of sortedEntries) {
        if (name === lastCategory) {
            // Last category gets the remainder
            result[name] = Math.floor(totalAmount - totalAllocated);
        } else {
            const calculated = Math.floor((totalAmount * percentage) / 100);
            result[name] = calculated;
            totalAllocated += calculated;
        }
    }
    
    return result;
}

/**
 * Calculate budget allocation with standard rounding
 * Last category gets the remainder after all others are calculated
 */
function calculateBudgetStandard(totalAmount, percentages) {
    const result = {};
    let totalAllocated = 0;
    let lastCategory = null;
    
    const entries = Object.entries(percentages);
    
    // Find last category (not kebutuhan if others exist)
    const nonKebutuhan = entries.filter(([name]) => name !== 'kebutuhan');
    lastCategory = nonKebutuhan.length > 0 
        ? nonKebutuhan[nonKebutuhan.length - 1][0] 
        : entries[0][0];
    
    for (const [name, percentage] of entries) {
        if (name === lastCategory) {
            // Last category gets remaining amount
            result[name] = Math.floor(totalAmount - totalAllocated);
        } else {
            const calculated = Math.floor((totalAmount * percentage) / 100);
            result[name] = calculated;
            totalAllocated += calculated;
        }
    }
    
    return result;
}

/**
 * Format input number dengan titik pemisah ribuan saat mengetik
 * @param {HTMLInputElement} input - Input element
 */
function formatInputRupiah(input) {
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    if (value) {
        value = parseInt(value, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    input.value = value;
}

/**
 * Setup auto-formatting untuk input numeric
 */
function setupRupiahInput(selector) {
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll(selector).forEach(input => {
            input.addEventListener('input', () => formatInputRupiah(input));
        });
    });
}

/**
 * Get week period based on week start day setting
 * @returns {object} { start: Date, end: Date }
 */
function getWeekPeriod(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Adjust for different week start days
    const weekStartDay = App.settings.weekStartDay; // 0 = Sunday, 1 = Monday
    
    let diff;
    if (weekStartDay === 0) {
        // Week starts on Sunday
        diff = d.getDate() - day;
    } else {
        // Week starts on Monday
        diff = d.getDate() - day + (day === 0 ? -6 : 1);
    }
    
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
}

/**
 * Generate unique week ID based on start and end dates
 * Format: YYYY-MM-DD_YYYY-MM-DD
 */
function getWeekId(date = new Date()) {
    const { start, end } = getWeekPeriod(date);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    return `${startStr}_${endStr}`;
}

/**
 * Format date to Indonesian format
 * Example: "6 Okt 2024"
 */
function formatDate(date) {
    const d = new Date(date);
    const options = { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' };
    return new Intl.DateTimeFormat('id-ID', options).format(d);
}

/**
 * Get relative time from now
 * Example: "2 jam lalu", "5 menit lalu"
 */
function formatTimeAgo(date) {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    
    if (diffMs < 0) return 'Baru saja';
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) return 'Baru saja';
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return formatDate(date);
}

// ========================================
// ID Generation
// ========================================

/**
 * Generate unique ID
 * Format: timestamp_base36 + random_base36
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
}

// ========================================
// Theme Management
// ========================================

function initTheme() {
    const savedTheme = localStorage.getItem('uank-theme') || 'auto';
    App.settings.theme = savedTheme;
    applyTheme(savedTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (App.settings.theme === 'auto') {
            applyTheme('auto');
        }
    });
}

function applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        root.setAttribute('data-theme', theme);
    }
}

function toggleTheme() {
    const themes = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(App.settings.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
}

function setTheme(theme) {
    App.settings.theme = theme;
    localStorage.setItem('uank-theme', theme);
    applyTheme(theme);
}

// ========================================
// Modal Management
// ========================================

function showModal(options) {
    const { title, message, confirmText = 'OK', cancelText = 'Batal', onConfirm, onCancel, danger = false } = options;
    
    const modal = document.createElement('div');
    modal.className = 'modal hidden';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="modal-button cancel">${cancelText}</button>
                <button class="modal-button confirm ${danger ? 'danger' : ''}">${confirmText}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.offsetHeight;
    
    modal.classList.remove('hidden');
    modal.classList.add('active');
    
    modal.querySelector('.cancel').addEventListener('click', () => {
        closeModal(modal);
        if (onCancel) onCancel();
    });
    
    modal.querySelector('.confirm').addEventListener('click', () => {
        closeModal(modal);
        if (onConfirm) onConfirm();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
            if (onCancel) onCancel();
        }
    });
}

function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 200);
}

// ========================================
// Toast Notifications
// ========================================

function showToast(message, type = 'default', duration = 3000) {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ========================================
// Bottom Sheet Management
// ========================================

function showSheet(content) {
    const overlay = document.getElementById('sheet-overlay');
    const container = document.getElementById('sheet-container');
    
    container.innerHTML = `
        <div class="sheet-handle"></div>
        ${content}
    `;
    
    overlay.classList.remove('hidden');
    container.classList.remove('hidden');
    
    container.offsetHeight;
    
    overlay.classList.add('active');
    container.classList.add('active');
    
    overlay.onclick = () => hideSheet();
    
    document.body.style.overflow = 'hidden';
}

function hideSheet() {
    const overlay = document.getElementById('sheet-overlay');
    const container = document.getElementById('sheet-container');
    
    overlay.classList.remove('active');
    container.classList.remove('active');
    
    setTimeout(() => {
        overlay.classList.add('hidden');
        container.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300);
}
