'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Send, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDateRelative } from '@/lib/utils';
import type { Comment, Profile } from '@/lib/types/database';

type CommentWithProfile = Comment & { profiles: Profile | null };

export function CommentSection({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchComments();
    getUser();
  }, [articleId]);

  const getUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      if (profile) setUserRole((profile as { role: string }).role);
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles!comments_user_id_fkey(*)')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });
    if (data) setComments(data as unknown as CommentWithProfile[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;

    setLoading(true);
    const { error } = await supabase.from('comments').insert({
      article_id: articleId,
      user_id: userId,
      content: newComment.trim(),
    } as never);

    if (!error) {
      setNewComment('');
      fetchComments();
    }
    setLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId as never);
    if (!error) fetchComments();
  };

  const canDelete = (comment: CommentWithProfile) => {
    return (
      userId === comment.user_id ||
      userRole === 'admin' ||
      userRole === 'moderator'
    );
  };

  return (
    <section className="mt-12 border-t border-dark-700 pt-8">
      <h2 className="text-xl font-bold text-dark-50 mb-6">
        Comments ({comments.length})
      </h2>

      {userId ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/50 focus:border-crimson-500 resize-none"
            />
          </div>
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-dark-400 mb-8">
          Sign in to leave a comment.
        </p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-dark-800/50 border border-dark-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {comment.profiles?.avatar_url ? (
                  <Image
                    src={comment.profiles.avatar_url}
                    alt={comment.profiles.username}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-dark-600 flex items-center justify-center text-xs text-dark-300">
                    {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <span className="text-sm font-medium text-dark-200">
                  {comment.profiles?.username || 'Unknown'}
                </span>
                <span className="text-xs text-dark-500">
                  {formatDateRelative(comment.created_at)}
                </span>
              </div>
              {canDelete(comment) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-1 text-dark-500 hover:text-crimson-400 transition-colors"
                  aria-label="Delete comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-dark-300 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-sm text-dark-500 py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </section>
  );
}
