import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { addComment, deleteComment } from '../../api/recipes';
import { useAuth } from '../../context/useAuth';
import { toast } from '../../store/useToastStore';
import type { Comment, PersonRef } from '../../types';
import { getErrorMessage } from '../../utils/errors';
import { formatDate, initials, timeAgo } from '../../utils/format';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import Textarea from '../ui/Textarea';

interface CommentSectionProps {
  recipeId: string;
  recipeAuthorId?: string;
  comments: Comment[];
  onChange: (comments: Comment[]) => void;
}

const MAX = 1000;

const commenter = (c: Comment): PersonRef | null => (c.user && typeof c.user === 'object' ? c.user : null);

export default function CommentSection({ recipeId, recipeAuthorId, comments, onChange }: CommentSectionProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [toDelete, setToDelete] = useState<Comment | null>(null);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const text = content.trim();
    if (!text) {
      setError('Vui lòng nhập nội dung bình luận');
      return;
    }
    setError('');
    setSending(true);
    try {
      const created = await addComment(recipeId, text);
      onChange([created, ...comments]);
      setContent('');
      toast.success('Đã đăng bình luận');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') void submit();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteComment(toDelete._id);
      onChange(comments.filter((c) => c._id !== toDelete._id));
      toast.success('Đã xóa bình luận');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setToDelete(null);
  };

  return (
    <section className="comments no-print" aria-labelledby="comments-title">
      <h2 id="comments-title">Bình luận ({comments.length})</h2>

      {user ? (
        <form className="comment-form" onSubmit={submit} noValidate>
          <Textarea
            label="Chia sẻ cảm nhận hoặc mẹo nấu của bạn"
            placeholder="Món này mình đã thử và..."
            value={content}
            maxLength={MAX}
            error={error}
            hint="Nhấn Ctrl + Enter để gửi nhanh"
            onKeyDown={onKeyDown}
            onChange={(e) => {
              setContent(e.target.value);
              setError('');
            }}
          />
          <div className="row">
            <span />
            <Button type="submit" loading={sending} disabled={!content.trim()}>
              Gửi bình luận
            </Button>
          </div>
        </form>
      ) : (
        <p className="empty" style={{ marginBottom: 16 }}>
          <Link to="/login" state={{ from: location.pathname }}>
            Đăng nhập
          </Link>{' '}
          để tham gia bình luận.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="muted">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => {
            const person = commenter(comment);
            const name = person?.name ?? 'Người dùng đã xóa';
            const canDelete = Boolean(user && (person?._id === user._id || user.role === 'admin'));
            return (
              <li key={comment._id} className="comment-item">
                <span className="avatar">{initials(name)}</span>
                <div className="comment-body">
                  <div className="comment-head">
                    <strong>{name}</strong>
                    {person && person._id === recipeAuthorId && <span className="badge badge-admin">Tác giả</span>}
                    <time className="muted" dateTime={comment.createdAt} title={new Date(comment.createdAt).toLocaleString('vi-VN')}>
                      {timeAgo(comment.createdAt)}
                    </time>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
                {canDelete && (
                  <button className="comment-delete" onClick={() => setToDelete(comment)} aria-label={`Xóa bình luận của ${name} ngày ${formatDate(comment.createdAt)}`}>
                    Xóa
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        danger
        title="Xóa bình luận?"
        confirmLabel="Xóa"
        message={toDelete && <p className="comment-text">“{toDelete.content}”</p>}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
