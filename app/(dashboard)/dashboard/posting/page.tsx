'use client';

import dynamic from 'next/dynamic';

// Export with dynamic loading to prevent hydration issues
export default dynamic(() => import('./posting-content'), {
    ssr: false,
    loading: () => (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500 border-4 border-orange-200 border-t-orange-500 rounded-full"></div>
                    <p className="text-gray-600">Завантаження...</p>
                </div>
            </div>
        </div>
    )
});