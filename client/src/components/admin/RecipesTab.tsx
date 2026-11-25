import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteRecipe, listCategories, listRecipes } from '../../api/admin';
import type { AdminRecipe } from '../../api/admin';
import { usePaginated } from '../../hooks/usePaginated';
import { toast } from '../../store/useToastStore';
import type { Category } from '../../types';
import { getErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/format';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import DataState from '../ui/DataState';
import Input from '../ui/Input';
import Pagination from '../ui/Pagination';
import Select from '../ui/Select';

export default function RecipesTab() {
  const list = usePaginated<AdminRecipe, { category?: string }>(listRecipes, {});
  const [categories, setCategories] = useState<Category[]>([]);
  const [toDelete, setToDelete] = useState<AdminRecipe | null>(null);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((err: unknown) => toast.error(getErrorMessage(err)));
  }, []);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const res = await deleteRecipe(toDelete._id);
      toast.success(`Đã xóa "${toDelete.title}" (kèm ${res.deleted.comments} bình luận)`);
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
          label="Tìm theo tiêu đề"
          type="search"
          placeholder="Nhập để tìm..."
          value={list.searchInput}
          onChange={(e) => list.setSearch(e.target.value)}
        />
        <Select
          label="Danh mục"
          value={list.filters.category ?? ''}
          onChange={(e) => list.updateFilters({ category: e.target.value || undefined })}
        >
          <option value="">Tất cả</option>
          <option value="none">Chưa phân loại</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
        {list.data && <span className="summary">{list.data.total} công thức</span>}
      </div>

      <DataState
        loading={list.loading}
        error={list.error}
        hasData={list.data !== null}
        isEmpty={items.length === 0}
        emptyText="Không tìm thấy công thức nào."
        onRetry={list.reload}
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Tác giả</th>
                <th>Danh mục</th>
                <th className="num">Thích</th>
                <th className="num">Bình luận</th>
                <th>Ngày đăng</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r._id}>
                  <td className="cell-truncate" title={r.title}>
                    <Link to={`/recipes/${r._id}`}>{r.title}</Link>
                  </td>
                  <td>{r.author?.name ?? <span className="muted">Không rõ</span>}</td>
                  <td>{r.category?.name ?? <span className="muted">Chưa phân loại</span>}</td>
                  <td className="num">{r.likesCount}</td>
                  <td className="num">{r.commentCount}</td>
                  <td>{formatDate(r.createdAt)}</td>
                  <td className="actions">
                    <Button size="sm" variant="ghost" className="btn-link-danger" onClick={() => setToDelete(r)}>
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
        title="Xóa công thức vi phạm?"
        confirmLabel="Xóa"
        message={
          toDelete && (
            <p>
              Xóa công thức <strong>{toDelete.title}</strong>? {toDelete.commentCount} bình luận của bài này cũng sẽ
              bị xóa và bài sẽ biến mất khỏi danh sách đã lưu của mọi người. Không thể hoàn tác.
            </p>
          )
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
