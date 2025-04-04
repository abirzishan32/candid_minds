import React, { ReactNode } from 'react'

const InterviewHomeLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="interview-home-layout relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-2xl -z-10"></div>

            {/* Content container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </div>
        </div>
    )
}

export default InterviewHomeLayout