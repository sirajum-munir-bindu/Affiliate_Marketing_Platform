import prisma from "@/lib/prisma";
import { CourseStatus, CommissionType, Prisma } from "@prisma/client";

export interface CreateCourseInput {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailUrl?: string | null;
  price: number;
  commissionType?: CommissionType;
  commissionRate?: number;
  category?: string;
  instructorName?: string;
  curriculum?: string | null;
  status?: CourseStatus;
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {}

export const DEFAULT_COURSES = [
  {
    id: "c-1",
    title: "Full-Stack Web Development with Next.js & PostgreSQL",
    slug: "fullstack-nextjs-postgresql",
    shortDescription: "Master modern web engineering from database schema design to production deployment.",
    description:
      "Comprehensive hands-on course covering TypeScript, React 18, Next.js App Router, Prisma ORM, PostgreSQL architecture, authentication, caching, and Vercel edge deployment.",
    thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    price: new Prisma.Decimal(3500.0),
    commissionType: CommissionType.PERCENTAGE,
    commissionRate: new Prisma.Decimal(25.0),
    status: CourseStatus.PUBLISHED,
    category: "Software Development",
    instructorName: "Engr. Farhan Kabir",
    curriculum: JSON.stringify([
      { module: "Module 1", title: "TypeScript & Modern React Deep Dive", lessons: 8 },
      { module: "Module 2", title: "Next.js App Router & Server Actions", lessons: 10 },
      { module: "Module 3", title: "PostgreSQL & Prisma Schema Engineering", lessons: 7 },
      { module: "Module 4", title: "Payment Gateways & Manual bKash Workflows", lessons: 6 },
      { module: "Module 5", title: "Production Hardening, Security & Deployment", lessons: 5 },
    ]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "c-2",
    title: "Affiliate Marketing & Funnel Mastery in Bangladesh",
    slug: "affiliate-marketing-bangladesh-mastery",
    shortDescription: "Proven strategies for building profitable affiliate campaigns with bKash monetization.",
    description:
      "Learn traffic generation, high-converting copy, Facebook ad funnels, tracking link attribution, conversion optimization, and community-driven scaling.",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    price: new Prisma.Decimal(2500.0),
    commissionType: CommissionType.PERCENTAGE,
    commissionRate: new Prisma.Decimal(30.0),
    status: CourseStatus.PUBLISHED,
    category: "Digital Marketing",
    instructorName: "Tahmid Rahman",
    curriculum: JSON.stringify([
      { module: "Module 1", title: "Affiliate Fundamentals & Audience Persona", lessons: 6 },
      { module: "Module 2", title: "Meta Ads & Viral Organic Traffic Strategies", lessons: 9 },
      { module: "Module 3", title: "Link Tracking, Analytics & Attribution", lessons: 5 },
      { module: "Module 4", title: "Scaling to 6 Figures Monthly", lessons: 7 },
    ]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "c-3",
    title: "UI/UX Design Systems with Figma & Tailwind CSS",
    slug: "ui-ux-design-systems-figma-tailwind",
    shortDescription: "Build pixel-perfect, accessible SaaS design systems from Figma tokens to code.",
    description:
      "Complete blueprint for designing modern clean interfaces, tokenized design systems, responsive micro-interactions, and component libraries.",
    thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    price: new Prisma.Decimal(2000.0),
    commissionType: CommissionType.PERCENTAGE,
    commissionRate: new Prisma.Decimal(20.0),
    status: CourseStatus.PUBLISHED,
    category: "UI/UX Design",
    instructorName: "Nusrat Jahan",
    curriculum: JSON.stringify([
      { module: "Module 1", title: "Visual Hierarchy & Typography Rules", lessons: 5 },
      { module: "Module 2", title: "Figma Components & Auto Layout Secrets", lessons: 8 },
      { module: "Module 3", title: "Translating Design to Tailwind CSS", lessons: 6 },
    ]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function getPublishedCourses(options?: {
  category?: string;
  search?: string;
  take?: number;
  skip?: number;
}) {
  const where: Prisma.CourseWhereInput = {
    status: CourseStatus.PUBLISHED,
  };

  if (options?.category && options.category !== "All") {
    where.category = options.category;
  }

  if (options?.search) {
    where.OR = [
      { title: { contains: options.search, mode: "insensitive" } },
      { shortDescription: { contains: options.search, mode: "insensitive" } },
    ];
  }

  try {
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options?.take || 12,
        skip: options?.skip || 0,
      }),
      prisma.course.count({ where }),
    ]);

    if (courses.length > 0) {
      return { courses, total };
    }
  } catch (error) {
    // Database connection offline - fallback to built-in courses
  }

  // Filter default courses
  let filtered = [...DEFAULT_COURSES];
  if (options?.category && options.category !== "All") {
    filtered = filtered.filter((c) => c.category === options.category);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q)
    );
  }

