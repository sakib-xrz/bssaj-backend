import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.get('/', auth(Role.SUPER_ADMIN, Role.ADMIN), UserController.GetAllUser);
router.get(
  '/:id',
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  UserController.GetSingleUser,
);

export const UserRoute = router;
