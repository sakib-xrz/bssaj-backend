import express from 'express';
import { AdminRoute } from '../modules/admin/admin.routes';
import { AgencyRouter } from '../modules/agency/agency.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { BlogRouter } from '../modules/blog/blog.routes';
import { EventRouter } from '../modules/event/event.routes';
import { MemberRouter } from '../modules/member/member.router';
import { UserRoute } from '../modules/user/user.routes';

const router = express.Router();

type Route = { path: string; route: express.Router };

const routes: Route[] = [
  { path: '/auth', route: AuthRoutes },
  { path: '/member', route: MemberRouter },
  { path: '/agency', route: AgencyRouter },
  { path: '/user', route: UserRoute },
  { path: '/blog', route: BlogRouter },
  { path: '/event', route: EventRouter },
  { path: '/admin', route: AdminRoute }
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
