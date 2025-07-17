import { PrismaClient } from '@prisma/client';

// Generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Generate unique slug by checking database
export const generateUniqueSlug = async (
  title: string,
  prisma: PrismaClient,
  excludeId?: string,
): Promise<string> => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.blog.findFirst({
      where: {
        slug: slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (!existing) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

const BlogUtils = {
  generateSlug,
  generateUniqueSlug,
};

export default BlogUtils;
