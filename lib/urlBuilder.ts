export function buildAirbnbUrl(location: string, checkin?: string, checkout?: string): string {
    const baseUrl = 'https://www.airbnb.co.in/s';

    // Default dates if not provided
    const defaultCheckin = checkin || new Date().toISOString().split('T')[0];
    const defaultCheckout = checkout || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Build URL with parameters
    const params = new URLSearchParams({
        refinement_paths: '/homes',
        date_picker_type: 'calendar',
        checkin: defaultCheckin,
        checkout: defaultCheckout,
        search_type: 'autocomplete_click',
    });

    return `${baseUrl}/${encodeURIComponent(location)}/homes?${params.toString()}`;
}

// Predefined URLs for specific locations
export const AIRBNB_URLS = {
    Senegal: 'https://www.airbnb.co.in/s/Senegal/homes?refinement_paths%5B%5D=%2Fhomes&place_id=ChIJcbvFs_VywQ4RQFlhmVClRlo&date_picker_type=calendar&search_type=autocomplete_click',
    London: buildAirbnbUrl('London, UK'),
    Paris: buildAirbnbUrl('Paris, France'),
    'New York': buildAirbnbUrl('New York, USA'),
};
