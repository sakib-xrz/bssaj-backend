import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import { upload } from '../../utils/handelFile';

const router = express.Router();

router.get('/', auth(Role.SUPER_ADMIN, Role.ADMIN), UserController.GetAllUser);
router.get(
  '/search',
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  UserController.SearchUser,
);
router.patch(
  '/profile-picture/:id',
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY, Role.STUDENT, Role.USER),
  upload.single('image'),
  UserController.UpdateProfilePicture,
);
router.post('/', auth(Role.SUPER_ADMIN), UserController.CreateUser);
router.get(
  '/:id',
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  UserController.GetUserById,
);
router.patch(
  '/:id',
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  UserController.UpdateUser,
);
router.delete('/:id', auth(Role.SUPER_ADMIN), UserController.DeleteUser);

export const UserRoute = router;
