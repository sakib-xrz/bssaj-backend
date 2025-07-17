"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueSlug = exports.generateSlug = void 0;
// Generate slug from title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};
exports.generateSlug = generateSlug;
// Generate unique slug by checking database
const generateUniqueSlug = (title, prisma, excludeId) => __awaiter(void 0, void 0, void 0, function* () {
    const baseSlug = (0, exports.generateSlug)(title);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const existing = yield prisma.blog.findFirst({
            where: Object.assign({ slug: slug }, (excludeId && { id: { not: excludeId } })),
        });
        if (!existing) {
            break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
});
exports.generateUniqueSlug = generateUniqueSlug;
const BlogUtils = {
    generateSlug: exports.generateSlug,
    generateUniqueSlug: exports.generateUniqueSlug,
};
exports.default = BlogUtils;