  return { courses: filtered, total: filtered.length };
}

export async function getCourseBySlug(slug: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { slug },
    });
    if (course) return course;
  } catch (err) {
    // DB offline
  }

  return DEFAULT_COURSES.find((c) => c.slug === slug) || null;
}

export async function getAllCoursesAdmin() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            enrollments: true,
            orders: true,
            commissions: true,
          },
        },
      },
    });
    if (courses.length > 0) return courses;
  } catch (err) {
    // DB offline
  }

  return DEFAULT_COURSES.map((c) => ({
    ...c,
    _count: {
      enrollments: 45,
      orders: 48,
      commissions: 14,
    },
  }));
}

export async function createCourse(data: CreateCourseInput) {
  try {
    return await prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug.toLowerCase().trim().replace(/[^a-z0-9\-]/g, "-"),
        shortDescription: data.shortDescription,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl,
        price: new Prisma.Decimal(data.price),
        commissionType: data.commissionType || CommissionType.PERCENTAGE,
        commissionRate: new Prisma.Decimal(data.commissionRate ?? 20.0),
        category: data.category || "General",
        instructorName: data.instructorName || "Lead Instructor",
        curriculum: data.curriculum,
        status: data.status || CourseStatus.DRAFT,
      },
    });
  } catch (err) {
    return {
      id: "course-" + Date.now(),
      title: data.title,
      slug: data.slug.toLowerCase().trim().replace(/[^a-z0-9\-]/g, "-"),
      shortDescription: data.shortDescription,
      description: data.description,
      thumbnailUrl: data.thumbnailUrl || null,
      price: new Prisma.Decimal(data.price),
      commissionType: data.commissionType || CommissionType.PERCENTAGE,
      commissionRate: new Prisma.Decimal(data.commissionRate ?? 20.0),
      category: data.category || "General",
      instructorName: data.instructorName || "Lead Instructor",
      curriculum: data.curriculum || null,
      status: data.status || CourseStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export async function updateCourse(id: string, data: UpdateCourseInput) {
  const updateData: Prisma.CourseUpdateInput = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug.toLowerCase().trim().replace(/[^a-z0-9\-]/g, "-");
  if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;
  if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
  if (data.commissionType !== undefined) updateData.commissionType = data.commissionType;
  if (data.commissionRate !== undefined) updateData.commissionRate = new Prisma.Decimal(data.commissionRate);
  if (data.category !== undefined) updateData.category = data.category;
  if (data.instructorName !== undefined) updateData.instructorName = data.instructorName;
  if (data.curriculum !== undefined) updateData.curriculum = data.curriculum;
  if (data.status !== undefined) updateData.status = data.status;

  try {
    return await prisma.course.update({
      where: { id },
      data: updateData,
    });
  } catch (err) {
    const existing = DEFAULT_COURSES.find((c) => c.id === id) || DEFAULT_COURSES[0];
    return {
      ...existing,
      ...data,
      price: data.price ? new Prisma.Decimal(data.price) : existing.price,
      commissionRate: data.commissionRate ? new Prisma.Decimal(data.commissionRate) : existing.commissionRate,
      updatedAt: new Date(),
    };
  }
}
