'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getListingById } from '@/lib/storage';
import { Listing } from '@/types/types';
import ListingDetail from '@/components/ListingDetail';
import Link from 'next/link';

export default function ListingPage() {
    const params = useParams();
    const id = params.id as string;
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchedListing = getListingById(id);
        setListing(fetchedListing);
        setLoading(false);

        if (!fetchedListing) {
            notFound();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading listing...</p>
                </div>
            </div>
        );
    }

    if (!listing) {
        return null; // notFound() will handle this
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
