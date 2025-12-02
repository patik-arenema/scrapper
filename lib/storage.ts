import { ScrapeHistory, Listing } from '@/types/types';

const STORAGE_KEY = 'scrape-history';
const LISTINGS_KEY = 'scrape-listings';

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

// Listings storage functions
export const getListings = (): Listing[] => {
    if (typeof window === 'undefined') return [];

    try {
        const data = localStorage.getItem(LISTINGS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading listings:', error);
        return [];
    }
};

export const saveListings = (listings: Listing[]): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
    } catch (error) {
        console.error('Error saving listings:', error);
    }
};

export const getListingById = (id: string): Listing | null => {
    const listings = getListings();
    return listings.find(listing => listing.id === id) || null;
};
