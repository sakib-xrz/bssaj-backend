import { Role } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import AuthController from './auth.controller';
import AuthValidation from './auth.validation';

const router = express.Router();

router.post('/register', AuthController.Register);

router.post(
  '/login',
  validateRequest(AuthValidation.LoginSchema),
  AuthController.Login,
);

router.patch(
  '/change-password',
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY, Role.STUDENT),
  validateRequest(AuthValidation.ChangePasswordSchema),
  AuthController.ChangePassword,
);

router.get(
  '/me',
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY, Role.STUDENT),
  AuthController.GetMyProfile,
);

export const AuthRoutes = router;
