'use client';
import Link from 'next/link';

export default function Footer() {
  return (
<<<<<<< HEAD
    <footer className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-purple-400 mb-2">PrashnaSārathi</h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-md">A community-driven Q&A and FAQ platform for knowledge sharing. Get your questions answered and help others learn.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text)] mb-4">Explore</h4>
            <div className="space-y-2.5">
              <Link href="/questions" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">Questions</Link>
              <Link href="/faqs" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">FAQs</Link>
              <Link href="/tags" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">Tags</Link>
              <Link href="/users" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">Community</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text)] mb-4">Participate</h4>
            <div className="space-y-2.5">
              <Link href="/questions/ask" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">Ask a Question</Link>
              <Link href="/auth?mode=signup" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">Join Community</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <span>&copy; {new Date().getFullYear()} PrashnaSārathi. Open source project.</span>
          <span>Built with care for the community</span>
=======
    <footer className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] mt-auto py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[var(--color-text-secondary)]">
          <span className="font-semibold text-[var(--color-text)]">PrashnaSārathi</span>
          <span className="text-[var(--color-text-muted)] hidden md:inline">•</span>
          <Link href="/questions" className="hover:text-[var(--color-primary)] transition-colors">Questions</Link>
          <span className="text-[var(--color-text-muted)] hidden md:inline">•</span>
          <Link href="/faqs" className="hover:text-[var(--color-primary)] transition-colors">FAQs</Link>
          <span className="text-[var(--color-text-muted)] hidden md:inline">•</span>
          <Link href="/tags" className="hover:text-[var(--color-primary)] transition-colors">Tags</Link>
          <span className="text-[var(--color-text-muted)] hidden md:inline">•</span>
          <Link href="/users" className="hover:text-[var(--color-primary)] transition-colors">Community</Link>
          <span className="text-[var(--color-text-muted)] hidden md:inline">•</span>
          <Link href="/guidelines" className="hover:text-[var(--color-primary)] transition-colors">Guidelines</Link>
          <span className="text-[var(--color-text-muted)] hidden md:inline">•</span>
          <Link href="/downloads" className="hover:text-[var(--color-primary)] transition-colors font-semibold text-emerald-500">Download App</Link>
        </div>
        <div className="text-[var(--color-text-muted)] text-center md:text-right font-mono">
          &copy; {new Date().getFullYear()} · Open source project
>>>>>>> ee33865eca586c7144d3e3235fd508333d554c11
        </div>
      </div>
    </footer>
  );
}