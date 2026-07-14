import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-full animate-pulse">
            <div className="h-44 bg-gray-200" />
            <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
                <div className="pt-4 flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-24" />
                    <div className="flex space-x-2">
                        <div className="h-6 bg-gray-100 rounded-full w-12" />
                        <div className="h-6 bg-gray-100 rounded-full w-12" />
                    </div>
                </div>
                <div className="h-10 bg-gray-200 rounded-full w-full mt-4" />
            </div>
        </div>
    );
};

export default SkeletonCard;
