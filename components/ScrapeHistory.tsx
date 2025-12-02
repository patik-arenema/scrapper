'use client';

import React, { useEffect, useState } from 'react';
import { ScrapeHistory } from '@/types/types';
import { getScrapeHistory, clearScrapeHistory } from '@/lib/storage';

export default function ScrapeHistoryComponent() {
    const [history, setHistory] = useState<ScrapeHistory[]>([]);

    useEffect(() => {
        setHistory(getScrapeHistory());
    }, []);

    const handleClear = () => {
        clearScrapeHistory();
        setHistory([]);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (history.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Scrape History</h2>
                <p className="text-gray-500 text-center py-8">No scrape history yet</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Scrape History</h2>
                <button
                    onClick={handleClear}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                    Clear History
                </button>
            </div>

            <div className="space-y-3">
                {history.map((item) => (
                    <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.platform === 'airbnb'
                                            ? 'bg-rose-100 text-rose-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {item.platform === 'airbnb' ? 'Airbnb' : 'Marketplace'}
                                    </span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {item.city}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>{item.resultsCount} results</span>
                                    <span>•</span>
                                    <span>{formatDate(item.scrapedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
