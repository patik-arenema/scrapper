import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { location = 'Senegal', maxPages = 10, cursor = null } = body;

        console.log(`Proxying Airbnb API request for ${location}...`);

        const rawParams = [
            { filterName: 'adults', filterValues: ['1'] },
            { filterName: 'cdnCacheSafe', filterValues: ['false'] },
            { filterName: 'channel', filterValues: ['EXPLORE'] },
            { filterName: 'checkin', filterValues: ['2025-12-02'] },
            { filterName: 'checkout', filterValues: ['2025-12-31'] },
            { filterName: 'datePickerType', filterValues: ['calendar'] },
            { filterName: 'itemsPerGrid', filterValues: ['18'] },
            { filterName: 'placeId', filterValues: ['ChIJcbvFs_VywQ4RQFlhmVClRlo'] },
            { filterName: 'query', filterValues: [location] },
            { filterName: 'refinementPaths', filterValues: ['/homes'] },
            { filterName: 'tabId', filterValues: ['home_tab'] },
            { filterName: 'screenSize', filterValues: ['large'] },
        ];

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
                    rawParams: rawParams,
                },
                staysMapSearchRequestV2: {
                    cursor: cursor,
                    metadataOnly: false,
                    requestedPageType: 'STAYS_SEARCH',
                    source: 'structured_search_input_header',
                    treatmentFlags: [
                        'feed_map_decouple_m11_treatment',
                        'recommended_amenities_2024_treatment_b',
                        'filter_redesign_2024_treatment',
                    ],
                    rawParams: rawParams,
                },
                isLeanTreatment: false,
                aiSearchEnabled: false,
                skipExtendedSearchParams: false,
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
                },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Airbnb API Error ${response.status}:`, errorText.substring(0, 200));
            return NextResponse.json(
                { success: false, error: `Airbnb API returned ${response.status}` },
                { status: 500 }
            );
        }

        const data = await response.json();

        // Return the raw Airbnb API response
        return NextResponse.json({
            success: true,
            data: data,
        });
    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// Optional: GET endpoint for testing
export async function GET() {
    return NextResponse.json({
        message: 'Airbnb API Proxy',
        usage: 'POST with { "location": "Senegal", "maxPages": 10, "cursor": null }',
        note: 'Proxies requests to Airbnb GraphQL API to avoid CORS',
    });
}
