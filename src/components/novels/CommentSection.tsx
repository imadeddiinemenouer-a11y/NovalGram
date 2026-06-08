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
        content: newComment.trim()
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
    <div className="space-y-6">
      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow ${
            isDark ? 'bg-gray-700 text-gray-200' : 'bg-indigo-100 text-indigo-600'
          }`}>
            {user.display_name?.[0] || user.username?.[0] || 'U'}
          </div>
          <div className="flex-1 space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className={`w-full px-4 py-3 rounded-xl resize-none border focus:outline-none focus:ring-2 transition-all ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-red-500'
                  : 'bg-gray-100 border-transparent focus:bg-white focus:ring-indigo-500 focus:border-indigo-300'
              }`}
              rows={3}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : comments.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <MessageCircle className={`w-14 h-14 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
          <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-2xl transition-all hover:shadow-md ${
                isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-100/70 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow ${
                  isDark ? 'bg-gray-700 text-gray-200' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {comment.user?.display_name?.[0] || comment.user?.username?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {comment.user?.display_name || comment.user?.username || 'Unknown'}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatDate(comment.created_at)}
                  </p>
                </div>
              </div>
              <p className={`text-sm leading-relaxed pl-12 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {comment.content}
              </p>
              <div className={`flex items-center gap-5 text-xs pl-12 mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <button className="flex items-center gap-1.5 hover:text-pink-500 transition-colors">
                  <Heart className="w-3.5 h-3.5" />
                  {comment.likes || 0}
                </button>
                <button className="hover:text-indigo-500 dark:hover:text-red-400 transition-colors font-medium">
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}