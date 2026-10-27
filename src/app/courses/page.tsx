import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseCard } from "@/components/CourseCard";
import { getPublishedCourses } from "@/lib/services/courseService";
import Link from "next/link";
import { Search, Filter, BookOpen } from "lucide-react";

interface CoursesPageProps {
  searchParams: {
    category?: string;
    search?: string;
  };
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const category = searchParams.category || "All";
  const search = searchParams.search || "";

  const { courses, total } = await getPublishedCourses({
    category,
    search,
    take: 24,
  });

  const categories = [
    "All",
    "Software Development",
    "Digital Marketing",
    "UI/UX Design",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            Course Catalog
          </span>
          <h1 className="text-3xl font-black text-[#172033] mt-1">
            Explore All Available Courses
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Master real-world skills with verified step-by-step curricula and projects.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => {
              const isActive = category === cat;
              return (
                <Link
                  key={cat}
                  href={`/courses?category=${encodeURIComponent(cat)}${
                    search ? `&search=${encodeURIComponent(search)}` : ""
                  }`}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    isActive
                      ? "bg-[#172033] text-white shadow-sm"
                      : "bg-[#F8FAFC] text-[#64748B] hover:text-[#172033] border border-[#E2E8F0]"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          {/* Search Box */}
          <form method="GET" action="/courses" className="relative w-full md:w-72">
            <input type="hidden" name="category" value={category} />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search courses..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-[#F8FAFC]"
            />
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center max-w-md mx-auto my-12">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#172033]">No Courses Found</h3>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              We couldn't find any courses matching your filters. Try selecting a different category or clearing your search.
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-block px-4 py-2 text-xs font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-4">
              <span>Showing {courses.length} courses</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={{
                    id: course.id,
                    title: course.title,
                    slug: course.slug,
                    shortDescription: course.shortDescription,
                    thumbnailUrl: course.thumbnailUrl,
                    price: Number(course.price),
                    commissionRate: Number(course.commissionRate),
                    category: course.category,
                    instructorName: course.instructorName,
                  }}
                  showCommission={true}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
