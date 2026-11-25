import { useState } from 'react';
import { deleteUser, listUsers, updateUserRole } from '../../api/admin';
import type { AdminUser, Role } from '../../api/admin';
import { useAuth } from '../../context/useAuth';
import { usePaginated } from '../../hooks/usePaginated';
import { toast } from '../../store/useToastStore';
import { getErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/format';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import DataState from '../ui/DataState';
import Input from '../ui/Input';
import Pagination from '../ui/Pagination';
import Select from '../ui/Select';

export default function UsersTab() {
  const { user: me } = useAuth();
  const list = usePaginated<AdminUser, { role?: Role }>(listUsers, {});
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);
  const [roleChange, setRoleChange] = useState<{ user: AdminUser; role: Role } | null>(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const res = await deleteUser(toDelete._id);
      toast.success(
        `Đã xóa ${toDelete.name} (kèm ${res.deleted.recipes} công thức, ${res.deleted.comments} bình luận)`
      );
      list.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setToDelete(null);
  };

  const confirmRoleChange = async () => {
    if (!roleChange) return;
    try {
      await updateUserRole(roleChange.user._id, roleChange.role);
      toast.success(
        roleChange.role === 'admin'
          ? `${roleChange.user.name} đã trở thành quản trị viên`
          : `${roleChange.user.name} đã trở lại làm người dùng`
      );
      list.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setRoleChange(null);
  };

  const items = list.data?.items ?? [];

  return (
    <div>
      <div className="toolbar">
        <Input
          label="Tìm theo tên hoặc email"
          type="search"
          placeholder="Nhập để tìm..."
          value={list.searchInput}
          onChange={(e) => list.setSearch(e.target.value)}
        />
        <Select
          label="Vai trò"
          value={list.filters.role ?? ''}
          onChange={(e) => list.updateFilters({ role: (e.target.value || undefined) as Role | undefined })}
        >
          <option value="">Tất cả</option>
          <option value="user">Người dùng</option>
          <option value="admin">Quản trị viên</option>
        </Select>
        {list.data && <span className="summary">{list.data.total} người dùng</span>}
      </div>

      <DataState
        loading={list.loading}
        error={list.error}
        hasData={list.data !== null}
        isEmpty={items.length === 0}
        emptyText="Không tìm thấy người dùng nào."
        onRetry={list.reload}
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th className="num">Công thức</th>
                <th className="num">Bình luận</th>
                <th>Ngày tạo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((u) => {
                const isMe = u._id === me?._id;
                return (
                  <tr key={u._id}>
                    <td>
                      {u.name} {isMe && <span className="muted">(bạn)</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-admin' : ''}`}>
                        {u.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </span>
                    </td>
                    <td className="num">{u.recipeCount}</td>
                    <td className="num">{u.commentCount}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td className="actions">
                      {isMe ? null : u.role === 'admin' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setRoleChange({ user: u, role: 'user' })}
                        >
                          Hạ quyền
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setRoleChange({ user: u, role: 'admin' })}
                          >
                            Nâng quyền
                          </Button>
                          <Button size="sm" variant="ghost" className="btn-link-danger" onClick={() => setToDelete(u)}>
                            Xóa
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={list.page} totalPages={list.data?.totalPages ?? 1} onChange={list.setPage} />
      </DataState>

      <ConfirmDialog
        open={toDelete !== null}
        danger
        title="Xóa người dùng?"
        confirmLabel="Xóa"
        message={
          toDelete && (
            <p>
              Xóa <strong>{toDelete.name}</strong> ({toDelete.email})? Toàn bộ{' '}
              <strong>{toDelete.recipeCount}</strong> công thức và <strong>{toDelete.commentCount}</strong>{' '}
              bình luận của người này cũng sẽ bị xóa. Không thể hoàn tác.
            </p>
          )
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />

      <ConfirmDialog
        open={roleChange !== null}
        title={roleChange?.role === 'admin' ? 'Nâng lên quản trị viên?' : 'Hạ xuống người dùng?'}
        confirmLabel={roleChange?.role === 'admin' ? 'Nâng quyền' : 'Hạ quyền'}
        message={
          roleChange && (
            <p>
              {roleChange.role === 'admin'
                ? `${roleChange.user.name} sẽ có toàn quyền quản trị: xóa người dùng, công thức, bình luận và quản lý danh mục.`
                : `${roleChange.user.name} sẽ mất quyền quản trị.`}
            </p>
          )
        }
        onConfirm={confirmRoleChange}
        onCancel={() => setRoleChange(null)}
      />
    </div>
  );
}
