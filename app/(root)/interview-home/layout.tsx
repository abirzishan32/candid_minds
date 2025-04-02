import React, { ReactNode } from 'react'

const InterviewHomeLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="interview-home-layout">
            {children}
        </div>
    )
}

export default InterviewHomeLayout