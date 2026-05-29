# Bugs Report

## PrashnaSārathi - Backend Issues Documentation

---

### Bug #1: Duplicate Vote Allowance

**Severity:** 🔴 High

**Description:** A user can upvote and downvote the same content (question or answer) simultaneously, which violates voting logic where a user should only have one vote per content.

**Affected Files:**
- `/backend/controllers/voteController.js`

**Root Cause:** The vote controller allows toggling between vote types but does not properly prevent a user from having both an upvote and downvote record. The existing vote check only looks for any vote, but the race condition or logic flaw allows creation of both.

**Current Logic:**
```javascript
// In voteController.js - The code allows changing vote direction
if (existingVote && existingVote.voteType === voteType) {
    // Remove vote
} else if (existingVote) {
    // Change vote direction - this should work but may have race conditions
}
```

**Steps to Reproduce:**
1. Login as any user
2. Go to any question or answer
3. Click upvote button
4. Quickly click downvote button before first request completes
5. Both votes are registered

**Expected Behavior:**
- User can only have ONE vote per content
- Clicking upvote when downvote exists should change to upvote (remove downvote, add upvote)
- Clicking downvote when upvote exists should change to downvote
- API should reject attempts to create conflicting votes

**Suggested Fix:**
- Add database unique compound index on `{ user, target, targetType }`
- Implement transaction or findOneAndUpdate with proper upsert logic
- Add server-side validation to check existing vote before creating new one

```javascript
// Suggested fix in voteController.js
const existingVote = await Vote.findOne({
    user: req.user._id,
    target: targetId,
    targetType,
});

if (existingVote) {
    if (existingVote.voteType === voteType) {
        // Remove vote (unchanged)
    } else {
        // Update existing vote instead of creating new
        existingVote.voteType = voteType;
        await existingVote.save();
        // Update counters correctly
    }
} else {
    // Create new vote
}
```

---

### Bug #2: Rate Limiter Causes Session Logout on Spam

**Severity:** 🔴 High

**Description:** When a user spam-clicks the upvote/downvote buttons rapidly, the server responds with 429 (Too Many Requests) errors, which then triggers a logout. The server requires a restart to recover.

**Affected Files:**
- `/backend/middleware/rateLimiter.js`
- `/frontend/lib/api.js`
- `/frontend/context/AuthContext.js`

**Root Cause:** The rate limiter is too aggressive and when the frontend receives a 429 response, the error handling in the API client or AuthContext incorrectly clears the token and logs the user out.

**Error Observed:**
```
GET /api/questions?page=1&sort=views 429 0.181 ms - 53
GET /api/questions?page=1&sort=newest 429 0.158 ms - 53
```

**Steps to Reproduce:**
1. Login to the application
2. Go to any question
3. Rapidly click upvote/downvote buttons (10+ clicks in 2 seconds)
4. Server returns 429 errors
5. User is logged out
6. Server becomes unresponsive until restart

**Expected Behavior:**
- Rate limiter should return 429 but NOT cause logout
- Frontend should handle 429 gracefully (show "Too many requests" message)
- User should remain logged in
- Server should continue functioning

**Suggested Fix:**

1. **Update rate limiter configuration:**
```javascript
// rateLimiter.js
const voteLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 votes per minute
    skipSuccessfulRequests: true, // Don't count successful votes
    keyGenerator: (req) => req.user?._id || req.ip,
});
```

2. **Update API client error handling:**
```javascript
// api.js - Don't clear token on 429
if (!res.ok) {
    if (res.status === 429) {
        const error = new Error('Too many requests. Please slow down.');
        error.status = 429;
        throw error;
    }
    // Only clear token for 401
    if (res.status === 401) {
        localStorage.removeItem('token');
    }
    // Rest of error handling...
}
```

3. **Add debouncing on frontend:**
```javascript
// QuestionCard.js or vote buttons
const debouncedVote = useMemo(
    () => debounce(handleVote, 500),
    [handleVote]
);
```

