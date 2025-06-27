import express from 'express';
import { UserController } from './user.controller';

const router = express.Router();

router.get('/',UserController.GetAllUser);
router.get('/:id',UserController.GetSingleUser);

export const UserRoute = router;