import { Router } from 'express';
import {
  createResource,
  bulkCreateResource,
  deleteResource,
  getResources,
  updateResource,
} from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';

export const resourceRouter = Router();

resourceRouter.get('/', protect, getResources);
resourceRouter.post('/', protect, createResource);
resourceRouter.post('/bulk', protect, bulkCreateResource);
resourceRouter.put('/:id', protect, updateResource);
resourceRouter.delete('/:id', protect, deleteResource);
