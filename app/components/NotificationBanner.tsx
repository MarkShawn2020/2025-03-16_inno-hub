'use client';

export function NotificationBanner() {
  return (
    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white py-2.5 px-4 text-center shadow-md animate-pulse">
      <p className="text-sm font-bold flex items-center justify-center">
        <span className="inline-block mr-2">🚀</span>
        已接入满血版 DeepSeek
        <span className="inline-block ml-2">✨</span>
      </p>
    </div>
  );
} 