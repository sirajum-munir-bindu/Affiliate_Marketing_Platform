import { PrismaClient, UserRole, MarketerStatus, CourseStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Course Affiliate Platform Database...");

  // 1. Platform Settings
  await prisma.platformSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      organizationName: "Skill.jobs Affiliation",
      supportEmail: "support@skill.jobs",
      contactPhone: "+880 1700-000000",
      bkashNumber: "01711223344",
      bkashType: PaymentMethod.BKASH_MERCHANT,
      bkashInstructions:
        "1. Open your bKash App\n2. Tap on 'Make Payment'\n3. Enter Merchant Number: 01711223344\n4. Enter the exact Course Fee in BDT\n5. Use your Order ID as the Reference\n6. Enter your bKash PIN to confirm\n7. Save the 10-character TrxID and submit it on this page.",
      defaultAttributionDays: 30,
      minimumPayoutAmount: 1000,
    },
  });
  console.log("✅ Platform settings initialized.");

  // 2. Initial Super Admin
  const adminPasswordHash = await bcrypt.hash(
    process.env.INITIAL_ADMIN_PASSWORD || "AdminSecurePassword123!",
    10
  );

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@platform.com";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: UserRole.ADMIN,
    },
    create: {
      email: adminEmail,
      name: process.env.INITIAL_ADMIN_NAME || "System Super Admin",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      phone: "+8801700000001",
    },
  });
  console.log(`✅ Super Admin created: ${admin.email}`);

  // 3. Marketer User (Approved)
  const marketerPasswordHash = await bcrypt.hash("Marketer123!", 10);
  const marketerUser = await prisma.user.upsert({
    where: { email: "marketer@platform.com" },
    update: { role: UserRole.MARKETER },
    create: {
      email: "marketer@platform.com",
      name: "Tahmid Rahman (Top Affiliate)",
      passwordHash: marketerPasswordHash,
      role: UserRole.MARKETER,
      phone: "01811223344",
    },
  });

  const marketerProfile = await prisma.marketerProfile.upsert({
    where: { userId: marketerUser.id },
    update: { status: MarketerStatus.APPROVED },
    create: {
      userId: marketerUser.id,
      status: MarketerStatus.APPROVED,
      referralCode: "REF_GROW20",
      phone: "01811223344",
      socialLinks: "https://facebook.com/tahmid.marketer",
      applicationReason: "Running a 50k follower tech community on Facebook and Telegram.",
      payoutBkashNumber: "01811223344",
      payoutMethod: PaymentMethod.BKASH_SEND_MONEY,
    },
  });
  console.log(`✅ Approved Marketer created: ${marketerUser.email} (Code: ${marketerProfile.referralCode})`);

  // 4. Pending Marketer Applicant
  const pendingUser = await prisma.user.upsert({
    where: { email: "applicant@platform.com" },
    update: {},
    create: {
      email: "applicant@platform.com",
      name: "Sabbir Ahmed",
      passwordHash: marketerPasswordHash,
      role: UserRole.STUDENT,
      phone: "01911223344",
    },
  });

  await prisma.marketerProfile.upsert({
    where: { userId: pendingUser.id },
    update: {},
    create: {
      userId: pendingUser.id,
      status: MarketerStatus.PENDING,
      referralCode: "REF_SABBIR99",
      phone: "01911223344",
      socialLinks: "https://youtube.com/@sabbirtech",
      applicationReason: "Content creator creating tutorials on affiliate marketing and web development.",
      payoutBkashNumber: "01911223344",
    },
  });
  console.log(`✅ Pending Marketer Applicant created: ${pendingUser.email}`);

  // 5. Student Customer User
  const studentPasswordHash = await bcrypt.hash("Student123!", 10);
  const student = await prisma.user.upsert({
    where: { email: "student@platform.com" },
    update: {},
    create: {
      email: "student@platform.com",
      name: "Ayesha Siddiqua",
      passwordHash: studentPasswordHash,
      role: UserRole.STUDENT,
      phone: "01755667788",
    },
  });
  console.log(`✅ Student Customer created: ${student.email}`);

  // 6. Courses
  const courses = [
    {
      title: "Full-Stack Web Development with Next.js & PostgreSQL",
      slug: "fullstack-nextjs-postgresql",
      shortDescription: "Master modern web engineering from database schema design to production deployment.",
      description:
        "Comprehensive hands-on course covering TypeScript, React 18, Next.js App Router, Prisma ORM, PostgreSQL architecture, authentication, caching, and Vercel edge deployment.",
      thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      price: 3500.0,
      commissionRate: 25.0,
      status: CourseStatus.PUBLISHED,
      category: "Software Development",
      instructorName: "Engr. Farhan Kabir",
      curriculum: JSON.stringify([
        { module: "Module 1", title: "TypeScript & Modern React Deep Dive", lessons: 8 },
        { module: "Module 2", title: "Next.js 14/15 App Router & Server Actions", lessons: 10 },
        { module: "Module 3", title: "PostgreSQL & Prisma Schema Engineering", lessons: 7 },
        { module: "Module 4", title: "Payment Gateways & Manual bKash Workflows", lessons: 6 },
        { module: "Module 5", title: "Production Hardening, Security & Deployment", lessons: 5 },
      ]),
    },
    {
      title: "Affiliate Marketing & Funnel Mastery in Bangladesh",
      slug: "affiliate-marketing-bangladesh-mastery",
      shortDescription: "Proven strategies for building profitable affiliate campaigns with bKash monetization.",
      description:
        "Learn traffic generation, high-converting copy, Facebook ad funnels, tracking link attribution, conversion optimization, and community-driven scaling.",
      thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
      price: 2500.0,
      commissionRate: 30.0,
      status: CourseStatus.PUBLISHED,
      category: "Digital Marketing",
      instructorName: "Tahmid Rahman",
      curriculum: JSON.stringify([
        { module: "Module 1", title: "Affiliate Fundamentals & Audience Persona", lessons: 6 },
        { module: "Module 2", title: "Meta Ads & Viral Organic Traffic Strategies", lessons: 9 },
        { module: "Module 3", title: "Link Tracking, Analytics & Attribution", lessons: 5 },
        { module: "Module 4", title: "Scaling to 6 Figures Monthly", lessons: 7 },
      ]),
    },
    {
      title: "UI/UX Design Systems with Figma & Tailwind CSS",
      slug: "ui-ux-design-systems-figma-tailwind",
      shortDescription: "Build pixel-perfect, accessible SaaS design systems from Figma tokens to code.",
      description:
        "Complete blueprint for designing modern clean interfaces, tokenized design systems, responsive micro-interactions, and component libraries.",
      thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
      price: 2000.0,
      commissionRate: 20.0,
      status: CourseStatus.PUBLISHED,
      category: "UI/UX Design",
      instructorName: "Nusrat Jahan",
      curriculum: JSON.stringify([
        { module: "Module 1", title: "Visual Hierarchy & Typography Rules", lessons: 5 },
        { module: "Module 2", title: "Figma Components & Auto Layout Secrets", lessons: 8 },
        { module: "Module 3", title: "Translating Design to Tailwind CSS", lessons: 6 },
      ]),
    },
  ];

  for (const c of courses) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log(`✅ Seeded ${courses.length} published courses.`);

  console.log("\n✨ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
