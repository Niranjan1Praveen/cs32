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

      // Optimistic update for answers - update locally then verify with fetch
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
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setDownvoteModal({ open: false, targetType: null, targetId: null }); setSelectedReason(''); setReasonText(''); }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={submitDownvote} className="btn-danger" disabled={!selectedReason}>
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
              <button onClick={() => setMergeModal({ open: false, selected: [] })} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleMergeSelected} className="btn-primary" disabled={mergeModal.selected.length === 0}>
                Merge {mergeModal.selected.length} Question{mergeModal.selected.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
