"use client";

import React from 'react';

export default function Loading() {
  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[100]">
      <div className="h-full bg-blue-600 animate-progress w-full transform origin-left"></div>
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-900 font-bold animate-pulse">Loading HomeCare Market...</p>
        </div>
      </div>
      <style jsx>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(0.9); }
        }
        .animate-progress {
          animation: progress 2s ease-out infinite;
        }
      `}</style>
    </div>
  );
}
