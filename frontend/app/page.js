'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import MarkdownRenderer from '@/components/MarkdownRenderer';
<<<<<<< HEAD
=======
import RecommendedFAQs from '@/components/RecommendedFAQs';

>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11

const CATEGORY_ICONS = {
  'About the internship': '💼',
  'Timing and dates': '📅',
  'NOC (No Objection Certificate)': '📄',
  'Selection, offer letter, and certificate': '📜',
  'Work, mentorship, and projects': '💻',
  'Code of conduct — communication channels': '📋',
  'Interviews Related': '🎤',
  'Certificate': '🏆',
  'Rosetta — your internship journal': '📔',
  'Phase 1 — coursework, Vibe LMS, and live sessions': '📚',
  'Spurti Points': '⭐',
  'ViBe Platform': '🎯',
  'Team Formation': '👥',
  'Yaksha Chat Related': '💬',
  'Discourse Related': '💭',
};

export default function HomePage() {
  const { user } = useAuth();
<<<<<<< HEAD
=======
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localVotes, setLocalVotes] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📌');
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const data = await api.get('/faqs', { limit: 100 });
      const faqList = data.faqs || [];

      const categoryMap = {};
      faqList.forEach(faq => {
        const cat = faq.category || 'Uncategorized';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { name: cat, count: 0, items: [] };
        }
        const itemCount = faq.items ? faq.items.filter(i => i.isPublished).length : 0;
        categoryMap[cat].count += itemCount;
        categoryMap[cat].items.push(faq);
      });

      const sortedCategories = Object.values(categoryMap).sort((a, b) => b.count - a.count);
      setCategories([{ name: 'All Categories', count: faqList.reduce((acc, f) => acc + (f.items ? f.items.filter(i => i.isPublished).length : 0), 0) }, ...sortedCategories]);
      setFaqs(faqList);
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQs = selectedCategory === 'All Categories'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const handleFeedback = async (faqId, itemId, helpful) => {
    if (!user) { toast.error('Please login to vote'); return; }
    const currentVote = localVotes[itemId];
    const isUndo = currentVote === (helpful ? 'helpful' : 'notHelpful');
    try {
      const data = await api.post(`/faqs/${faqId}/items/${itemId}/feedback`, { helpful, undo: isUndo });
      if (data.voted === null) {
        setLocalVotes(prev => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        toast.success('Vote removed');
      } else {
        setLocalVotes(prev => ({ ...prev, [itemId]: data.voted }));
        toast.success(helpful ? 'Glad this helped!' : 'Thanks for the feedback');
      }
      setFaqs(prev => prev.map(faq => {
        if (faq._id !== faqId) return faq;
        return {
          ...faq,
          items: faq.items.map(item => {
            if (item._id !== itemId) return item;
            return { ...item, helpfulCount: data.helpfulCount, notHelpfulCount: data.notHelpfulCount };
          })
        };
      }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      await api.post('/categories', { name: newCategoryName.trim(), icon: newCategoryIcon });
      toast.success('Category added');
      setShowCategoryModal(false);
      setNewCategoryName('');
      setNewCategoryIcon('📌');
      loadFAQs();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAddingCategory(false);
    }
  };

  const isAdminOrMod = user && (user.role === 'admin' || user.role === 'moderator');

  const getIcon = (category) => {
    return CATEGORY_ICONS[category] || '📌';
  };

  const isFaqFresh = (faq) => {
    if (!faq.items || faq.items.length === 0) return false;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return faq.items.some(item => item.lastReviewed && new Date(item.lastReviewed).getTime() > sevenDaysAgo);
  };

<<<<<<< HEAD
=======
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
<<<<<<< HEAD
        {/* Modern Tech Hero Header */}
        <section className="text-center mb-16 mt-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] via-purple-500 to-pink-500">
              Vicharanashala Q&A Portal
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
            Search our Elasticsearch knowledge base of questions, FAQs, and community answers.
          </p>
=======
        {/* Tech Hero Header */}
        <section className="max-w-2xl mb-12 mt-4 text-center mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-primary)] bg-[var(--color-primary-subtle)] border border-[var(--color-primary)]/20 px-2.5 py-0.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
            KNOWLEDGE BASE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-[var(--color-text)]">
            Vicharanashala Q&A Portal
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-6">
            Search our Elasticsearch knowledge base of questions, FAQs, and community answers.
          </p>

          {/* Hero Search */}
          <form onSubmit={handleSearchSubmit} className="relative mb-4 w-full max-w-xl">
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] focus-within:border-[var(--color-primary)]/50 focus-within:ring-2 focus-within:ring-[var(--color-primary-subtle)] transition-all">
              <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions, categories, tags..."
                className="flex-1 bg-transparent text-xs text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
              />
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded">Ctrl K</kbd>
            </div>
          </form>
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
        </section>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Sidebar - Categories */}
<<<<<<< HEAD
          <aside className="lg:col-span-1 lg:sticky lg:top-24 bg-[var(--color-bg-secondary)]/60 backdrop-blur-md p-5 rounded-2xl border border-[var(--color-border)]/50 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]/50 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Categories</h2>
              <span className="text-xs bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded-full font-medium text-[var(--color-text-secondary)]">
                {categories.length - 1 || 0}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
=======
          <aside className="lg:col-span-1 lg:sticky lg:top-24 bg-[var(--color-bg-secondary)] p-4 rounded-md border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)] mb-3">
              <h2 className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Categories</h2>
              <span className="text-[10px] font-mono bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                {categories.length - 1 || 0}
              </span>
            </div>
            <div className="flex flex-row lg:flex-col gap-1.5 max-h-[60vh] overflow-x-auto lg:overflow-y-auto pb-2.5 lg:pb-0 pr-1">
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
<<<<<<< HEAD
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/15 translate-x-1'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]/70 hover:translate-x-0.5'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-base shrink-0">{getIcon(cat.name)}</span>
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-md transition-colors ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] group-hover:bg-[var(--color-bg-secondary)]'
=======
                    className={`shrink-0 w-auto lg:w-full text-left px-3 py-2 rounded-md text-xs transition-colors flex items-center justify-between gap-3 group ${
                      isSelected
                        ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary)]/25'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)] border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-sm shrink-0">{getIcon(cat.name)}</span>
                      <span className="truncate leading-none">{cat.name}</span>
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                      isSelected ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
            {isAdminOrMod && (
              <button
                onClick={() => setShowCategoryModal(true)}
<<<<<<< HEAD
                className="w-full mt-4 py-2.5 border border-dashed border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]/60 text-xs text-[var(--color-primary)] font-medium rounded-xl hover:bg-[var(--color-primary-subtle)]/30 transition-all text-center block"
=======
                className="w-full mt-0 lg:mt-3 py-2 border border-dashed border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]/60 text-[10px] text-[var(--color-primary)] font-mono rounded-md hover:bg-[var(--color-primary-subtle)]/30 transition-all text-center block"
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
              >
                + Add Category
              </button>
            )}
          </aside>

          {/* Main Content - FAQs */}
<<<<<<< HEAD
          <main className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]/50">
              <h2 className="text-base font-semibold text-[var(--color-text)]">
                {selectedCategory === 'All Categories' ? 'All Frequently Asked Questions' : selectedCategory}
              </h2>
              <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] font-medium">
=======
          <main className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]/50 mb-4">
              <h2 className="text-xs font-semibold text-[var(--color-text)]">
                {selectedCategory === 'All Categories' ? 'All Frequently Asked Questions' : selectedCategory}
              </h2>
              <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)] font-mono">
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
                <button
                  onClick={() => setExpandedFaq('all')}
                  className="hover:text-[var(--color-text)] transition-colors"
                >
<<<<<<< HEAD
                  Expand all
=======
                  EXPAND ALL
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
                </button>
                <span>•</span>
                <button
                  onClick={() => setExpandedFaq(null)}
                  className="hover:text-[var(--color-text)] transition-colors"
                >
<<<<<<< HEAD
                  Collapse all
=======
                  COLLAPSE ALL
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
                </button>
              </div>
            </div>

            {loading ? (
<<<<<<< HEAD
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border)]/40 rounded-2xl p-5 animate-pulse">
                    <div className="h-5 bg-[var(--color-border)] rounded w-3/4 mb-3" />
                    <div className="h-4 bg-[var(--color-border)] rounded w-full mb-2" />
                    <div className="h-4 bg-[var(--color-border)] rounded w-1/2" />
=======
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md p-4 animate-pulse">
                    <div className="h-4 bg-[var(--color-border)] rounded w-3/4 mb-2.5" />
                    <div className="h-3 bg-[var(--color-border)] rounded w-full mb-1.5" />
                    <div className="h-3 bg-[var(--color-border)] rounded w-1/2" />
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
                  </div>
                ))}
              </div>
            ) : (
<<<<<<< HEAD
              <div className="space-y-4">
                {filteredFAQs.map((faq) => {
                  const isExpanded = expandedFaq === faq._id || expandedFaq === 'all';
                  return (
                    <div 
                      key={faq._id} 
                      className={`bg-[var(--color-bg-secondary)]/80 backdrop-blur-md rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isExpanded 
                          ? 'border-[var(--color-primary)]/40 shadow-md shadow-[var(--color-primary)]/5' 
                          : 'border-[var(--color-border)]/60 hover:border-[var(--color-primary)]/30 hover:shadow-sm hover:-translate-y-0.5'
=======
              <div className="flex flex-col gap-3">
                {selectedCategory === 'All Categories' && user && (
                  <div className="mb-4 p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">💡</span>
                        <h3 className="text-xs font-bold text-[var(--color-text)] font-mono uppercase tracking-wider">
                          {user.currentPhase ? 'Recommended For Your Phase' : 'Recommended For You'}
                        </h3>
                      </div>
                      {!user.currentPhase && (
                        <Link
                          href="/auth?mode=login"
                          className="text-[9px] font-mono font-semibold text-[var(--color-primary)] border border-[var(--color-primary)]/25 rounded px-2 py-0.5 hover:bg-[var(--color-primary)]/10 transition-colors shrink-0"
                        >
                          SET PHASE →
                        </Link>
                      )}
                    </div>
                    <RecommendedFAQs limit={4} layout="grid" />
                  </div>
                )}
                
                {filteredFAQs.map((faq, faqIdx) => {
                  const isExpanded = expandedFaq === faq._id || expandedFaq === 'all';
                  const displayFaqIdx = String(faqIdx + 1).padStart(2, '0');
                  return (
                    <div 
                      key={faq._id} 
                      className={`bg-[var(--color-bg-secondary)] border rounded-md overflow-hidden transition-all duration-200 ${
                        isExpanded ? 'border-[var(--color-primary)]/50' : 'border-[var(--color-border)] hover:border-[var(--color-border-subtle)]'
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
                      }`}
                    >
                      {/* FAQ Header */}
                      <button
                        onClick={() => toggleFaq(faq._id)}
<<<<<<< HEAD
                        className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-[var(--color-bg-tertiary)]/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            {faq.isOfficial && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Official
                              </span>
                            )}
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              ⚡ Fresh
                            </span>
                            <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                              {faq.items?.length || 0} items
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-[var(--color-text)] leading-snug">
                            {faq.title}
                          </h3>
                        </div>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--color-bg-tertiary)]/50 border border-[var(--color-border)]/50 text-[var(--color-text-secondary)] transition-all ${
                          isExpanded ? 'rotate-180 bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)]' : ''
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded Accordion Content */}
                      {isExpanded && faq.items?.length > 0 && (
                        <div className="border-t border-[var(--color-border)]/50 divide-y divide-[var(--color-border)]/40 bg-[var(--color-bg)]/20">
                          {faq.items
                            .filter(item => item.isPublished)
                            .map((item) => (
                              <div key={item._id} className="p-5 hover:bg-[var(--color-bg-secondary)]/30 transition-colors">
                                <div className="text-sm font-semibold text-[var(--color-text)] mb-2 flex items-start gap-2">
                                  <span className="text-[var(--color-primary)] text-base mt-0.5">Q.</span>
                                  <span>{item.question}</span>
                                </div>
                                <div className="text-sm text-[var(--color-text-secondary)] pl-6 pr-4 mb-4 leading-relaxed whitespace-pre-wrap">
                                  {item.answer}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] pl-6">
                                  <span className="font-medium text-[var(--color-text-secondary)]/80">Was this helpful?</span>
                                  <button
                                    onClick={() => handleFeedback(faq._id, item._id, true)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                                      localVotes[item._id] === 'helpful' 
                                        ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 font-semibold' 
                                        : 'border-[var(--color-border)]/50 hover:text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]'
                                    }`}
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                                    <span>Yes ({item.helpfulCount || 0})</span>
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(faq._id, item._id, false)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                                      localVotes[item._id] === 'notHelpful' 
                                        ? 'text-red-600 bg-red-500/10 border-red-500/20 font-semibold' 
                                        : 'border-[var(--color-border)]/50 hover:text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]'
                                    }`}
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                                    <span>No ({item.notHelpfulCount || 0})</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
=======
                        className="w-full p-4 text-left flex items-start justify-between gap-4 select-none"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{displayFaqIdx}</span>
                            {faq.isOfficial && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                                Official
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-[var(--color-primary)] bg-[var(--color-primary-subtle)] border border-[var(--color-primary)]/20 px-2 py-0.5 rounded-md capitalize">
                              {faq.category || 'General'}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                              {faq.items?.length || 0} items
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-[var(--color-text)] leading-snug">
                            {faq.title}
                          </h3>
                        </div>
                        <svg
                          className={`w-3.5 h-3.5 text-[var(--color-text-muted)] transition-transform duration-200 mt-1 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Expanded Accordion Content */}
                      <div className={`faq-body-wrap ${isExpanded ? 'faq-body-wrap-open' : ''}`}>
                        <div className="faq-body-inner">
                          {faq.items?.length > 0 && (
                            <div className="border-t border-[var(--color-border)] divide-y divide-[var(--color-border)]/40 bg-[var(--color-bg)]/20">
                              {faq.items
                                .filter(item => item.isPublished)
                                .map((item, itemIdx) => (
                                  <div key={item._id} className="p-4 hover:bg-[var(--color-bg-secondary)]/30 transition-colors">
                                    <div className="text-xs font-semibold text-[var(--color-text)] mb-2 flex items-start gap-2">
                                      <span className="text-[var(--color-primary)] font-mono text-xs">Q{itemIdx + 1}.</span>
                                      <span>{item.question}</span>
                                    </div>
                                    <div className="text-xs text-[var(--color-text-secondary)] pl-6 pr-4 mb-3 leading-relaxed whitespace-pre-wrap">
                                      <MarkdownRenderer content={item.answer} />
                                    </div>
                                    
                                    {item.tags?.length > 0 && (
                                      <div className="flex flex-wrap gap-1 pl-6 mb-3">
                                        {item.tags.map(tag => (
                                          <span key={tag} className="font-mono text-[9px] text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">{tag}</span>
                                        ))}
                                      </div>
                                    )}

                                    <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-muted)] pl-6 font-mono">
                                      <span className="font-medium text-[var(--color-text-secondary)]/80">Was this helpful?</span>
                                      <button
                                        onClick={() => handleFeedback(faq._id, item._id, true)}
                                        className={`flex items-center gap-1 ${localVotes[item._id] === 'helpful' ? 'text-green-500 font-semibold' : 'hover:text-green-500'}`}
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                                        <span>Yes ({item.helpfulCount || 0})</span>
                                      </button>
                                      <button
                                        onClick={() => handleFeedback(faq._id, item._id, false)}
                                        className={`flex items-center gap-1 ${localVotes[item._id] === 'notHelpful' ? 'text-red-500 font-semibold' : 'hover:text-red-500'}`}
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                                        <span>No ({item.notHelpfulCount || 0})</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && filteredFAQs.length === 0 && (
<<<<<<< HEAD
              <div className="text-center py-16 bg-[var(--color-bg-secondary)]/30 border border-[var(--color-border)]/30 rounded-2xl text-[var(--color-text-secondary)]">
=======
              <div className="text-center py-12 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-[var(--color-text-secondary)] text-xs">
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
                No FAQs found in this category.
              </div>
            )}
          </main>
        </div>
<<<<<<< HEAD
      </div>

=======

        {/* Community Guidelines & Policies Banner */}
        <section className="mt-16 pt-8 border-t border-[var(--color-border)]">
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)]">
                  <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-[var(--color-text)]">Community Guidelines & Spam Policies</h3>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-3xl pl-10.5">
                To maintain a high-quality Q&A resource, all questions are filtered in real-time by AI spam guards. Please keep posts supportive, pick confidence levels honestly, and tag your questions correctly.
              </p>
            </div>
            <Link href="/guidelines" className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-border-subtle)] hover:text-[var(--color-text)] transition-colors rounded-md px-4 py-2 flex items-center gap-1.5 shrink-0">
              Read Guidelines
              <svg className="w-3 h-3 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </div>


>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)} />
<<<<<<< HEAD
          <div className="relative bg-[var(--color-bg-secondary)] rounded-2xl shadow-xl w-full max-w-md p-6 border border-[var(--color-border)]/50">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Add New Category</h3>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Category Name</label>
=======
          <div className="relative bg-[var(--color-bg-secondary)] rounded-md shadow-xl w-full max-w-md p-6 border border-[var(--color-border)]/50">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Add New Category</h3>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="block text-xs font-medium text-[var(--color-text)] mb-1.5">Category Name</label>
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., About the internship"
<<<<<<< HEAD
                  className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
=======
                  className="w-full px-3.5 py-2.5 text-xs border border-[var(--color-border)] rounded-md bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
                  required
                />
              </div>
              <div className="mb-6">
<<<<<<< HEAD
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Icon (emoji)</label>
=======
                <label className="block text-xs font-medium text-[var(--color-text)] mb-1.5">Icon (emoji)</label>
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
                <input
                  type="text"
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  placeholder="📌"
<<<<<<< HEAD
                  className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
=======
                  className="w-full px-3.5 py-2.5 text-xs border border-[var(--color-border)] rounded-md bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
<<<<<<< HEAD
                  className="px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
=======
                  className="px-4 py-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingCategory || !newCategoryName.trim()}
<<<<<<< HEAD
                  className="btn-primary"
=======
                  className="btn-primary h-8 text-xs !px-4"
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
                >
                  {addingCategory ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
