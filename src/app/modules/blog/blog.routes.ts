import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BlogController } from './blog.controller';
import { BlogValidatoin } from './blog.validation';


const router = Router();

router
    .route('/')
    .post(
        auth(Role.SUPER_ADMIN, Role.ADMIN, Role.USER, Role.USER),
        validateRequest(BlogValidatoin.blogValidation),
        BlogController.CreateBlog,
    )
    .get(BlogController.GetAllBlog);

router
    .route('/:id')
    .get(BlogController.GetSingleBlog)
    .patch(
        auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY, Role.USER),
        validateRequest(BlogValidatoin.updateBlogValidation),
        BlogController.UpdateBlog,
    )
    .delete(auth(Role.SUPER_ADMIN, Role.ADMIN), BlogController.DeleteBlog);

export const BlogRouter = router;
