import React from 'react'
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import AuthCheck from "@/components/AuthCheck";

// Would normally come from database - Mock data for now
const courseCategories = [
    {
        id: "tech",
        name: "Technical Skills",
        description: "Master the technical skills needed for your next developer role",
        courses: [
            {
                id: "algo",
                title: "Algorithms & Data Structures",
                coverImage: "/courses/algorithms.jpg",
                level: "Intermediate",
                modules: 12,
                duration: "8 hours",
                popularity: 98,
            },
            {
                id: "swe",
                title: "System Design Fundamentals",
                coverImage: "/courses/system-design.jpg",
                level: "Advanced",
                modules: 8,
                duration: "6 hours",
                popularity: 95,
            },
            {
                id: "react",
                title: "React Interview Prep",
                coverImage: "/courses/react.jpg",
                level: "All Levels",
                modules: 10,
                duration: "7 hours",
                popularity: 92,
            }
        ]
    },
    {
        id: "soft",
        name: "Soft Skills",
        description: "Enhance your communication and behavioral interview performance",
        courses: [
            {
                id: "star",
                title: "STAR Method Mastery",
                coverImage: "/courses/star-method.jpg",
                level: "Beginner",
                modules: 5,
                duration: "3 hours",
                popularity: 90,
            },
            {
                id: "comm",
                title: "Technical Communication",
                coverImage: "/courses/communication.jpg",
                level: "Intermediate",
                modules: 7,
                duration: "4 hours",
                popularity: 88,
            }
        ]
    },
    {
        id: "career",
        name: "Career Development",
        description: "Navigate the job market and optimize your career trajectory",
        courses: [
            {
                id: "resume",
                title: "Portfolio & Resume Building",
                coverImage: "/courses/resume-checker.jpg",
                level: "All Levels",
                modules: 6,
                duration: "4 hours",
                popularity: 94,
            },
            {
                id: "nego",
                title: "Salary Negotiation Tactics",
                coverImage: "/courses/negotiation.jpg",
                level: "Intermediate",
                modules: 4,
                duration: "2.5 hours",
                popularity: 96,
            }
        ]
    }
];

const CourseCard = ({ course }) => {
    return (
        <div className="course-card bg-gradient-to-br from-dark-200 to-dark-300 rounded-xl overflow-hidden border border-gray-800 hover:border-primary-200/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:translate-y-[-5px]">
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-dark-100 to-transparent z-10" />
                <div className="absolute top-2 right-2 bg-dark-100/80 backdrop-blur-sm text-xs px-3 py-1 rounded-full z-20">
                    {course.level}
                </div>
                <div className="relative h-full w-full">
                    {/* Fallback image with gradient overlay if actual image not available */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                </div>
            </div>

            <div className="p-5">
                <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">{course.title}</h3>

                <div className="flex justify-between items-center mt-3 text-sm text-gray-400">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {course.modules} modules
                    </div>
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {course.duration}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
              <span className="text-xs bg-primary/20 text-primary-100 px-2 py-1 rounded-md">
                {course.popularity}% completion rate
              </span>
                        </div>
                        <Button variant="ghost" size="sm" className="hover:bg-primary/20 hover:text-primary-100">
                            View Course
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Page = async () => {
    const user = await getCurrentUser();
    const isAuthenticated = !!user;

    return (
        <>
            {/* Hero Section */}
            <section className="relative mb-16">
                {/* Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-secondary/10 rounded-full blur-2xl -z-10"></div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        <div className="inline-block px-4 py-2 bg-dark-200/80 backdrop-blur-sm rounded-full">
              <span className="text-sm font-medium bg-gradient-to-r from-primary-100 to-primary-200 bg-clip-text text-transparent">
                New Learning Experience
              </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                            Elevate Your <span className="text-primary-100">Interview Skills</span> With Structured Learning
                        </h1>

                        <p className="text-gray-400 text-lg max-w-lg">
                            Our curated courses help you master both technical and soft skills needed to excel in tech interviews.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <AuthCheck
                                isAuthenticated={isAuthenticated}
                                href="/course-home/all-courses"
                                className="btn btn-primary group transition-all duration-300"
                            >
                <span className="flex items-center gap-2">
                  Explore Courses
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
                            </AuthCheck>

                            {!isAuthenticated && (
                                <Link href="/sign-up" className="btn btn-secondary">
                                    Sign Up Free
                                </Link>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-primary"></div>
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-blue-500"></div>
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-green-500"></div>
                            </div>
                            <span>Join 2,000+ learners</span>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative h-[400px] w-full hidden lg:block">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm flex items-center justify-center">
                                <Image
                                    src="/courses-hero.png"
                                    alt="Course Learning"
                                    width={500}
                                    height={400}
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Course Categories */}
            {courseCategories.map((category) => (
                <section key={category.id} className="my-16">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <span className="w-2 h-6 bg-primary rounded-full"></span>
                                {category.name}
                            </h2>
                            <p className="text-gray-400 mt-1">{category.description}</p>
                        </div>
                        <Link href={`/course-home/category/${category.id}`} className="text-primary-100 hover:text-primary-200 text-sm flex items-center">
                            View all
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {category.courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </section>
            ))}

            {/* Call to Action */}
            <section className="my-16 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl -z-10"></div>
                <div className="bg-dark-200/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to transform your interview skills?</h2>
                        <p className="text-gray-400 mb-6">
                            Prepare thoroughly with our structured courses and practice interviews
                        </p>
                        <div className="flex gap-4 justify-center">
                            <AuthCheck
                                isAuthenticated={isAuthenticated}
                                href="/course-home/all-courses"
                                className="btn btn-primary"
                            >
                                Browse All Courses
                            </AuthCheck>

                            <Button className="btn-secondary">
                                <Link href="/interview-home">
                                    Try Interview Practice
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Page;