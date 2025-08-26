"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_routes_1 = require("../modules/admin/admin.routes");
const agency_routes_1 = require("../modules/agency/agency.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
const banner_routes_1 = require("../modules/banner/banner.routes");
const blog_routes_1 = require("../modules/blog/blog.routes");
const certification_routes_1 = require("../modules/certification/certification.routes");
const committee_routes_1 = require("../modules/committee/committee.routes");
const event_routes_1 = require("../modules/event/event.routes");
const job_routes_1 = require("../modules/job/job.routes");
const member_router_1 = require("../modules/member/member.router");
const news_routes_1 = require("../modules/news/news.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const user_routes_1 = require("../modules/user/user.routes");
const gallery_routes_1 = require("../modules/gallery/gallery.routes");
const router = express_1.default.Router();
const routes = [
    { path: '/auth', route: auth_routes_1.AuthRoutes },
    { path: '/members', route: member_router_1.MemberRouter },
    { path: '/committees', route: committee_routes_1.CommitteeRouter },
    { path: '/agencies', route: agency_routes_1.AgencyRouter },
    { path: '/users', route: user_routes_1.UserRoute },
    { path: '/blogs', route: blog_routes_1.BlogRouter },
    { path: '/events', route: event_routes_1.EventRouter },
    { path: '/news', route: news_routes_1.NewsRouter },
    { path: '/certifications', route: certification_routes_1.CertificationRouter },
    { path: '/banners', route: banner_routes_1.BannerRouter },
    { path: '/gallery', route: gallery_routes_1.GalleryRouter },
    { path: '/payments', route: payment_routes_1.PaymentRouter },
    { path: '/jobs', route: job_routes_1.JobRouter },
    { path: '/admin', route: admin_routes_1.AdminRoute },
];
routes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;
