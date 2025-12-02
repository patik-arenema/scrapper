import { ScrapeHistory } from '@/types/types';

const STORAGE_KEY = 'scrape-history';

export const getScrapeHistory = (): ScrapeHistory[] => {
    if (typeof window === 'undefined') return [];

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading scrape history:', error);
        return [];
    }
};

export const saveScrapeHistory = (history: ScrapeHistory): void => {
    if (typeof window === 'undefined') return;

    try {
        const existing = getScrapeHistory();
        const updated = [history, ...existing].slice(0, 10); // Keep last 10
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Error saving scrape history:', error);
    }
};

export const clearScrapeHistory = (): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing scrape history:', error);
    }
};