---

### Bug #3: Duplicate Answer Display on Post

**Severity:** 🟠 Medium

**Description:** When a user posts an answer to a question, the answer appears twice in the UI initially before settling to a single instance.

**Affected Files:**
- `/frontend/app/questions/[id]/page.js`
- `/backend/controllers/answerController.js`
- `/backend/socket/index.js`

**Root Cause:** The answer is being added twice - once from the API response and once from the Socket.io event. The frontend listens for both and adds the answer twice.

**Steps to Reproduce:**
1. Login as any user
2. Go to any question
3. Post an answer
4. Observe that the answer appears twice in the answers list
5. After refresh, only one answer appears

**Expected Behavior:**
- Answer should appear exactly once immediately after posting
- Socket event should not duplicate the API response

**Suggested Fix:**

In `question/[id]/page.js`:

```javascript
// Current code adds answer from API response
const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    // ... validation
    
    const data = await api.post(`/answers/question/${id}`, { body: newAnswer });
    setAnswers(prev => [data.answer, ...prev]);  // This adds one
    
    // Socket event 'answer:new' also adds another
};

// Fix: Remove the manual setAnswers and rely only on socket
const handleSubmitAnswer = async (e) => {
    // ... validation
    await api.post(`/answers/question/${id}`, { body: newAnswer });
    setNewAnswer('');
    // Don't manually add - let socket handle it
};

// Or add a flag to prevent double addition
const [isSubmitting, setIsSubmitting] = useState(false);

// In socket effect, check if answer was just posted by current user
socket.on('answer:new', (data) => {
    if (data.answer && data.answer.author?._id !== user?._id) {
        setAnswers(prev => [data.answer, ...prev]);
    }
});
```

---

### Bug #4: Server 429 Errors Require Restart

**Severity:** 🔴 High

**Description:** After hitting rate limits (429 errors), the server enters a degraded state where all subsequent requests return 429 until the server is restarted. The user is also logged out.

**Affected Files:**
- `/backend/middleware/rateLimiter.js`
- `/backend/app.js` or server initialization

**Root Cause:** The rate limiter is using memory store which gets corrupted or the rate limiter middleware is not properly resetting after errors. The rate limiter might be applied globally too aggressively.

**Error Logs:**
```
GET /api/questions?page=1&sort=views 429 0.181 ms - 53
GET /api/questions?page=1&sort=newest 429 0.158 ms - 53
GET /api/faqs?page=1 429 0.142 ms - 53
... all subsequent requests return 429
```

**Steps to Reproduce:**
1. Login to the application
2. Spam any API endpoint rapidly (20+ requests in 2 seconds)
3. Server starts returning 429 for all endpoints
4. User is logged out
5. Server must be restarted to恢复正常

**Expected Behavior:**
- Rate limiter should only block the specific user/IP that exceeded the limit
- Other users should still be able to access the API
- The blocked user should be able to try again after the rate limit window expires
- Server should not require restart

**Suggested Fix:**

1. **Use Redis store instead of memory:**
```javascript
// rateLimiter.js
const RedisStore = require('rate-limit-redis');
const { getRedis } = require('../config/redis');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    store: new RedisStore({
        sendCommand: (...args) => getRedis().call(...args),
    }),
    keyGenerator: (req) => req.user?._id?.toString() || req.ip,
    skip: (req) => req.user?.role === 'admin', // Admins bypass
});
```

2. **Add different limiters for different routes:**
```javascript
// Apply stricter limits to vote routes only
const voteLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    store: new RedisStore({ sendCommand: (...args) => getRedis().call(...args) }),
});

// In routes
router.post('/votes', auth, voteLimiter, voteController.vote);
```

3. **Ensure rate limiter doesn't block all routes:**
```javascript
// Apply to specific routes only, not globally
app.use('/api/auth', authLimiter);
app.use('/api/votes', voteLimiter);
app.use('/api/questions', apiLimiter);
```

---

### Bug #5: View Count Increments on Same User Repeat Visits

