"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSkillAssessments } from "@/lib/actions/skill-assessment.action";
import { SkillAssessment, SkillCategory } from "@/lib/actions/skill-assessment.action";
import { motion } from "framer-motion";
import { FaCode, FaDatabase, FaMobile, FaServer, FaCloud, FaRobot, FaLock, FaChartLine, FaFire } from "react-icons/fa";
import { MdQuiz, MdTimer, MdStar, MdOutlineOpenInNew } from "react-icons/md";

const categoryIcons: Record<SkillCategory, React.ReactNode> = {
  "technical": <FaCode className="w-5 h-5" />,
  "soft-skills": <FaChartLine className="w-5 h-5" />,
  "certification": <FaLock className="w-5 h-5" />
};

const categoryColors: Record<SkillCategory, string> = {
  "technical": "from-blue-500 to-blue-600 text-blue-100",
  "soft-skills": "from-purple-500 to-purple-600 text-purple-100",
  "certification": "from-green-500 to-green-600 text-green-100"
};

const difficultyColors: Record<string, string> = {
  "Beginner": "border-green-500/30 text-green-400",
  "Intermediate": "border-yellow-500/30 text-yellow-400",
  "Advanced": "border-red-500/30 text-red-400"
};

const difficultyDots: Record<string, React.ReactNode> = {
  "Beginner": (
    <div className="flex space-x-1">
      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
    </div>
  ),
  "Intermediate": (
    <div className="flex space-x-1">
      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
    </div>
  ),
  "Advanced": (
    <div className="flex space-x-1">
      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
    </div>
  )
};

const SkillAssessmentCard = ({ assessment }: { assessment: SkillAssessment }) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
      }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 shadow-lg cursor-pointer group"
      onClick={() => router.push(`/skill-assessment/${assessment.id}`)}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-800 to-transparent rounded-bl-full opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-gray-800 to-transparent rounded-tr-full opacity-30"></div>
      
      {/* Top category badge */}
      <div className="absolute top-4 left-4">
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${categoryColors[assessment.category]} shadow-lg`}>
          {categoryIcons[assessment.category]}
          <span className="text-xs font-semibold tracking-wide uppercase">{assessment.category}</span>
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-6 pt-16">
        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{assessment.title}</h3>
        <p className="text-gray-300 text-sm mb-5 line-clamp-2">{assessment.description}</p>
        
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-2 text-center backdrop-blur-sm">
            <div className="flex justify-center mb-1">
              <MdQuiz className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-white font-medium text-sm">{assessment.questionsCount}</div>
            <div className="text-gray-400 text-xs">Questions</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-2 text-center backdrop-blur-sm">
            <div className="flex justify-center mb-1">
              <MdTimer className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-white font-medium text-sm">{assessment.duration}</div>
            <div className="text-gray-400 text-xs">Minutes</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-2 text-center backdrop-blur-sm">
            <div className="flex justify-center mb-1">
              <FaFire className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-white font-medium text-sm">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < assessment.popularity ? "text-yellow-500" : "text-gray-600"}>★</span>
              ))}
            </div>
            <div className="text-gray-400 text-xs">Popularity</div>
          </div>
        </div>
        
        {/* Bottom footer */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${difficultyColors[assessment.difficulty]}`}>
            {difficultyDots[assessment.difficulty]}
            <span className="text-xs font-medium">{assessment.difficulty}</span>
          </div>
          
          <motion.div 
            className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-600 text-white opacity-0 group-hover:opacity-100"
            whileHover={{ scale: 1.1 }}
            initial={{ x: 10 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MdOutlineOpenInNew className="w-4 h-4" />
          </motion.div>
        </div>
      </div>
      
      {/* Bottom highlight on hover */}
      <motion.div 
        className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

const SkillCategorySelector = ({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: SkillCategory | "All";
  onSelectCategory: (category: SkillCategory | "All") => void;
}) => {
  const categories: (SkillCategory | "All")[] = [
    "All",
    "technical",
    "soft-skills",
    "certification"
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-10">
      {categories.map((category) => (
        <motion.button
          key={category}
          onClick={() => onSelectCategory(category)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 shadow-lg ${
            selectedCategory === category
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-750 border border-gray-700"
          }`}
        >
          {category === "All" ? "All Categories" : category}
        </motion.button>
      ))}
    </div>
  );
};

export default function SkillAssessmentPage() {
  const [assessments, setAssessments] = useState<SkillAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | "All">("All");

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        // Only get published assessments for regular users
        const response = await getSkillAssessments({ isAdmin: false });
        if (response.success && response.data) {
          console.log("Loaded assessments:", response.data.length);
          setAssessments(response.data);
        } else {
          setError(response.message || "Failed to load assessments");
        }
      } catch (err) {
        setError("Failed to load assessments. Please try again later.");
        console.error("Error fetching assessments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const filteredAssessments = selectedCategory === "All"
    ? assessments
    : assessments.filter(assessment => assessment.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-red-500 text-center py-8">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Skill Assessments</h1>
          <p className="text-gray-400">
            Test your knowledge and improve your skills with our comprehensive assessments
          </p>
        </div>

        <SkillCategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((assessment) => (
            <SkillAssessmentCard key={assessment.id} assessment={assessment} />
          ))}
        </div>

        {filteredAssessments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No assessments found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
