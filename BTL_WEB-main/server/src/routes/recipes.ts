import { Router } from 'express';

const router = Router();

// TODO: định nghĩa các endpoint cho /api/recipes
router.get('/ping', (_req, res) => res.json({ ok: true, route: 'recipes' }));

export default router;
