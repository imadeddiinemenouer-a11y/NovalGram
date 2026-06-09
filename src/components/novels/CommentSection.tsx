import React, { useState, useEffect } from 'react';
import { Send, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getComments, addComment } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Comment } from '../../types';

interface CommentSectionProps {
  chapterId: string;
}

export default function CommentSection({ chapterId }: CommentSectionProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [chapterId]);

  async function loadComments() {
    try {
      setIsLoading(true);
      const data = await getComments(chapterId);
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const comment = await addComment({
        user_id: user.id,
        chapter_id: chapterId,
        content: newComment.trim(),
      });
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-[var(--txt3)] uppercase tracking-wider">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--v)] to-[var(--mg)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.display_name?.[0] || user.username?.[0] || 'U'}
          </div>
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 bg-[var(--surface2)] border border-[var(--b2)] rounded-full px-4 py-2 text-sm text-[var(--txt)] placeholder-[var(--txt3)] focus:outline-none focus:border-[var(--v)] transition-colors"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-[var(--v)] to-[var(--mg)] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-[var(--txt3)]">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--surface2)] flex items-center justify-center text-sm flex-shrink-0">
                {(comment.user as any)?.emoji || '🦋'}
              </div>
              <div className="flex-1 bg-[var(--surface2)] rounded-2xl rounded-tl-none px-3 py-2">
                <div className="text-xs font-bold text-[var(--vb)] mb-1">
                  {(comment.user as any)?.display_name || (comment.user as any)?.username || 'User'}
                </div>
                <p className="text-sm text-[var(--txt2)] leading-relaxed">{comment.content}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-[var(--txt3)]">{formatDate(comment.created_at)}</span>
                  <button className="text-[10px] text-[var(--txt3)] hover:text-[var(--mg)] transition-colors flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {(comment as any).likes || 0}
                  </button>
                  <button className="text-[10px] text-[var(--txt3)] hover:text-[var(--txt2)] transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}