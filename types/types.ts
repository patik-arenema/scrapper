export type Platform = 'airbnb' | 'marketplace';

export interface Listing {
    id: string;
    title: string;
    price: number;
    images: string[];
    location: string;
    description: string;
    platform: Platform;
    amenities?: string[];
    condition?: string;
    category?: string;
    url?: string;
}

export interface ScrapeHistory {
    id: string;
    platform: Platform;
    city: string;
    resultsCount: number;
    scrapedAt: string;
}

export type City = 'Senegal';
