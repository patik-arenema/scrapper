import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Listing } from '@/types/types';

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

export interface ScrapeResult {
    success: boolean;
    listings: Listing[];
    error?: string;
}

export async function scrapeAirbnb(url: string): Promise<ScrapeResult> {
    let browser;

    try {
        console.log('Launching browser...');

        // Launch browser with stealth mode
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080',
            ],
        });

        const page = await browser.newPage();

        // Set viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        console.log('Navigating to URL:', url);

        // Navigate to the page
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });

        console.log('Page loaded, waiting for listings...');

        // Wait for listings to appear
        await page.waitForSelector('[data-testid="card-container"], [itemprop="itemListElement"]', {
            timeout: 15000,
        });

        console.log('Initial listings loaded, scrolling to load more...');

        // Scroll down multiple times to trigger infinite scroll and load more listings
        const scrollCount = 5; // Number of times to scroll (adjust for more/fewer results)

        for (let i = 0; i < scrollCount; i++) {
            // Scroll to bottom of page
            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });

            // Wait for new content to load
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log(`Scroll ${i + 1}/${scrollCount} completed`);
        }

        // Scroll back to top to ensure all images are loaded
        await page.evaluate(() => {
            window.scrollTo(0, 0);
        });

        // Give it a bit more time to load all content
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Extracting listing data...');

        // Extract listing data
        const listings = await page.evaluate(() => {
            const results: any[] = [];

            // Try multiple selectors as Airbnb's structure may vary
            const listingCards = document.querySelectorAll(
                '[data-testid="card-container"], [itemprop="itemListElement"], .c4mnd7m'
            );

            listingCards.forEach((card, index) => {
                try {
                    // Extract title
                    const titleElement = card.querySelector(
                        '[data-testid="listing-card-title"], .t1jojoys, [itemprop="name"]'
                    );
                    const title = titleElement?.textContent?.trim() || `Listing ${index + 1}`;

                    // Extract price
                    const priceElement = card.querySelector(
                        '[data-testid="price-availability-row"] span, ._tyxjp1, [class*="price"]'
                    );
                    let priceText = priceElement?.textContent?.trim() || '0';
                    // Extract numeric value from price (e.g., "$100" -> 100)
                    const priceMatch = priceText.match(/[\d,]+/);
                    const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;

                    // Extract image
                    const imgElement = card.querySelector('img');
                    const image = imgElement?.src || imgElement?.getAttribute('data-original-uri') || '';

                    // Extract link
                    const linkElement = card.querySelector('a[href*="/rooms/"]');
                    const href = linkElement?.getAttribute('href') || '';
                    const listingId = href.match(/\/rooms\/(\d+)/)?.[1] || `listing-${index}`;

                    // Extract location (if available)
                    const locationElement = card.querySelector('[data-testid="listing-card-subtitle"]');
                    const location = locationElement?.textContent?.trim() || 'Senegal';

                    // Extract description (if available)
                    const descElement = card.querySelector('[data-testid="listing-card-name"]');
                    const description = descElement?.textContent?.trim() || title;

                    if (title && price > 0) {
                        results.push({
                            id: `airbnb-senegal-${listingId}`,
                            title,
                            price,
                            images: image ? [image] : [],
                            location,
                            description,
                            platform: 'airbnb',
                            amenities: [],
                        });
                    }
                } catch (err) {
                    console.error('Error extracting listing:', err);
                }
            });

            return results;
        });

        console.log(`Extracted ${listings.length} listings`);

        await browser.close();

        if (listings.length === 0) {
            return {
                success: false,
                listings: [],
                error: 'No listings found. The page structure may have changed.',
            };
        }

        return {
            success: true,
            listings: listings as Listing[],
        };
    } catch (error: any) {
        console.error('Scraping error:', error);

        if (browser) {
            await browser.close();
        }

        return {
            success: false,
            listings: [],
            error: error.message || 'Failed to scrape Airbnb',
        };
    }
}
