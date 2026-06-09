# PrashnaSārathi (प्रश्नसारथि) — Community Q&A and FAQ Platform

![Platform Banner](screenshots/ui/dashboard-overview.png)

A community-driven Q&A and FAQ platform designed to help students ask doubts without fear, get answers fast, and feel their problems are genuinely solved.

**Live Demo:** [https://prashnasarathi.vercel.app/](https://prashnasarathi.vercel.app/)

---

## 📸 Screenshots Showcase

### Dashboard & Question Feed
![Dashboard Overview](screenshots/ui/dashboard-overview.png)
*Main question feed with dark mode and keyboard navigation support*

### Mobile Responsive Design
![Mobile View](screenshots/ui/mobile-view.png)
*Fully responsive design that works seamlessly on all devices*

---

## Tech Stack

| Layer     | Technology                                      |
| --------- | ----------------------------------------------- |
| Frontend  | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend   | Node.js, Express 4, MongoDB (Mongoose), Redis   |
| Search    | Elasticsearch                                   |
| Realtime  | Socket.IO                                       |
| Events    | Kafka (optional)                                |
| Infra     | Podman / Docker, Nginx                          |

---

## Key Features

### 📝 Q&A Core

#### Ask Questions
![Ask Question Form](screenshots/qa/ask-question-form.png)
- Create questions with title, rich text body, and tags
- Anonymous posting option for sensitive doubts
- Duplicate detection before posting

#### Answer with Confidence
![Answer Confidence Levels](screenshots/qa/answer-confidence-levels.png)
Students can indicate their confidence level when answering:
- 🤔 "I think so" - Partial confidence
- 👍 "Pretty sure" - Moderate confidence  
- 💯 "I know this" - High confidence

#### Voting & Feedback System
![Voting Buttons](screenshots/qa/voting-buttons.png)
- Upvote/downvote with optional reason feedback
- Helps surface quality content
- Provides constructive feedback to answer authors

#### Accept Answer
![Accepted Answer](screenshots/qa/accepted-answer.png)
- Question authors or moderators can mark the best answer
- Visual celebration with confetti effect
- Helps future students find solutions quickly

#### "Me Too" Button
![Me Too Button](screenshots/qa/me-too-button.png)
- Students signal they have the same doubt
- Bumps question priority in the algorithm
- Encourages community participation

#### "Solved My Doubt" Button
![Solved Doubt Button](screenshots/qa/solved-doubt-button.png)
- Distinct from upvote - tracks genuine problem resolution
- Provides better metrics for answer quality
- Helps identify truly helpful responses

#### Duplicate Detection
![Similar Questions](screenshots/qa/similar-questions.png)
- Prevents duplicate questions before posting
- Shows similar existing questions
- Reduces clutter and encourages consolidation

#### Question Escalation
![Escalated Badge](screenshots/qa/escalated-badge.png)
- Unanswered questions auto-escalate after 24 hours
- Draws moderator attention to unresolved doubts
- Ensures no question goes unanswered

---

### 📚 FAQ System

#### Categorized FAQ Pages
![FAQ Categories](screenshots/faq/faq-categories.png)
- Organized by subject categories
- Easy browsing and discovery
- Version tracking for updates

#### On-page Navigation
![FAQ Sidebar Navigation](screenshots/faq/faq-sidebar-nav.png)
- "On this page" anchor sidebar for quick jumping
- Auto-highlights current section
- Improves long-form FAQ usability

#### Helpfulness Feedback
![FAQ Feedback Buttons](screenshots/faq/faq-feedback-buttons.png)
- Item-level Yes/No feedback tracking
- Helps identify outdated or unclear content
- Drives content improvement

#### Official Badges & Verification
![Official Badge](screenshots/faq/official-badge.png)
- Verified official answers stand out
- Master FAQ program for canonical answers
- Trust markers for quality content

#### Save FAQ Pages
![Save FAQ Modal](screenshots/faq/save-faq-modal.png)
- Save for later reference
- Add personal notes
- Organize with custom tags

---

### 🔍 Search & Discovery

#### Powerful Search Modal
![Search Modal](screenshots/search/search-modal.png)
- Full-text search across questions, FAQs, and users
- Press `Ctrl+K` or `/` to open from anywhere
- Elasticsearch-powered for speed and relevance

#### Keyboard Shortcuts
![Keyboard Shortcuts](screenshots/search/keyboard-shortcuts-hint.png)

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` or `/` | Open search modal |
| `j` or `↓` | Navigate down in lists |
| `k` or `↑` | Navigate up in lists |
| `Enter` | View/open selected item |
| `Esc` | Close modal or clear selection |

#### Trending & Suggestions
![Trending Searches](screenshots/search/trending-searches.png)
- Trending searches powered by Redis caching
- Search suggestions with top 10 popular queries
- Real-time autocomplete

#### Tag Browsing
![Tags Page](screenshots/search/tags-page.png)
- Browse questions by topic tags
- Filter and sort options
- Related questions sidebar

#### Personalized Recommendations
![Related Questions](screenshots/search/related-questions-sidebar.png)
- AI-powered question recommendations
- Based on user tags and activity
- Similar questions sidebar

---

### 👤 User System

#### Authentication
![Login Modal](screenshots/user/login-modal.png)
- JWT-based secure authentication
- Registration with email verification
- Session management

#### User Profile
![User Profile Page](screenshots/user/user-profile-page.png)
- Custom avatars and bio
- Reputation system
- Achievement badges
- Activity statistics (questions, answers, votes)

#### Saved Content
![Saved Questions Page](screenshots/user/saved-questions-page.png)
- Save questions and FAQs for later
- Add personal notes
- Organize with custom tags
- Easy reference and review

#### Real-time Notifications
![Notification Dropdown](screenshots/user/notification-dropdown.png)
- New answers to your questions
- Answers accepted notifications
- Upvotes and "Me Too" alerts
- Live updates via Socket.IO

#### Dark Mode
![Dark Mode Comparison](screenshots/user/dark-mode-comparison.png)
- Automatic system preference detection
- Manual override with toggle
- Persists to localStorage
- Full dark theme support across all pages

#### Student Onboarding
![Onboarding Walkthrough](screenshots/user/onboarding-walkthrough.png)
- 4-step guided tour for new users
- Platform feature introduction
- Encourages engagement from day one

#### Role System
- **User** - Standard access
- **Moderator** - Content moderation privileges
- **Admin** - Full platform control

---

### 🛡️ Admin & Moderation

#### Admin Dashboard
![Admin Dashboard](screenshots/admin/admin-dashboard.png)
- Real-time platform statistics
- User activity metrics (DAU, questions, answers)
- 30-day registration analytics
- Quick access to moderation tools

#### User Management
![User Management Table](screenshots/admin/user-management-table.png)
- View all registered users
- Change user roles (User/Moderator/Admin)
- Ban/unban users with reason tracking
- Search and filter functionality

#### Flagged Content Queue
![Flagged Content Queue](screenshots/admin/flagged-content-queue.png)
- Review reported questions and answers
- Approve or remove content
- Track moderation history

#### FAQ Management
![FAQ Verification Panel](screenshots/admin/faq-verification-panel.png)
- Verify FAQ accuracy
- Mark outdated content
- Promote questions to Master FAQ status

#### Cache Management
![Admin Cache Control](screenshots/admin/admin-cache-control.png)
- One-click Redis cache clearing
- Improves performance after updates
- Admin-only access

#### Analytics Dashboard
![User Analytics Chart](screenshots/admin/user-analytics-chart.png)
- Registration trends over 30 days
- Top 10 most helpful FAQ items
- Question resolution rates

---

### 🎨 UI/UX Highlights

#### Rich Text Editor
![Rich Text Editor](screenshots/ui/rich-text-editor.png)
- TipTap-based WYSIWYG editor
- Formatting toolbar
- Image upload support

#### Markdown Rendering
![Markdown Preview](screenshots/ui/markdown-preview.png)
- GitHub Flavored Markdown (GFM)
- Syntax highlighting for code blocks
- Consistent content presentation

#### Confetti Celebration
![Confetti Effect](screenshots/ui/confetti-effect.png)
- Celebratory animation when answers are accepted
- Positive reinforcement for contributors
- Delightful user experience

#### View Counter
![View Count Badge](screenshots/ui/view-count-badge.png)
- Track question popularity
- Sort by most viewed
- Engagement metrics

#### SEO Optimized
- Structured data with JSON-LD
- Meta tags for social sharing
- Sitemap generation

---

### ⚡ Real-time Features

#### Live Notifications
![Live Notification Toast](screenshots/realtime/live-notification-toast.png)
- Toast notifications for new activity
- No page refresh required
- Powered by Socket.IO

#### Real-time Updates
![Live Counter Update](screenshots/realtime/live-counter-update.png)
- Me-too counts update instantly
- Answer counts refresh in real-time
- Solved metrics update without page reload

---

## Running on Other Systems

To set up and run this project on a new developer environment or a separate host system, follow these steps:

### 1. Prerequisites
Ensure you have the following installed on the target system:
- **Docker / Podman & Docker Desktop** (with WSL2 enabled if on Windows)
- **Node.js 20.x** (for local host development without containers)

### 2. Environment Configuration (Crucial Step)
Since the `secrets.env` file containing sensitive private keys and credentials is ignored by version control, **you must create it manually** on the target system:

1. Copy `.env.example` to `secrets.env` in the root directory:
   ```bash
   cp .env.example secrets.env