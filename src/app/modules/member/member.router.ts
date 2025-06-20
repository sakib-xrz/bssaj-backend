import { Role } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { MembersController } from "./member.controller";
import memberSchema from "./member.validatoin";

const router = Router();

router
    .route('/')
    .post(auth(Role.ADMIN, Role.AGENCY, Role.STUDENT, Role.USER), validateRequest(memberSchema), MembersController.CreateMember)
    .get(MembersController.GetAllMember);

router
    .route('/:id')
    .get(MembersController.SingleMember)
    .patch(auth(Role.ADMIN, Role.AGENCY, Role.STUDENT, Role.USER), MembersController.UpdateMember)
    .delete(auth(Role.ADMIN, Role.AGENCY, Role.STUDENT, Role.USER), MembersController.DeleteMember);

export const MemberRouter = router;