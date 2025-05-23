'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center flex-grow px-4">
        <h1 
          className="text-5xl font-bold text-center mb-12" 
          style={{ color: '#590766' }}
        >
          Where the Iso meets I/O
        </h1>
        <p>
          <Link href="/players">
            <span className="text-lg font-semibold text-blue-600 hover:underline">
              Explore NBA Players
            </span>
          </Link>
        </p>
      </div>
      
      <footer className="text-center text-gray-500 text-sm py-2">
        <p>© SAHR Productions Inc. All Rights Reserved</p>
      </footer>
    </div>
  );
}