import { getAllCoursesAdmin } from "@/lib/services/courseService";
import { AdminCourseList } from "./AdminCourseList";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await getAllCoursesAdmin();

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
          Curriculum & Offerings
        </span>
        <h1 className="text-2xl font-black text-[#172033] mt-1">Course Catalog Management</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Publish, price, and set affiliate commission rates across all platform courses.
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <AdminCourseList courses={courses as any} />
      </div>
    </div>
  );
}
