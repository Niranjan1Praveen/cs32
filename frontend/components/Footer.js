'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <div className="mb-2 sm:mb-0">
            <span>Vicharanashala Lab · Indian Institute of Technology Ropar · 2026 cycle</span>
          </div>
          <div>
            <span>Questions: log in at samagama.in and ask Yaksha.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}