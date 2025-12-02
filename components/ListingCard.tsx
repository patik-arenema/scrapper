'use client';

import React from 'react';
import { Listing } from '@/types/types';
import Image from 'next/image';
import Link from 'next/link';

interface ListingCardProps {
    listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
    const platformColor = listing.platform === 'airbnb'
        ? 'bg-rose-100 text-rose-700'
        : 'bg-blue-100 text-blue-700';

    return (
        <div >
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full">
                <div className="relative h-48 w-full">
                    <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${platformColor}`}>
                        {listing.platform === 'airbnb' ? 'Airbnb' : 'Marketplace'}
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                        {listing.title}
                    </h3>

                    <div className="flex items-center text-gray-600 text-sm mb-2">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {listing.location}
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {listing.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                            ${Number(listing.price)}
                            {listing.platform === 'airbnb' && <span className="text-sm font-normal text-gray-600">/month</span>}
                        </span>

                        {listing.condition && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {listing.condition}
                            </span>
                        )}
                    </div>

                    {listing.amenities && listing.amenities.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                            {listing.amenities.slice(0, 3).map((amenity, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {amenity}
                                </span>
                            ))}
                            {listing.amenities.length > 3 && (
                                <span className="text-xs text-gray-500 px-2 py-1">
                                    +{listing.amenities.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
