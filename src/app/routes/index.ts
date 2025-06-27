import express from 'express';
import { AgencyRouter } from '../modules/agency/agency.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { MemberRouter } from '../modules/member/member.router';
import { UserRoute } from '../modules/user/user.routes';

const router = express.Router();

type Route = { path: string; route: express.Router };

const routes: Route[] = [
  { path: '/auth', route: AuthRoutes },
  { path: '/member', route: MemberRouter },
  { path: '/agency', route: AgencyRouter },
  { path: '/user', route: UserRoute }
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
