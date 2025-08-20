import express from 'express';
import { AdminRoute } from '../modules/admin/admin.routes';
import { AgencyRouter } from '../modules/agency/agency.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { BannerRouter } from '../modules/banner/banner.routes';
import { BlogRouter } from '../modules/blog/blog.routes';
import { CertificationRouter } from '../modules/certification/certification.routes';
import { CommitteeRouter } from '../modules/committee/committee.routes';
import { EventRouter } from '../modules/event/event.routes';
import { MemberRouter } from '../modules/member/member.router';
import { NewsRouter } from '../modules/news/news.routes';
import { PaymentRouter } from '../modules/payment/payment.routes';
import { UserRoute } from '../modules/user/user.routes';

const router = express.Router();

type Route = { path: string; route: express.Router };

const routes: Route[] = [
  { path: '/auth', route: AuthRoutes },
  { path: '/members', route: MemberRouter },
  { path: '/committees', route: CommitteeRouter },
  { path: '/agencies', route: AgencyRouter },
  { path: '/users', route: UserRoute },
  { path: '/blogs', route: BlogRouter },
  { path: '/events', route: EventRouter },
  { path: '/news', route: NewsRouter },
  { path: '/certifications', route: CertificationRouter },
  { path: '/banners', route: BannerRouter },
  { path: '/payments', route: PaymentRouter },
  { path: '/admin', route: AdminRoute },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
