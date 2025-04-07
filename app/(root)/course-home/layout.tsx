import React, { ReactNode } from 'react'

const CourseHomeLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="course-home-layout relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-2xl -z-10"></div>

            {/* Content container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Tabs */}
                <div className="mb-8 border-b border-gray-800">
                    <nav className="flex space-x-8">
                        <a href="/course-home" className="border-b-2 border-primary-100 pb-4 px-1 text-primary-100 font-medium">
                            Featured Courses
                        </a>
                        <a href="/course-home/all-courses" className="border-b-2 border-transparent pb-4 px-1 text-gray-400 hover:text-gray-300 font-medium">
                            All Courses
                        </a>
                        <a href="/course-home/my-learning" className="border-b-2 border-transparent pb-4 px-1 text-gray-400 hover:text-gray-300 font-medium">
                            My Learning
                        </a>
                    </nav>
                </div>

                {/* Main content */}
                {children}
            </div>
        </div>
    )
}

export default CourseHomeLayout