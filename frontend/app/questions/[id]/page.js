'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const socket = useSocket();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [answering, setAnswering] = useState(false);
  const [userVotes, setUserVotes] = useState({});
  const [saved, setSaved] = useState(false);
  const [downvoteModal, setDownvoteModal] = useState({ open: false, targetType: null, targetId: null });
  const [selectedReason, setSelectedReason] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [mergedQuestions, setMergedQuestions] = useState([]);
  const [showMerged, setShowMerged] = useState(false);
  const [mergeModal, setMergeModal] = useState({ open: false, selected: [] });
  const [similarForMerge, setSimilarForMerge] = useState([]);

  const fetchQuestion = useCallback(async () => {
    try {
      const data = await api.get(`/questions/${id}`);
      setQuestion(data.question);
      setLoading(false);
    } catch (err) {
      toast.error('Question not found');
      router.push('/questions');
    }
  }, [id, router]);

  const fetchAnswers = useCallback(async () => {
    try {
      const data = await api.get(`/answers/question/${id}`);
      setAnswers(Array.isArray(data.answers) ? data.answers : []);
    } catch (err) {
      console.error('Failed to fetch answers:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchQuestion();
    fetchAnswers();
  }, [fetchQuestion, fetchAnswers]);

  useEffect(() => {
    if (question?.isMasterFAQ) {
      api.get(`/questions/${id}/merged-questions`)
        .then(data => setMergedQuestions(data.mergedQuestions || []))
        .catch(() => {});
    } else {
      setMergedQuestions([]);
    }
  }, [question?.isMasterFAQ, id]);

  useEffect(() => {
    if (socket && id) {
      socket.emit('join:question', id);
      socket.on('answer:new', (data) => {
        if (data.answer) {
          setAnswers(prev => [data.answer, ...prev]);
        }
      });
      return () => {
        socket.emit('leave:question', id);
        socket.off('answer:new');
      };
    }
  }, [socket, id]);

  const handleVote = async (targetType, targetId, voteType, reason, reasonText) => {
    if (!user) { toast.error('Please login to vote'); return; }
    if (voteType === 'downvote' && !reason) {
      setDownvoteModal({ open: true, targetType, targetId });
      return;
    }
    try {
      await api.post('/votes', { targetType, targetId, voteType, reason, reasonText });
      setDownvoteModal({ open: false, targetType: null, targetId: null });
      setSelectedReason('');
      setReasonText('');

      if (targetType === 'Answer') {
        setAnswers(prev => prev.map(a => {
          if (a._id === targetId) {
            const delta = voteType === 'upvote' ? 1 : -1;
            return { ...a, upvotes: a.upvotes + delta };
          }
          return a;
        }));
      }

      if (targetType === 'Question') {
        fetchQuestion();
      } else {
        fetchAnswers();
      }
    } catch (err) {
      toast.error(err.message || 'Vote failed');
    }
  };

  const submitDownvote = () => {
    handleVote(downvoteModal.targetType, downvoteModal.targetId, 'downvote', selectedReason, reasonText);
  };

  const handleSave = async () => {
    if (!user) { toast.error('Please login to save'); return; }
    try {
      if (saved) {
        await api.delete(`/users/me/saved/${id}`);
        setSaved(false);
        toast.success('Question unsaved');
      } else {
        await api.post('/users/me/saved', { questionId: id });
        setSaved(true);
        toast.success('Question saved');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to answer'); return; }
    if (newAnswer.length < 10) { toast.error('Answer too short'); return; }

    setAnswering(true);
    try {
      const data = await api.post(`/answers/question/${id}`, { body: newAnswer });
      setAnswers(prev => [data.answer, ...prev]);
      setNewAnswer('');
      toast.success('Answer posted!');
    } catch (err) {
      toast.error(err.message || 'Failed to post answer');
    } finally {
      setAnswering(false);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await api.post(`/answers/${answerId}/accept`);
      fetchQuestion();
      fetchAnswers();
      toast.success('Answer accepted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      toast.success('Question deleted');
      router.push('/questions');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleVerify = async () => {
    try {
      await api.patch(`/questions/${id}/verify`);
      toast.success('FAQ verified');
      fetchQuestion();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMarkOutdated = async () => {
    const reason = prompt('Reason for marking outdated (optional):');
    if (reason === null) return;
    try {
      await api.patch(`/questions/${id}/outdated`, { reason });
      toast.success('Marked as outdated');
      fetchQuestion();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleConfirmResolved = async () => {
    try {
      await api.patch(`/questions/${id}/confirm-resolution`);
      toast.success('Thanks for confirming! Glad we could help.');
      fetchQuestion();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEscalate = async () => {
    const reason = prompt('Why is the answer not working for you?');
    if (reason === null) return;
    try {
      await api.patch(`/questions/${id}/escalate`, { reason });
      toast.success('Question escalated. A moderator will review it.');
      fetchQuestion();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResolveEscalation = async () => {
    const note = prompt('Resolution note (optional):');
    try {
      await api.patch(`/questions/${id}/escalate/resolve`, { resolutionNote: note });
      toast.success('Escalation resolved');
      fetchQuestion();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePromoteMaster = async () => {
    if (!confirm('Promote this FAQ to a Master FAQ? Other similar questions can be merged into it.')) return;
    try {
      await api.patch(`/questions/${id}/promote-master`);
      toast.success('Promoted to Master FAQ');
      fetchQuestion();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMergeFAQ = async () => {
    const masterId = prompt('Enter the ID of the Master FAQ to merge this question into:');
    if (!masterId) return;
    try {
      await api.patch(`/questions/${id}/merge`, { masterFAQId: masterId });
      toast.success('Question merged into Master FAQ');
      fetchQuestion();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleOpenMergeModal = async () => {
    try {
      const data = await api.get('/questions/similar', { title: question.title });
      const questions = (data.similar || []).concat(data.duplicates || []).filter(q => q._id !== id && q.status !== 'closed');
      setSimilarForMerge(questions);
      setMergeModal({ open: true, selected: [] });
    } catch (err) {
      toast.error('Failed to fetch similar questions');
    }
  };

  const handleMergeSelected = async () => {
    if (mergeModal.selected.length === 0) {
      toast.error('Select at least one question to merge');
      return;
    }
    if (!question.isMasterFAQ && !confirm('This will promote the current question to Master FAQ first. Continue?')) {
      return;
    }
    try {
      if (!question.isMasterFAQ) {
        await api.patch(`/questions/${id}/promote-master`);
      }
      for (const qId of mergeModal.selected) {
        await api.patch(`/questions/${qId}/merge`, { masterFAQId: id });
      }
      toast.success(`Merged ${mergeModal.selected.length} questions into this Master FAQ`);
      setMergeModal({ open: false, selected: [] });
      fetchQuestion();
      if (question.isMasterFAQ) {
        const data = await api.get(`/questions/${id}/merged-questions`);
        setMergedQuestions(data.mergedQuestions || []);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleMergeSelection = (qId) => {
    setMergeModal(prev => ({
      ...prev,
      selected: prev.selected.includes(qId)
        ? prev.selected.filter(id => id !== qId)
        : [...prev.selected, qId]
    }));
  };

  if (loading && !question) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Question Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{question.title}</h1>
          <div className="flex gap-2 ml-4">
            {user && (user.role === 'admin' || user.role === 'moderator') && (
              <>
                <button onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm px-2 py-1">
                  Delete
                </button>
                {!question.isVerified && (
                  <button onClick={handleVerify} className="text-green-600 hover:text-green-800 text-sm px-2 py-1">
                    Verify
                  </button>
                )}
                <button onClick={handleMarkOutdated} className="text-yellow-600 hover:text-yellow-800 text-sm px-2 py-1">
                  Mark Outdated
                </button>
                {!question.isMasterFAQ && (
                  <button onClick={handlePromoteMaster} className="text-purple-600 hover:text-purple-800 text-sm px-2 py-1">
                    Promote to Master
                  </button>
                )}
                {!question.isMasterFAQ && (
                  <button onClick={handleMergeFAQ} className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1">
                    Merge into Master
                  </button>
                )}
                {question.isMasterFAQ && (
                  <button onClick={handleOpenMergeModal} className="text-indigo-600 hover:text-indigo-800 text-sm px-2 py-1">
                    Merge Similar
                  </button>
                )}
                {question.escalated && !question.escalationResolved && (
                  <button onClick={handleResolveEscalation} className="text-orange-600 hover:text-orange-800 text-sm px-2 py-1">
                    Resolve Escalation
                  </button>
                )}
              </>
            )}
            <button onClick={handleSave} className="text-gray-600 hover:text-gray-800">
              {saved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        </div>

        {/* Question metadata */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span>Asked by {question.author?.displayName || question.author?.username || 'Unknown'}</span>
          <span>{formatDate(question.createdAt)}</span>
          <span>{question.views || 0} views</span>
          <div className="flex items-center gap-2">
            <button onClick={() => handleVote('Question', question._id, 'upvote')} className="text-green-600 hover:text-green-800">
              ▲ {question.upvotes || 0}
            </button>
            <button onClick={() => handleVote('Question', question._id, 'downvote')} className="text-red-600 hover:text-red-800">
              ▼
            </button>
          </div>
        </div>

        {/* Question body */}
        <div className="prose max-w-none mb-4">
          <MarkdownRenderer content={question.body} />
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {question.tags.map(tag => (
              <Link key={tag} href={`/questions?tag=${tag}`} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-200">
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {question.isVerified && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified FAQ</span>
          )}
          {question.isMasterFAQ && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Master FAQ</span>
          )}
          {question.outdated && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Outdated</span>
          )}
          {question.escalated && (
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
              Escalated {question.escalationResolved && '(Resolved)'}
            </span>
          )}
          {question.acceptedAnswer && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Has Accepted Answer</span>
          )}
        </div>

        {/* Merged questions section */}
        {question.isMasterFAQ && mergedQuestions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button onClick={() => setShowMerged(!showMerged)} className="text-sm text-gray-600 hover:text-gray-800">
              {showMerged ? 'Hide' : 'Show'} merged questions ({mergedQuestions.length})
            </button>
            {showMerged && (
              <div className="mt-2 space-y-2">
                {mergedQuestions.map(mq => (
                  <Link key={mq._id} href={`/questions/${mq._id}`} className="block p-2 bg-gray-50 rounded hover:bg-gray-100">
                    <h4 className="text-sm font-medium text-gray-900">{mq.title}</h4>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Answers section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {answers.map(answer => (
          <div key={answer._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="font-medium text-gray-900">
                  {answer.author?.displayName || answer.author?.username || 'Unknown'}
                </div>
                <div className="text-sm text-gray-500">{formatDate(answer.createdAt)}</div>
                {answer.isAccepted && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Accepted Answer</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleVote('Answer', answer._id, 'upvote')} className="text-green-600 hover:text-green-800">
                  ▲ {answer.upvotes || 0}
                </button>
                <button onClick={() => handleVote('Answer', answer._id, 'downvote')} className="text-red-600 hover:text-red-800">
                  ▼
                </button>
                {user && user._id === question.author?._id && !question.acceptedAnswer && (
                  <button onClick={() => handleAcceptAnswer(answer._id)} className="text-blue-600 hover:text-blue-800 text-sm">
                    Accept
                  </button>
                )}
              </div>
            </div>
            <div className="prose max-w-none">
              <MarkdownRenderer content={answer.body} />
            </div>
          </div>
        ))}
      </div>

      {/* Post answer form */}
      {user ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Write your answer here... (Markdown supported)"
            />
            <div className="flex justify-end mt-4">
              <button type="submit" disabled={answering} className="btn-primary">
                {answering ? 'Posting...' : 'Post Answer'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">
            Please <Link href="/login" className="text-primary-600 hover:text-primary-700">login</Link> to answer this question.
          </p>
        </div>
      )}

      {/* Escalate button for unresolved issues */}
      {user && question.acceptedAnswer && (
        <div className="mt-4 text-center">
          <button onClick={handleEscalate} className="text-sm text-orange-600 hover:text-orange-800">
            Still having issues? Click to escalate
          </button>
        </div>
      )}

      {/* Confirm resolution button */}
      {user && user._id === question.author?._id && !question.resolutionConfirmed && question.acceptedAnswer && (
        <div className="mt-4 text-center">
          <button onClick={handleConfirmResolved} className="btn-primary">
            Confirm this resolved my issue
          </button>
        </div>
      )}

      {/* Downvote Modal */}
      {downvoteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why are you downvoting?</h3>
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Not helpful"
                  checked={selectedReason === 'Not helpful'}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="text-primary-600"
                />
                <span>Not helpful</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Outdated"
                  checked={selectedReason === 'Outdated'}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="text-primary-600"
                />
                <span>Outdated information</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Inaccurate"
                  checked={selectedReason === 'Inaccurate'}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="text-primary-600"
                />
                <span>Inaccurate</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Other"
                  checked={selectedReason === 'Other'}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="text-primary-600"
                />
                <span>Other</span>
              </label>
              {selectedReason === 'Other' && (
                <textarea
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="Please explain..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mt-2"
                  rows={3}
                />
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setDownvoteModal({ open: false, targetType: null, targetId: null }); setSelectedReason(''); setReasonText(''); }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button onClick={submitDownvote} className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700" disabled={!selectedReason}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Questions Modal */}
      {mergeModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Merge Questions into Master FAQ</h3>
              <button onClick={() => setMergeModal({ open: false, selected: [] })} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Select questions to merge into this Master FAQ. Similar questions are shown below.
            </p>
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {similarForMerge.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No similar questions found</p>
              ) : (
                similarForMerge.map(q => (
                  <label
                    key={q._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      mergeModal.selected.includes(q._id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={mergeModal.selected.includes(q._id)}
                      onChange={() => toggleMergeSelection(q._id)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{q.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{q.answerCount || 0} answers</span>
                        <span>by {q.author?.displayName || q.author?.username || 'Unknown'}</span>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="flex gap-3 justify-end border-t pt-4">
              <button onClick={() => setMergeModal({ open: false, selected: [] })} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Cancel
              </button>
              <button onClick={handleMergeSelected} className="px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700" disabled={mergeModal.selected.length === 0}>
                Merge {mergeModal.selected.length} Question{mergeModal.selected.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}