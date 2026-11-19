import { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteComment, listComments } from '../../api/admin';
import type { AdminComment } from '../../api/admin';
import { usePaginated } from '../../hooks/usePaginated';
import { toast } from '../../store/useToastStore';
import { getErrorMessage } from '../../utils/errors';
import { formatDate, truncate } from '../../utils/format';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import DataState from '../ui/DataState';
import Input from '../ui/Input';
import Pagination from '../ui/Pagination';

export default function CommentsTab() {
  const list = usePaginated<AdminComment>(listComments, {});
  const [toDelete, setToDelete] = useState<AdminComment | null>(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteComment(toDelete._id);
      toast.success('Đã xóa bình luận');
      list.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setToDelete(null);
  };

  const items = list.data?.items ?? [];

  return (
    <div>
      <div className="toolbar">
        <Input
          label="Tìm theo nội dung bình luận"
          type="search"
          placeholder="Nhập để tìm..."
          value={list.searchInput}
          onChange={(e) => list.setSearch(e.target.value)}
        />
        {list.data && <span className="summary">{list.data.total} bình luận</span>}
      </div>

      <DataState
        loading={list.loading}
        error={list.error}
        hasData={list.data !== null}
        isEmpty={items.length === 0}
        emptyText="Không tìm thấy bình luận nào."
        onRetry={list.reload}
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nội dung</th>
                <th>Người viết</th>
                <th>Công thức</th>
                <th>Ngày</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id}>
                  <td className="cell-truncate" title={c.content}>
                    {truncate(c.content, 120)}
                  </td>
                  <td>{c.user?.name ?? <span className="muted">Không rõ</span>}</td>
                  <td className="cell-truncate">
                    {c.recipe ? (
                      <Link to={`/recipes/${c.recipe._id}`}>{c.recipe.title}</Link>
                    ) : (
                      <span className="muted">Không rõ</span>
                    )}
                  </td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td className="actions">
                    <Button size="sm" variant="ghost" className="btn-link-danger" onClick={() => setToDelete(c)}>
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={list.page} totalPages={list.data?.totalPages ?? 1} onChange={list.setPage} />
      </DataState>

      <ConfirmDialog
        open={toDelete !== null}
        danger
        title="Xóa bình luận?"
        confirmLabel="Xóa"
        message={toDelete && <p className="cell-wrap">“{truncate(toDelete.content, 200)}”</p>}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
