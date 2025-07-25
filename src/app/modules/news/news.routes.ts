import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { NewsController } from './news.controller';
import NewsValidation from './news.validation';

const router = Router();

router
  .route('/')
  .post(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    validateRequest(NewsValidation.CreateNewsSchema),
    NewsController.CreateNews,
  )
  .get(NewsController.GetAllNews);

router
  .route('/:id')
  .get(NewsController.GetSingleNews)
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    validateRequest(NewsValidation.UpdateNewsSchema),
    NewsController.UpdateNews,
  )
  .delete(auth(Role.SUPER_ADMIN, Role.ADMIN), NewsController.DeleteNews);

export const NewsRouter = router;
