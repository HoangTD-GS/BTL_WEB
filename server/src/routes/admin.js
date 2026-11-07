import { Router } from 'express';

const router = Router();

// TODO: định nghĩa các endpoint cho /api/admin
router.get('/ping', (req, res) => res.json({ ok: true, route: 'admin' }));

export default router;
