import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../../api/admin';
import type { Category } from '../../types';
import { toast } from '../../store/useToastStore';
import { getErrorMessage } from '../../utils/errors';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';

export default function CategoriesTab() {
  const [items, setItems] = useState<Category[] | null>(null);
  const [loadError, setLoadError] = useState('');

  const [newName, setNewName] = useState('');
  const [newError, setNewError] = useState('');
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<Category | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await listCategories());
      setLoadError('');
    } catch (err) {
      setLoadError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    listCategories()
      .then((res) => {
        if (!cancelled) setItems(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      setNewError('Vui lòng nhập tên danh mục');
      return;
    }
    setAdding(true);
    try {
      await createCategory(name);
      toast.success(`Đã thêm danh mục "${name}"`);
      setNewName('');
      setNewError('');
      await load();
    } catch (err) {
      setNewError(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (c: Category) => {
    setEditingId(c._id);
    setEditName(c.name);
    setEditError('');
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const name = editName.trim();
    if (!name) {
      setEditError('Tên không được để trống');
      return;
    }
    setSaving(true);
    try {
      await updateCategory(editingId, name);
      toast.success('Đã đổi tên danh mục');
      setEditingId(null);
      await load();
    } catch (err) {
      setEditError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteCategory(toDelete._id);
      toast.success(`Đã xóa danh mục "${toDelete.name}"`);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setToDelete(null);
  };

  if (loadError) {
    return (
      <div className="stack">
        <Alert type="error">{loadError}</Alert>
        <div>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }
  if (!items) return <Spinner />;

  return (
    <div>
      <form className="inline-form add-category" onSubmit={handleAdd} noValidate>
        <Input
          label="Thêm danh mục mới"
          placeholder="Ví dụ: Món nướng"
          value={newName}
          error={newError}
          onChange={(e) => {
            setNewName(e.target.value);
            setNewError('');
          }}
        />
        <Button type="submit" loading={adding}>
          Thêm
        </Button>
      </form>

      {items.length === 0 ? (
        <p className="empty">Chưa có danh mục nào.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tên danh mục</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id}>
                  <td>
                    {editingId === c._id ? (
                      <form className="inline-form" onSubmit={handleSave} noValidate>
                        <Input
                          label="Tên danh mục"
                          value={editName}
                          error={editError}
                          autoFocus
                          onChange={(e) => {
                            setEditName(e.target.value);
                            setEditError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <Button type="submit" size="sm" loading={saving}>
                          Lưu
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingId(null)} disabled={saving}>
                          Hủy
                        </Button>
                      </form>
                    ) : (
                      c.name
                    )}
                  </td>
                  <td className="actions">
                    {editingId !== c._id && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => startEdit(c)}>
                          Sửa
                        </Button>
                        <Button size="sm" variant="ghost" className="btn-link-danger" onClick={() => setToDelete(c)}>
                          Xóa
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        danger
        title="Xóa danh mục?"
        confirmLabel="Xóa"
        message={
          toDelete && (
            <p>
              Xóa danh mục <strong>{toDelete.name}</strong>? Nếu còn công thức đang dùng danh mục này, hệ thống sẽ
              không cho xóa.
            </p>
          )
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
