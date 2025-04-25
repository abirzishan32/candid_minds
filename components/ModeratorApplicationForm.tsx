'use client';

import { useState } from "react";
import { createModeratorApplication } from "@/lib/actions/general.action";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface ModeratorApplicationFormProps {
  userId: string;
  onComplete: () => void;
}

const ModeratorApplicationForm = ({ userId, onComplete }: ModeratorApplicationFormProps) => {
  const [company, setCompany] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await createModeratorApplication({
        userId,
        company,
        reason
      });

      if (response.success) {
        setMessage({ text: response.message, type: "success" });
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        setMessage({ text: response.message, type: "error" });
      }
    } catch (error) {
      setMessage({
        text: "An error occurred. Please try again.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-white text-xl font-semibold mb-4">Apply for Interview Moderator Access</h2>
      <p className="text-gray-400 mb-6">
        Request permission to create and manage interviews for your company. Our admin team will review your application.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="company" className="block text-sm font-medium text-gray-300">
            Company Name
          </label>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            placeholder="Enter your company name"
            className="bg-black border-gray-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-300">
            Reason for Application
          </label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Describe why you need moderator access and how you plan to use it"
            className="min-h-[100px] bg-black border-gray-700 text-white"
          />
        </div>

        {message.text && (
          <div
            className={`p-3 rounded ${
              message.type === "success" ? "bg-green-900/50 border border-green-700 text-green-200" : 
              "bg-red-900/50 border border-red-700 text-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-100 text-black hover:bg-primary-200 font-medium"
        >
          {isLoading ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </div>
  );
};

export default ModeratorApplicationForm; 