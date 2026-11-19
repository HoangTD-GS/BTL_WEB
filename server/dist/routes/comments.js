import { Router } from 'express';
const router = Router();
// TODO: định nghĩa các endpoint cho /api/comments
router.get('/ping', (_req, res) => res.json({ ok: true, route: 'comments' }));
export default router;
