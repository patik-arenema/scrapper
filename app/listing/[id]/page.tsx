import { notFound } from 'next/navigation';
import { getListingById } from '@/lib/mockData';
import ListingDetail from '@/components/ListingDetail';
import Link from 'next/link';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ListingPage({ params }: PageProps) {
    const { id } = await params;
    const listing = getListingById(id);

    if (!listing) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <Link
                        href={`/scraper?platform=${listing.platform}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Results
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto">
                    <ListingDetail listing={listing} />
                </div>
            </div>
        </div>
    );
}
