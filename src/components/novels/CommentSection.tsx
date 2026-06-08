import React, { useState, useEffect } from 'react';
import { Send, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getComments, addComment } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Comment } from '../../types';

interface CommentSectionProps {
  chapterId: string;
}

export default function CommentSection({ chapterId }: CommentSectionProps) {
  const { user } = useAuth();
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
    <div>
      <h3 className="font-semibold text-lg mb-4">Comments ({comments.length})</h3>

      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium flex-shrink-0">
              {user.display_name?.[0] || user.username[0]}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-4 py-3 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-100/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-sm">
                  {comment.user?.display_name?.[0] || comment.user?.username?.[0] || 'U'}
                </div>
                <span className="font-medium text-sm">{comment.user?.display_name || comment.user?.username || 'Unknown'}</span>
                <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
              </div>
              <p className="text-sm mb-3 pl-10">{comment.content}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500 pl-10">
                <button className="flex items-center gap-1 hover:text-pink-600 transition-colors">
                  <Heart className="w-3 h-3" />
                  {comment.likes || 0}
                </button>
                <button className="hover:text-indigo-600 transition-colors">Reply</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
