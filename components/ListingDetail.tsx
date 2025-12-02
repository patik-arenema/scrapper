'use client';

import React from 'react';
import { Listing } from '@/types/types';
import Image from 'next/image';

interface ListingDetailProps {
    listing: Listing;
}

export default function ListingDetail({ listing }: ListingDetailProps) {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    const platformColor = listing.platform === 'airbnb'
        ? 'bg-rose-100 text-rose-700'
        : 'bg-blue-100 text-blue-700';

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === listing.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? listing.images.length - 1 : prev - 1
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Image Carousel */}
            <div className="relative h-96 w-full bg-gray-100">
                <Image
                    src={listing.images[currentImageIndex]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    priority
                />

                {listing.images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                            aria-label="Previous image"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                            aria-label="Next image"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {listing.images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                        }`}
                                    aria-label={`Go to image ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-semibold ${platformColor}`}>
                    {listing.platform === 'airbnb' ? 'Airbnb' : 'Facebook Marketplace'}
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {listing.title}
                </h1>

                <div className="flex items-center text-gray-600 mb-6">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-lg">{listing.location}</span>
                </div>

                <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                        ${listing.price}
                    </span>
                    {listing.platform === 'airbnb' && (
                        <span className="text-xl text-gray-600 ml-2">/night</span>
                    )}
                </div>

                <div className="border-t border-gray-200 pt-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                    <p className="text-gray-700 leading-relaxed">
                        {listing.description}
                    </p>
                </div>

                {listing.amenities && listing.amenities.length > 0 && (
                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {listing.amenities.map((amenity, idx) => (
                                <div key={idx} className="flex items-center text-gray-700">
                                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {amenity}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {listing.condition && (
                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Condition</h2>
                        <span className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg">
                            {listing.condition}
                        </span>
                    </div>
                )}

                {listing.category && (
                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Category</h2>
                        <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg">
                            {listing.category}
                        </span>
                    </div>
                )}

                {/* Map Placeholder */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Location</h2>
                    <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p>Map placeholder - {listing.location}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
