import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BannerController } from './banner.controller';
import BannerValidation from './banner.validation';
import { upload } from '../../utils/handelFile';

const router = Router();

router
  .route('/')
  .post(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    upload.single('image'),
    validateRequest(BannerValidation.CreateBannerSchema),
    BannerController.CreateBanner,
  )
  .get(BannerController.GetAllBanner);

router
  .route('/:id')
  .get(BannerController.GetSingleBanner)
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    upload.single('image'),
    validateRequest(BannerValidation.UpdateBannerSchema),
    BannerController.UpdateBanner,
  )
  .delete(auth(Role.SUPER_ADMIN, Role.ADMIN), BannerController.DeleteBanner);

export const BannerRouter = router;
