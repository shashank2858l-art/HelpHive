import { Router } from 'express';
import {
  approveVolunteer,
  createVolunteer,
  bulkCreateVolunteer,
  deleteVolunteer,
  getVolunteerById,
  getVolunteers,
  updateVolunteer,
} from '../controllers/volunteerController.js';
import { createVolunteerRegistration } from '../controllers/volunteerExperienceController.js';
import { protect } from '../middleware/authMiddleware.js';

export const volunteerRouter = Router();

volunteerRouter.get('/', protect, getVolunteers);
volunteerRouter.post('/', protect, createVolunteer);
volunteerRouter.post('/bulk', protect, bulkCreateVolunteer);
volunteerRouter.post('/register', createVolunteerRegistration);
volunteerRouter.get('/:id', protect, getVolunteerById);
volunteerRouter.put('/:id', protect, updateVolunteer);
volunteerRouter.put('/:id/approve', protect, approveVolunteer);
volunteerRouter.delete('/:id', protect, deleteVolunteer);
