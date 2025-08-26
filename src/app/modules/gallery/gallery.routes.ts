import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { GalleryController } from './gallery.controller';
import GalleryValidation from './gallery.validation';
import { upload } from '../../utils/handelFile';

const router = Router();

router
  .route('/')
  .post(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    upload.single('image'),
    validateRequest(GalleryValidation.CreateGallerySchema),
    GalleryController.CreateGallery,
  )
  .get(GalleryController.GetAllGallery);

router
  .route('/:id')
  .get(GalleryController.GetSingleGallery)
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    upload.single('image'),
    validateRequest(GalleryValidation.UpdateGallerySchema),
    GalleryController.UpdateGallery,
  )
  .delete(auth(Role.SUPER_ADMIN, Role.ADMIN), GalleryController.DeleteGallery);

export const GalleryRouter = router;
