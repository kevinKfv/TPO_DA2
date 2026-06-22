import { Router } from 'express';
import { getCatalogByAuction } from './catalogo.controller';

const router = Router();

// Endpoint enfocado a resolver los ítems pertenecientes a una subasta específica
router.get('/subasta/:subastaId', getCatalogByAuction);

export default router;