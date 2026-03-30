'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
    });

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
      .eq('id', commentId);
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
    <section className="comments-section">
      <div className="comments-header">
        <div className="comments-title">Discussion ({comments.length})</div>
      </div>

      {userId ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="comment-textarea"
          />
          <div className="comment-form-actions">
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="comment-submit-btn"
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <Link href="/auth/login" className="btn-login">Login with Discord</Link>
          <span>to join the discussion</span>
        </div>
      )}

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-item-header">
              <div className="comment-author">
                {comment.profiles?.avatar_url ? (
                  <Image
                    src={comment.profiles.avatar_url}
                    alt={comment.profiles.username}
                    width={28}
                    height={28}
                    className="comment-avatar"
                  />
                ) : (
                  <span className="comment-avatar-fallback">
                    {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
                <span className="comment-author-name">
                  {comment.profiles?.username || 'Unknown'}
                </span>
                <span className="comment-date">
                  {formatDateRelative(comment.created_at)}
                </span>
              </div>
              {canDelete(comment) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="comment-delete-btn"
                  aria-label="Delete comment"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="comment-body">
              {comment.content}
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="comments-empty">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </section>
  );
}
