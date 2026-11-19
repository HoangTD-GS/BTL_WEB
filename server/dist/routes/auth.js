import { Router } from 'express';
const router = Router();
// TODO: định nghĩa các endpoint cho /api/auth
router.get('/ping', (_req, res) => res.json({ ok: true, route: 'auth' }));
export default router;
