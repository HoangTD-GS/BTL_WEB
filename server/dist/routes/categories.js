import { Router } from 'express';
const router = Router();
// TODO: định nghĩa các endpoint cho /api/categories
router.get('/ping', (_req, res) => res.json({ ok: true, route: 'categories' }));
export default router;
