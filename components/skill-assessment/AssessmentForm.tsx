"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SkillAssessment, SkillCategory, DifficultyLevel } from "@/lib/actions/skill-assessment.action";
import { createSkillAssessment, updateSkillAssessment } from "@/lib/actions/skill-assessment.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const assessmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  longDescription: z.string().optional(),
  category: z.enum(["technical", "soft-skills", "certification"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  passPercentage: z.number().min(0).max(100, "Pass percentage must be between 0 and 100"),
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface AssessmentFormProps {
  assessment?: SkillAssessment;
  onSuccess?: () => void;
}

export default function AssessmentForm({ assessment, onSuccess }: AssessmentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: assessment || {
      category: "technical",
      difficulty: "beginner",
      duration: 30,
      passPercentage: 70,
    },
  });

  const onSubmit = async (data: AssessmentFormData) => {
    try {
      setIsSubmitting(true);
      const assessmentData = {
        title: data.title,
        description: data.description,
        longDescription: data.longDescription || "",
        category: data.category,
        difficulty: data.difficulty,
        duration: data.duration,
        passPercentage: data.passPercentage,
        tags: data.tags || [],
        prerequisites: data.prerequisites || [],
        skills: data.skills || []
      };

      if (assessment) {
        await updateSkillAssessment(assessment.id, data);
        toast.success("Assessment updated successfully");
      } else {
        await createSkillAssessment(assessmentData);
        toast.success("Assessment created successfully");
      }
      onSuccess?.();
      router.push("/manage-skill-assessment");
    } catch (error) {
      toast.error("Failed to save assessment");
      console.error("Error saving assessment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const newTag = prompt("Enter a new tag");
    if (newTag) {
      const currentTags = watch("tags") || [];
      setValue("tags", [...currentTags, newTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = watch("tags") || [];
    setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Title
        </label>
        <input
          {...register("title")}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Long Description
        </label>
        <textarea
          {...register("longDescription")}
          rows={5}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Category
          </label>
          <select
            {...register("category")}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          >
            <option value="technical">Technical</option>
            <option value="soft-skills">Soft Skills</option>
            <option value="certification">Certification</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Difficulty
          </label>
          <select
            {...register("difficulty")}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            {...register("duration", { valueAsNumber: true })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
          {errors.duration && (
            <p className="mt-1 text-sm text-red-500">{errors.duration.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Pass Percentage
          </label>
          <input
            type="number"
            {...register("passPercentage", { valueAsNumber: true })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
          {errors.passPercentage && (
            <p className="mt-1 text-sm text-red-500">
              {errors.passPercentage.message}
            </p>
          )}
        </div>
      </div>

      {assessment && (
        <div className="flex items-center py-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={assessment.isPublished}
              onChange={() => {
                if (onSuccess) {
                  onSuccess();
                }
              }}
              className="sr-only"
            />
            <div className={`relative w-10 h-5 transition rounded-full ${assessment.isPublished ? 'bg-blue-500' : 'bg-gray-600'
              }`}>
              <div className={`absolute left-0 w-5 h-5 transition transform bg-white rounded-full ${assessment.isPublished ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-300">
              {assessment.isPublished ? "Published" : "Draft"}
            </span>
          </label>
          <span className="ml-2 text-xs text-gray-500">
            {assessment.isPublished
              ? "Assessment is visible to users"
              : "Assessment is only visible to admins"}
          </span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {watch("tags")?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-500/10 text-blue-500"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-500 hover:text-blue-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={addTag}
          className="text-sm text-blue-500 hover:text-blue-400"
        >
          + Add Tag
        </button>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : assessment ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
} 