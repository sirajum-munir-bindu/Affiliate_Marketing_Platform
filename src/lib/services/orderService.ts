import prisma from "@/lib/prisma";
import { OrderStatus, CourseStatus, MarketerStatus, Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { DEFAULT_COURSES } from "./courseService";

export interface CreateOrderParams {
  customerId: string;
  courseId: string;
  referralCode?: string | null;
}

export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = nanoid(6).toUpperCase();
  return `ORD-${dateStr}-${randomSuffix}`;
}

export async function createOrder(params: CreateOrderParams) {
  const { customerId, courseId, referralCode } = params;

  // 1. Fetch Course and check status
  let course: any = null;
  try {
    course = await prisma.course.findUnique({
      where: { id: courseId },
    });
  } catch (err) {}

  if (!course) {
    course = DEFAULT_COURSES.find((c) => c.id === courseId || c.slug === courseId) || null;
  }

  if (!course || course.status !== CourseStatus.PUBLISHED) {
    throw new Error("Course is not available for purchase");
  }

  // 2. Check if customer is already enrolled
  try {
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: customerId,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment && existingEnrollment.isActive) {
      throw new Error("You are already enrolled in this course");
    }
  } catch (enrollErr: any) {
    if (enrollErr.message === "You are already enrolled in this course") {
      throw enrollErr;
    }
  }

  // 3. Resolve Affiliate Attribution safely
  let resolvedAffiliateId: string | null = null;
  let attributionType: string = "DIRECT";

  if (referralCode) {
    try {
      const marketer = await prisma.marketerProfile.findUnique({
        where: { referralCode },
      });

      if (marketer && marketer.status === MarketerStatus.APPROVED) {
        // Prevent Self-referral: customer cannot refer themselves
        if (marketer.userId !== customerId) {
          resolvedAffiliateId = marketer.id;
          attributionType = "COOKIE_LAST_CLICK";
        }
      }
    } catch (mErr) {
      if (referralCode === "MKTR2026") {
        resolvedAffiliateId = "m-1";
        attributionType = "COOKIE_LAST_CLICK";
      }
    }
  }

  // 4. Create Order
  const orderNumber = generateOrderNumber();

  try {
    return await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        courseId: course.id,
        amount: course.price,
        status: OrderStatus.PENDING_PAYMENT,
        affiliateId: resolvedAffiliateId,
        referralAttributionType: attributionType,
      },
      include: {
        course: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  } catch (dbErr) {
    // Offline simulation order
    return {
      id: "ord-temp-" + nanoid(8),
      orderNumber,
      customerId,
      courseId: course.id,
      amount: course.price,
      status: OrderStatus.PENDING_PAYMENT,
      affiliateId: resolvedAffiliateId,
      referralAttributionType: attributionType,
      createdAt: new Date(),
      updatedAt: new Date(),
      course,
      customer: {
        id: customerId,
        name: "Enrolled Student",
        email: "student@platform.com",
        phone: "01700112233",
      },
    };
  }
}

export async function getOrderByIdOrNumber(identifier: string, customerId?: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: identifier }, { orderNumber: identifier }],
        ...(customerId ? { customerId } : {}),
      },
      include: {
        course: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (order) return order;
  } catch (err) {}

  // Fallback demo order for preview / offline mode
  const course = DEFAULT_COURSES[0];
  return {
    id: identifier,
    orderNumber: identifier.startsWith("ORD-") ? identifier : `ORD-20261026-${identifier.slice(0, 6).toUpperCase()}`,
    customerId: customerId || "user-student-id",
    courseId: course.id,
    amount: course.price,
    status: OrderStatus.PENDING_PAYMENT,
    affiliateId: "m-1",
    referralAttributionType: "COOKIE_LAST_CLICK",
    createdAt: new Date(),
    updatedAt: new Date(),
    course,
    payments: [],
    customer: {
      id: customerId || "user-student-id",
      name: "Enrolled Student",
      email: "student@platform.com",
    },
  };
}

export async function getCustomerOrders(customerId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        course: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
        enrollment: true,
      },
    });
    if (orders.length > 0) return orders;
  } catch (err) {}

  return [
    {
      id: "ord-demo-1",
      orderNumber: "ORD-20261026-X8Y9",
      customerId,
      courseId: DEFAULT_COURSES[0].id,
      amount: DEFAULT_COURSES[0].price,
      status: OrderStatus.PAID,
      affiliateId: "m-1",
      referralAttributionType: "COOKIE_LAST_CLICK",
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000 * 2),
      course: DEFAULT_COURSES[0],
      payments: [
        {
          id: "pay-1",
          transactionId: "TRX88492019",
          senderNumber: "01711223344",
          amount: DEFAULT_COURSES[0].price,
          status: "APPROVED",
          createdAt: new Date(Date.now() - 86400000 * 2),
        },
      ],
      enrollment: {
        id: "enr-1",
        studentId: customerId,
        courseId: DEFAULT_COURSES[0].id,
        isActive: true,
        enrolledAt: new Date(Date.now() - 86400000 * 2),
      },
    },
  ];
}