**Severity:** 🟡 Low-Medium

**Description:** The view count for questions increments every time the same user visits the page, even if they have already viewed it multiple times. This inflates view statistics.

**Affected Files:**
- `/backend/controllers/questionController.js`
- `/frontend/app/questions/[id]/page.js`

**Root Cause:** The view count is incremented on every GET request to `/questions/:id` without any session or user-based deduplication. There's no tracking of which users have viewed which questions.

**Current Code:**
```javascript
// questionController.js - getQuestion function
await Question.findByIdAndUpdate(question._id, { $inc: { viewCount: 1 } });
```

**Steps to Reproduce:**
1. Login as any user
2. Go to any question page
3. Refresh the page 10 times
4. View count increases by 10
5. Logout and login as same user
6. Visit same question again - view count increases again

**Expected Behavior:**
- A user should only increment view count ONCE per question
- Subsequent visits by the same user should NOT increase view count
- Different users should each increment once
- Guest users should have session-based deduplication

**Suggested Fix:**

1. **Create a QuestionView model:**
```javascript
// models/QuestionView.js
const questionViewSchema = new mongoose.Schema({
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String }, // For guests
    viewedAt: { type: Date, default: Date.now },
});

questionViewSchema.index({ question: 1, user: 1 }, { unique: true, partialFilterExpression: { user: { $ne: null } } });
questionViewSchema.index({ question: 1, sessionId: 1 }, { unique: true, partialFilterExpression: { sessionId: { $ne: null } } });

module.exports = mongoose.model('QuestionView', questionViewSchema);
```

2. **Update questionController.js:**
```javascript
const QuestionView = require('../models/QuestionView');

exports.getQuestion = async (req, res, next) => {
    try {
        const question = await Question.findOne({ _id: req.params.id, isDeleted: false })
            .populate('author', 'username displayName avatar reputation website')
            .populate('tags', 'name color description')
            .populate({ path: 'acceptedAnswer', populate: { path: 'author', select: 'username displayName avatar reputation' } });

        if (!question) throw new AppError('Question not found', 404);

        // Track view with deduplication
        const userId = req.user?._id;
        const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
        
        const hasViewed = await QuestionView.findOne({
            question: question._id,
            ...(userId ? { user: userId } : { sessionId }),
        });

        if (!hasViewed) {
            await Question.findByIdAndUpdate(question._id, { $inc: { viewCount: 1 } });
            await QuestionView.create({
                question: question._id,
                user: userId || null,
                sessionId: sessionId || null,
            });
        }

        res.json({ question });
    } catch (err) {
        next(err);
    }
};
```

3. **Generate session ID for guest users in frontend:**
```javascript
// In layout.js or a utility
import { v4 as uuidv4 } from 'uuid';

const getSessionId = () => {
    let sessionId = localStorage.getItem('guest_session_id');
    if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem('guest_session_id', sessionId);
    }
    return sessionId;
};

// Add to API headers
api.defaults.headers.common['X-Session-Id'] = getSessionId();
```

---

## Summary Table

| Bug ID | Severity | Description | Status |
|--------|----------|-------------|--------|
| #1 | 🔴 High | User can upvote and downvote same content | Pending |
| #2 | 🔴 High | Rate limiter causes logout and server restart | Pending |
| #3 | 🟠 Medium | Duplicate answer display on post | Pending |
| #4 | 🔴 High | 429 errors require server restart | Pending |
| #5 | 🟡 Low-Medium | View count increments on same user repeat visits | Pending |

---

## Additional Recommendations

1. **Add request deduplication middleware** for idempotent operations
2. **Implement proper Redis session store** for rate limiting
3. **Add circuit breaker pattern** for external service calls
4. **Improve error handling** to distinguish between client errors and server failures
5. **Add health check endpoint** to monitor server status
6. **Implement graceful shutdown** instead of requiring manual restart

---

*Document created on: 2026-05-29*
*Ready for additional bug reports*