import { Listing } from '@/types/types';

export interface ApiScrapeResult {
    success: boolean;
    listings: Listing[];
    error?: string;
    totalCount?: number;
}

interface AirbnbApiResponse {
    data: {
        presentation: {
            staysSearch: {
                results: {
                    searchResults: Array<{
                        listing: {
                            id: string;
                            name: string;
                            avgRating?: number;
                            contextualPictures?: Array<{
                                picture: string;
                            }>;
                            formattedBadges?: Array<any>;
                            listingObjType?: string;
                            pdpUrlType?: string;
                            roomTypeCategory?: string;
                            structuredContent?: {
                                primaryLine?: Array<{ text: string }>;
                                secondaryLine?: Array<{ text: string }>;
                            };
                        };
                        pricingQuote?: {
                            structuredStayDisplayPrice?: {
                                primaryLine?: {
                                    price?: string;
                                    qualifier?: string;
                                };
                            };
                        };
                    }>;
                };
                paginationInfo?: {
                    hasNextPage: boolean;
                    nextPageCursor?: string;
                };
            };
        };
    };
}

export async function scrapeAirbnbApi(
    placeId: string = 'ChIJcbvFs_VywQ4RQFlhmVClRlo',
    query: string = 'Senegal',
    maxPages: number = 10
): Promise<ApiScrapeResult> {
    try {
        const allListings: Listing[] = [];
        let cursor: string | null = null;
        let pageCount = 0;

        console.log(`Starting API scrape for ${query}...`);

        while (pageCount < maxPages) {
            pageCount++;
            console.log(`Fetching page ${pageCount}/${maxPages}...`);

            const payload = {
                operationName: 'StaysSearch',
                variables: {
                    staysSearchRequest: {
                        cursor: cursor,
                        metadataOnly: false,
                        requestedPageType: 'STAYS_SEARCH',
                        source: 'structured_search_input_header',
                        treatmentFlags: [
                            'feed_map_decouple_m11_treatment',
                            'recommended_amenities_2024_treatment_b',
                            'filter_redesign_2024_treatment',
                        ],
                        maxMapItems: 9999,
                        rawParams: [
                            { filterName: 'adults', filterValues: ['1'] },
                            { filterName: 'cdnCacheSafe', filterValues: ['false'] },
                            { filterName: 'channel', filterValues: ['EXPLORE'] },
                            { filterName: 'checkin', filterValues: ['2025-12-02'] },
                            { filterName: 'checkout', filterValues: ['2025-12-31'] },
                            { filterName: 'datePickerType', filterValues: ['calendar'] },
                            { filterName: 'itemsPerGrid', filterValues: ['18'] },
                            { filterName: 'placeId', filterValues: [placeId] },
                            { filterName: 'query', filterValues: [query] },
                            { filterName: 'refinementPaths', filterValues: ['/homes'] },
                            { filterName: 'tabId', filterValues: ['home_tab'] },
                        ],
                    },
                    isLeanTreatment: false,
                    aiSearchEnabled: false,
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: 'fde7a591e06985f13c8dce15ef0b9f389f17013877cd95867f23d1f39286e8e5',
                    },
                },
            };

            const response = await fetch(
                'https://www.airbnb.co.uk/api/v3/StaysSearch/fde7a591e06985f13c8dce15ef0b9f389f17013877cd95867f23d1f39286e8e5?operationName=StaysSearch&locale=en-GB&currency=USD',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': '*/*',
                        'Accept-Language': 'en-GB,en;q=0.9',
                        'Origin': 'https://www.airbnb.co.uk',
                        'Referer': 'https://www.airbnb.co.uk/s/Senegal/homes',
                        'X-Airbnb-API-Key': 'd306zoyjsyarp7ifhu67rjxn52tv0t20',
                        'X-Airbnb-GraphQL-Platform': 'web',
                        'X-Airbnb-GraphQL-Platform-Client': 'minimalist-niobe',
                        'X-CSRF-Token': 'null',
                        'X-CSRF-Without-Token': '1',
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Error ${response.status}:`, errorText);
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data: AirbnbApiResponse = await response.json();

            // Debug logging
            console.log('API Response structure:', JSON.stringify(data, null, 2).substring(0, 500));

            const results = data.data?.presentation?.staysSearch?.results?.searchResults || [];

            console.log(`Page ${pageCount}: Found ${results.length} listings`);

            // Parse listings
            results.forEach((result, index) => {
                try {
                    const listing = result.listing;
                    const pricing = result.pricingQuote;

                    // Extract price
                    const priceText = pricing?.structuredStayDisplayPrice?.primaryLine?.price || '$0';
                    const priceMatch = priceText.match(/[\d,]+/);
                    const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;

                    // Extract images
                    const images = listing.contextualPictures?.map((p) => p.picture) || [];

                    // Extract location
                    const location =
                        listing.structuredContent?.secondaryLine?.map((l) => l.text).join(' ') || query;

                    // Extract title
                    const title =
                        listing.name ||
                        listing.structuredContent?.primaryLine?.map((l) => l.text).join(' ') ||
                        `Listing ${listing.id}`;

                    if (price > 0 && title) {
                        allListings.push({
                            id: `airbnb-api-${listing.id}`,
                            title,
                            price,
                            images: images.length > 0 ? images : [],
                            location,
                            description: title,
                            platform: 'airbnb',
                            amenities: [],
                        });
                    }
                } catch (err) {
                    console.error('Error parsing listing:', err);
                }
            });

            // Check for next page
            const paginationInfo = data.data?.presentation?.staysSearch?.paginationInfo;
            if (paginationInfo?.hasNextPage && paginationInfo.nextPageCursor) {
                cursor = paginationInfo.nextPageCursor;
            } else {
                console.log('No more pages available');
                break;
            }

            // Add small delay to be respectful
            await new Promise((resolve) => setTimeout(resolve, 500));
        }

        console.log(`API scrape complete: ${allListings.length} total listings`);

        return {
            success: true,
            listings: allListings,
            totalCount: allListings.length,
        };
    } catch (error: any) {
        console.error('API scraping error:', error);
        return {
            success: false,
            listings: [],
            error: error.message || 'Failed to scrape Airbnb API',
        };
    }
}
