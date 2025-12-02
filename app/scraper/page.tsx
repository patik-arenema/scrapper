'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Listing, Platform, City, ScrapeHistory } from '@/types/types';
import { saveScrapeHistory } from '@/lib/storage';
import ListingCard from '@/components/ListingCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ScrapeHistoryComponent from '@/components/ScrapeHistory';
import Link from 'next/link';

function ScraperContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const platform = (searchParams.get('platform') || 'airbnb') as Platform;

    const [city, setCity] = useState<City>('Senegal');
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasScraped, setHasScraped] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 18;
    const [error, setError] = useState<string | null>(null);

    const cities: City[] = ['Senegal'];

    const handleScrape = async () => {
        setLoading(true);
        setHasScraped(false);
        setError(null);

        try {
            let results: Listing[] = [];

            // Always use real scraper for Airbnb + Senegal
            if (platform === 'airbnb' && city === 'Senegal') {
                console.log('Fetching real Airbnb data for Senegal...');

                const allListings: Listing[] = [];
                let cursor: string | null = null;
                const maxPages = 20; // Increased to cover all 15 pages

                for (let page = 0; page < maxPages; page++) {
                    console.log(`Fetching page ${page + 1}/${maxPages}...`);

                    const response = await fetch('/api/scrape', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            location: 'Senegal',
                            cursor: cursor,
                        }),
                    });

                    const apiData: { success: boolean; error?: string; data?: any } = await response.json();

                    if (!apiData.success) {
                        throw new Error(apiData.error || 'Failed to fetch data');
                    }

                    // Parse the Airbnb API response
                    const searchResults = apiData.data?.data?.presentation?.staysSearch?.results?.searchResults || [];

                    searchResults.forEach((result: any) => {
                        try {
                            // Extract price from structuredDisplayPrice
                            // Handle both DiscountedDisplayPriceLine (has discountedPrice) and QualifiedDisplayPriceLine (has price)
                            const primaryLine = result.structuredDisplayPrice?.primaryLine;
                            const priceText = primaryLine?.discountedPrice || primaryLine?.price || '$0';
                            const priceMatch = priceText.match(/[\d,]+/);
                            const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;

                            // Extract images from contextualPictures
                            const images = result.contextualPictures?.map((p: any) => p.picture) || [];

                            // Extract location from title or subtitle
                            const location = result.title || 'Senegal';

                            // Extract title from subtitle (property name)
                            const title = result.subtitle || result.nameLocalized?.localizedStringWithTranslationPreference || `Listing`;

                            // Get listing ID
                            const listingId = result.demandStayListing?.id || `listing-${Math.random()}`;

                            if (price > 0 && title) {
                                allListings.push({
                                    id: `airbnb-${listingId}`,
                                    title,
                                    price,
                                    images: images.length > 0 ? images : [],
                                    location,
                                    description: title,
                                    platform: 'airbnb',
                                    amenities: [],
                                    url: `https://www.airbnb.com/rooms/${listingId}`,
                                });
                            }
                        } catch (err) {
                            console.error('Error parsing listing:', err);
                        }
                    });

                    // Check for next page
                    const paginationInfo = apiData.data?.data?.presentation?.staysSearch?.paginationInfo;
                    console.log('Pagination Info:', {
                        hasNextPage: paginationInfo?.hasNextPage,
                        nextPageCursor: paginationInfo?.nextPageCursor,
                        currentResultsCount: searchResults.length,
                        totalListingsSoFar: allListings.length
                    });

                    if (paginationInfo?.hasNextPage && paginationInfo.nextPageCursor) {
                        cursor = paginationInfo.nextPageCursor;
                        console.log(`✅ Moving to next page with cursor: ${cursor ? cursor.substring(0, 20) : 'null'}...`);
                    } else if (searchResults.length >= 18) {
                        // Fallback: Manually construct cursor if we got a full page but no cursor from API
                        // Pattern: {"section_offset":0,"items_offset":18,"version":1}
                        const nextOffset = (page + 1) * 18;
                        const cursorObj = {
                            section_offset: 0,
                            items_offset: nextOffset,
                            version: 1
                        };
                        // Simple btoa implementation for client-side
                        cursor = typeof window !== 'undefined' ? window.btoa(JSON.stringify(cursorObj)) : Buffer.from(JSON.stringify(cursorObj)).toString('base64');
                        console.log(`⚠️ API didn't return cursor. Using manual cursor for offset ${nextOffset}: ${cursor}`);
                    } else {
                        console.log('❌ No more pages available');
                        break;
                    }

                    // Small delay between requests
                    await new Promise(resolve => setTimeout(resolve, 300));
                }

                results = allListings;
                console.log(`Fetched ${results.length} total listings from Airbnb API`);
            }

            setListings(results);
            setHasScraped(true);
            setCurrentPage(1); // Reset to first page on new scrape

            // Save to history
            const history: ScrapeHistory = {
                id: Date.now().toString(),
                platform,
                city,
                resultsCount: results.length,
                scrapedAt: new Date().toISOString()
            };
            saveScrapeHistory(history);

            // Trigger re-render of history component
            window.dispatchEvent(new Event('storage'));
        } catch (error: any) {
            console.error('Scrape error:', error);
            setError(error.message || 'Failed to scrape data');
        } finally {
            setLoading(false);
        }
    };

    const platformName = platform === 'airbnb' ? 'Airbnb' : 'Facebook Marketplace';
    const platformColor = platform === 'airbnb' ? 'rose' : 'blue';

    // Pagination calculations
    const totalPages = Math.ceil(listings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentListings = listings.slice(startIndex, endIndex);

    console.log('Pagination Debug:', {
        totalListings: listings.length,
        itemsPerPage,
        totalPages,
        currentPage,
        startIndex,
        endIndex,
        currentListingsCount: currentListings.length
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block">
                                ← Back to Home
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {platformName} Scraper
                            </h1>
                        </div>
                        <div className={`px-4 py-2 rounded-lg bg-${platformColor}-100 text-${platformColor}-700 font-semibold`}>
                            {platformName}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Scraper Controls */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Scraper Settings
                            </h2>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select City
                                </label>
                                <select
                                    value={city}
                                    onChange={(e) => setCity(e.target.value as City)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={loading}
                                >
                                    {cities.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleScrape}
                                disabled={loading}
                                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : `bg-${platformColor}-600 hover:bg-${platformColor}-700`
                                    } ${platform === 'airbnb' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {loading ? 'Scraping Live Data...' : 'Start Scrape'}
                            </button>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800 font-medium">
                                        ❌ Error: {error}
                                    </p>
                                </div>
                            )}

                            {hasScraped && !loading && !error && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800 font-medium">
                                        ✓ Found {listings.length} listings in {city}
                                        {city === 'Senegal' && ' (Real-time data)'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Scrape History */}
                        <ScrapeHistoryComponent key={hasScraped ? 'updated' : 'initial'} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {loading && <LoadingSpinner />}

                        {!loading && listings.length === 0 && !hasScraped && (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Ready to Scrape
                                </h3>
                                <p className="text-gray-600">
                                    Select a city and click "Start Scrape" to begin
                                </p>
                            </div>
                        )}

                        {!loading && listings.length > 0 && (
                            <div>
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Results for {city}
                                        </h2>
                                        <p className="text-gray-600">
                                            Showing {startIndex + 1}-{Math.min(endIndex, listings.length)} of {listings.length} listings
                                        </p>
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 1
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                ← Previous
                                            </button>
                                            <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === totalPages
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {currentListings.map((listing) => (
                                        <ListingCard key={listing.id} listing={listing} />
                                    ))}
                                </div>

                                {/* Bottom Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 1
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            ← Previous
                                        </button>
                                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === totalPages
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            Next →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ScraperPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ScraperContent />
        </Suspense>
    );
}
