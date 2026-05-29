'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/faqs', { limit: 100 })
      .then(data => setFaqs(data.faqs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Centered */}
      <div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Vicharanashala Internship — FAQ
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Everything you need to know about the Vicharanashala Internship programme.
          </p>
          
          {/* Search Bar - Centered */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full px-4 py-3 pr-12 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
          
          {/* Browse link */}
          <div className="mt-6">
            <Link 
              href="/faqs" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Browse all FAQs
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Categories Section - Vertical List */}
        <div className="mb-12">
          <div className="border-b border-gray-200 pb-3 mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              All FAQ Categories
            </h2>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="animate-pulse border-b border-gray-100 pb-4">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {faqs.map(faq => (
                <Link 
                  key={faq._id} 
                  href={`/faqs/${faq.slug}`}
                  className="group block border-b border-gray-100 pb-5 hover:border-gray-200 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {faq.title}
                      </h3>
                      {faq.isOfficial && (
                        <span className="text-xs text-gray-500">· Official</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {faq.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{faq.itemCount || 0} articles</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Popular Articles Section */}
        {/* <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="text-center mb-6">
            <h3 className="text-base font-semibold text-gray-900">
              Popular articles
            </h3>
          </div>
          <div className="space-y-3">
            <div className="text-center">
              <Link href="/faqs" className="text-sm text-blue-600 hover:text-blue-800">
                Getting started with Vicharanashala
              </Link>
            </div>
            <div className="text-center">
              <Link href="/faqs" className="text-sm text-blue-600 hover:text-blue-800">
                Team formation guidelines
              </Link>
            </div>
            <div className="text-center">
              <Link href="/faqs" className="text-sm text-blue-600 hover:text-blue-800">
                Phase 1 coursework overview
              </Link>
            </div>
          </div>
        </div> */}

        {/* Need More Help Section */}
        <div className="pt-8 mt-8">
          <div className="text-center mb-6">
            <h3 className="text-base font-semibold text-gray-900">
              Need more help?
            </h3>
          </div>
          <div className="space-y-3">
            <div className="text-center">
              <Link href="/questions/ask" className="text-sm text-blue-600 hover:text-blue-800">
                Ask a question
              </Link>
            </div>
            <div className="text-center">
              <Link href="/search" className="text-sm text-blue-600 hover:text-blue-800">
                Search all help topics
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}