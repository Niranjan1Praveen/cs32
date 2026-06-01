# Recommended FAQs Feature Spec

## The Idea

Recommend FAQs to users based on their **internship phase** (primary) and **viewing history** (secondary).

---

## Why This Works

| Problem | Solution |
|---------|----------|
| Phase 1 user sees Certificate FAQs → irrelevant | Show only phase-relevant categories |
| New user has no history | Phase selection provides immediate signal |
| Internship has natural stages | Categories already map to phases |

---

## User Phases to Track

Add `currentPhase` field to User model with these values:

- `pre` - Exploring / pre-internship
- `phase1_coursework` - Doing Vibe LMS coursework
- `phase1_completed` - Finished coursework, ready for team formation
- `phase2_project` - Working on project
- `completed` - Finished internship

---

## Phase-to-Category Mapping

| Phase | Show FAQs from these categories |
|-------|-------------------------------|
| pre | Getting Started, ViBe Platform |
| phase1_coursework | Phase 1 — coursework, Vibe LMS, live sessions |
| phase1_completed | Team Formation, Yaksha Chat |
| phase2_project | Interviews, Certificate |
| completed | Certificate, Alumni |

---

## Secondary Signal: Tag Affinity

Track tags from FAQs the user:
- Views
- Saves
- Marks as helpful

Keep last 30 days, max 20 tags. Match against FAQ tags for bonus points.

---

## Scoring Formula

| Factor | Points |
|--------|--------|
| Category matches user's phase | +100 |
| Each matching tag (from user history) | +10 |
| Log(viewCount) | +2 |
| Is Official FAQ | +5 |

Higher score = higher in recommendations.

---

## Where to Display

| Location | Count |
|----------|-------|
| Homepage (main section) | 6-8 |
| FAQ detail page sidebar | 3-4 |
| Search results (when empty) | 5 |

---

## Fallback (No Data)

| Scenario | Show |
|----------|------|
| No phase selected | Official FAQs + trending this week |
| No tag history | Phase-matched FAQs only |
| No matches at all | Recently updated FAQs |

---

## User Flow

1. New user logs in → sees phase selection onboarding
2. User selects phase → saved to profile
3. User can update phase anytime in settings
4. Homepage shows personalized recommendations based on phase + viewed tags
5. Recommendations refresh every hour (or when phase changes)

---

## Implementation Priority

1. Add `currentPhase` to User model
2. Create phase selection onboarding page
3. Build recommendation API endpoint
4. Create RecommendedFAQs component
5. Integrate into homepage and FAQ detail page
6. Add phase update to profile settings

---

## Success Metrics

- Users who complete phase selection: >70%
- Recommendation click-through rate: >15%
- Helpful rate on recommended FAQs: maintain or improve

---

*Estimated implementation: 1-2 days*