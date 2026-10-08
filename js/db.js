/**
 * UANK - Database Management
 * Wrapper for IndexedDB
 */

const DB_NAME = 'uank_db';
const DB_VERSION = 1;

const DB = {
    db: null,

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Settings: { id, theme, weekStartDay, budgetTemplate }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'id' });
                }

                // Weeks: { id, startDate, endDate, income, status, allocations, closedAt }
                if (!db.objectStoreNames.contains('weeks')) {
                    db.createObjectStore('weeks', { keyPath: 'id' });
                }

                // Transactions: { id, weekId, date, type, amount, category, note, createdAt }
                if (!db.objectStoreNames.contains('transactions')) {
                    const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
                    txStore.createIndex('weekId', 'weekId', { unique: false });
                    txStore.createIndex('date', 'date', { unique: false });
                }

                // Categories: { id, name, type, percentage }
                if (!db.objectStoreNames.contains('categories')) {
                    db.createObjectStore('categories', { keyPath: 'id' });
                }

                // Savings: { id, date, amount, type, source, note }
                if (!db.objectStoreNames.contains('savings')) {
                    const savingsStore = db.createObjectStore('savings', { keyPath: 'id' });
                    savingsStore.createIndex('date', 'date', { unique: false });
                }
            };

            request.onsuccess = async (event) => {
                this.db = event.target.result;
                await this.seedDefaultData();
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async put(storeName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async query(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async seedDefaultData() {
        const categories = await this.getAll('categories');
        if (categories.length === 0) {
            const defaultCategories = [
                { id: 'kebutuhan', name: 'Kebutuhan', type: 'expense', percentage: 55 },
                { id: 'keinginan', name: 'Keinginan', type: 'expense', percentage: 20 },
                { id: 'tabungan', name: 'Tabungan', type: 'expense', percentage: 15 },
                { id: 'dana-cadangan', name: 'Dana Cadangan', type: 'expense', percentage: 10 },
                { id: 'gaji', name: 'Gaji', type: 'income', percentage: 0 },
                { id: 'bonus', name: 'Bonus & Lainnya', type: 'income', percentage: 0 }
            ];

            for (const cat of defaultCategories) {
                await this.put('categories', cat);
            }
        }
    }
};
