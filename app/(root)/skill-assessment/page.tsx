"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSkillAssessments } from "@/lib/actions/skill-assessment.action";
import { SkillAssessment, SkillCategory } from "@/lib/actions/skill-assessment.action";
import { motion } from "framer-motion";
import { FaCode, FaDatabase, FaMobile, FaServer, FaCloud, FaRobot } from "react-icons/fa";
import { MdQuiz, MdTimer, MdStar } from "react-icons/md";

const categoryIcons: Record<SkillCategory, React.ReactNode> = {
  "technical": <FaCode className="w-6 h-6" />,
  "soft-skills": <FaServer className="w-6 h-6" />,
  "certification": <FaDatabase className="w-6 h-6" />
};

const categoryColors: Record<SkillCategory, string> = {
  "technical": "bg-blue-500/10 text-blue-500",
  "soft-skills": "bg-purple-500/10 text-purple-500",
  "certification": "bg-green-500/10 text-green-500"
};

const difficultyColors: Record<string, string> = {
  "Beginner": "bg-green-500/10 text-green-500",
  "Intermediate": "bg-yellow-500/10 text-yellow-500",
  "Advanced": "bg-red-500/10 text-red-500"
};

const SkillAssessmentCard = ({ assessment }: { assessment: SkillAssessment }) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors"
      onClick={() => router.push(`/skill-assessment/${assessment.id}`)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${categoryColors[assessment.category]}`}>
          {categoryIcons[assessment.category]}
          <span className="text-sm font-medium">{assessment.category}</span>
        </div>
        <div className={`px-3 py-1 rounded-full ${difficultyColors[assessment.difficulty]}`}>
          <span className="text-sm font-medium">{assessment.difficulty}</span>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">{assessment.title}</h3>
      <p className="text-gray-400 mb-4">{assessment.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <MdQuiz className="w-4 h-4" />
            <span>{assessment.questionsCount} questions</span>
          </div>
          <div className="flex items-center space-x-1">
            <MdTimer className="w-4 h-4" />
            <span>{assessment.duration} min</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <MdStar className="w-4 h-4 text-yellow-500" />
          <span>{assessment.popularity}</span>
        </div>
      </div>
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
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          {category === "All" ? "All Categories" : category}
        </button>
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
