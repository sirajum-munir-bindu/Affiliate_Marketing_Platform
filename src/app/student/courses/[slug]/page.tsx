import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import { getCourseBySlug } from "@/lib/services/courseService";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  PlayCircle,
  FileText,
  CheckCircle,
  ArrowLeft,
  Download,
  Award,
} from "lucide-react";

interface ClassroomProps {
  params: {
    slug: string;
  };
}

export default async function ClassroomPage({ params }: ClassroomProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?redirect=/student/courses/${params.slug}`);
  }

  let course: any = null;
  try {
    course = await getCourseBySlug(params.slug);
  } catch (e) {
    // DB offline
  }

  if (!course) {
    course = {
      id: "c-1",
      title: "Full-Stack Web Development with Next.js & PostgreSQL",
      slug: params.slug,
      category: "Software Development",
      instructorName: "Engr. Farhan Kabir",
      curriculum: JSON.stringify([
        { module: "Module 1", title: "TypeScript & Modern React Deep Dive", lessons: 8 },
        { module: "Module 2", title: "Next.js App Router & Server Actions", lessons: 10 },
        { module: "Module 3", title: "PostgreSQL & Prisma Schema Engineering", lessons: 7 },
      ]),
    };
  }

  // Server-side Enrollment verification
  let enrollment: any = null;
  try {
    enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.userId,
          courseId: course.id,
        },
      },
    });
  } catch (err) {
    // If DB is offline, grant preview access for demo student/admin
    if (user.role === "STUDENT" || user.role === "ADMIN") {
      enrollment = { id: "enr-demo", isActive: true, accessGrantedAt: new Date() };
    }
  }

  if (!enrollment || !enrollment.isActive) {
    // Unauthorized access: user has not completed paid bKash verification!
    redirect(`/courses/${course.slug}?error=not_enrolled`);
  }

  let modules: { module: string; title: string; lessons?: number }[] = [];
  try {
    if (course.curriculum) {
      modules = JSON.parse(course.curriculum);
    }
  } catch {
    modules = [];
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Navigation Top */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/student"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#172033]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Student Portal</span>
          </Link>

          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Verified Enrollment Active
          </span>
        </div>

        {/* Classroom Header */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            {course.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">
            {course.title}
          </h1>
          <p className="text-xs text-[#64748B] mt-2">
            Instructor: <strong className="text-[#172033]">{course.instructorName}</strong> • Enrolled on {new Date(enrollment.accessGrantedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Modules & Lessons Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video & Content Player Placeholder */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#172033] rounded-2xl aspect-video flex flex-col items-center justify-center text-white p-8 text-center shadow-lg">
              <PlayCircle className="w-16 h-16 text-[#E53945] mb-3 hover:scale-110 transition-transform cursor-pointer" />
              <h3 className="text-lg font-bold">Welcome to Module 1: Core Fundamentals</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Select a video lesson from the curriculum sidebar to begin watching and access project resource files.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-[#172033] mb-3">Lesson Resources & Code Snippets</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                All companion repositories, slide decks, and starter project files for this course are hosted securely and accessible exclusively to verified students.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => alert("Downloading module resource pack...")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#172033] rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Starter Files (.ZIP)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Syllabus Modules Sidebar */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-sm text-[#172033] mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2563EB]" />
              <span>Course Syllabus Modules</span>
            </h3>

            <div className="space-y-3">
              {modules.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#E53945] uppercase">
                      {m.module}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {m.lessons || 6} Lessons
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#172033] mt-1">{m.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
