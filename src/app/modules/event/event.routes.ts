import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { EventController } from './event.controller';
import { EventValidation } from './event.validation';
import { upload } from '../../utils/handelFile';

const router = Router();

router
  .route('/')
  .post(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    upload.single('cover_image'),
    validateRequest(EventValidation.CreateEventSchema),
    EventController.CreateEvent,
  )
  .get(EventController.GetAllEvent);

router
  .route('/:id')
  .get(EventController.GetSingleEvent)
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    upload.single('cover_image'),
    validateRequest(EventValidation.UpdateEventSchema),
    EventController.UpdateEvent,
  )
  .delete(auth(Role.SUPER_ADMIN, Role.ADMIN), EventController.DeleteEvent);

export const EventRouter = router;
