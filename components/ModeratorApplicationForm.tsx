'use client';

import { useState } from "react";
import { createModeratorApplication } from "@/lib/actions/general.action";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Building2, AtSign, Globe, Briefcase, Linkedin, FileCheck, HelpCircle } from "lucide-react";

interface ModeratorApplicationFormProps {
  userId: string;
  onComplete: () => void;
}

const ModeratorApplicationForm = ({ userId, onComplete }: ModeratorApplicationFormProps) => {
  const [formData, setFormData] = useState({
    company: "",
    companyWebsite: "",
    workEmail: "",
    position: "",
    linkedinProfile: "",
    employeeId: "",
    verificationDocumentURL: "",
    reason: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.company && !!formData.companyWebsite && !!formData.workEmail;
      case 2:
        return !!formData.position && !!formData.linkedinProfile;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      setMessage({
        text: "Please fill all required fields before proceeding",
        type: "error"
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    // Validate work email domain matches company website domain
    if (formData.workEmail && formData.companyWebsite) {
      const emailDomain = formData.workEmail.split('@')[1];
      let websiteDomain = formData.companyWebsite.replace(/^https?:\/\//, '').replace(/^www\./, '');
      websiteDomain = websiteDomain.split('/')[0]; // Remove any paths

      if (emailDomain && websiteDomain && !emailDomain.includes(websiteDomain) && !websiteDomain.includes(emailDomain)) {
        setMessage({ 
          text: "Your work email domain should match your company's website domain", 
          type: "error" 
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await createModeratorApplication({
        userId,
        ...formData
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6 shadow-xl mb-6">
        <h2 className="text-white text-2xl font-semibold mb-2 flex items-center">
          <Building2 className="mr-2 h-6 w-6 text-primary-100" />
          Moderator Application
        </h2>
        <p className="text-gray-400 mb-4 pl-8">
          Request permission to create and manage interviews for your company. Our admin team will review your application
          and verify your company affiliation.
        </p>
        
        {/* Progress bar */}
        <div className="mb-8 mt-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-primary-100 font-medium">Company Information</span>
            <span className="text-sm text-primary-100 font-medium">Professional Details</span>
            <span className="text-sm text-primary-100 font-medium">Verification</span>
          </div>
          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-2 bg-gradient-to-r from-primary-100 to-primary-200 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Company Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary-100/20 rounded-full flex items-center justify-center mr-3">
                  <Building2 className="h-5 w-5 text-primary-100" />
                </div>
                <h3 className="text-xl text-white font-medium">Company Information</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-300 flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                    Company Name <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    placeholder="Your company name"
                    className="bg-black border-gray-700 text-white h-11 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyWebsite" className="text-gray-300 flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-gray-400" />
                    Company Website <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    required
                    placeholder="https://company.com"
                    className="bg-black border-gray-700 text-white h-11 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workEmail" className="text-gray-300 flex items-center">
                  <AtSign className="h-4 w-4 mr-2 text-gray-400" />
                  Work Email <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="workEmail"
                  type="email"
                  value={formData.workEmail}
                  onChange={handleChange}
                  required
                  placeholder="your.name@company.com"
                  className="bg-black border-gray-700 text-white h-11 text-base"
                />
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Must match your company domain for verification
                </p>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-primary-100 text-black hover:bg-primary-200 font-medium px-6 h-11"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Professional Details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary-100/20 rounded-full flex items-center justify-center mr-3">
                  <Briefcase className="h-5 w-5 text-primary-100" />
                </div>
                <h3 className="text-xl text-white font-medium">Professional Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-gray-300 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                    Position/Title <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    placeholder="Your role at the company"
                    className="bg-black border-gray-700 text-white h-11 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinProfile" className="text-gray-300 flex items-center">
                    <Linkedin className="h-4 w-4 mr-2 text-gray-400" />
                    LinkedIn Profile <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="linkedinProfile"
                    type="url"
                    value={formData.linkedinProfile}
                    onChange={handleChange}
                    required
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="bg-black border-gray-700 text-white h-11 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-gray-300 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-gray-400" />
                  Purpose of Application <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  placeholder="Explain how you plan to use the moderator features for your company interviews"
                  className="min-h-[120px] bg-black border-gray-700 text-white text-base"
                />
              </div>

              <div className="mt-8 flex justify-between">
                <Button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-800 text-gray-300 hover:bg-gray-700 font-medium px-6 h-11"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-primary-100 text-black hover:bg-primary-200 font-medium px-6 h-11"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary-100/20 rounded-full flex items-center justify-center mr-3">
                  <FileCheck className="h-5 w-5 text-primary-100" />
                </div>
                <h3 className="text-xl text-white font-medium">Additional Verification (Optional)</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-gray-300 flex items-center">
                    <FileCheck className="h-4 w-4 mr-2 text-gray-400" />
                    Employee ID
                  </Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="Your employee ID if applicable"
                    className="bg-black border-gray-700 text-white h-11 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verificationDocumentURL" className="text-gray-300 flex items-center">
                    <FileCheck className="h-4 w-4 mr-2 text-gray-400" />
                    Verification Document
                  </Label>
                  <Input
                    id="verificationDocumentURL"
                    type="url"
                    value={formData.verificationDocumentURL}
                    onChange={handleChange}
                    placeholder="URL to company badge or ID"
                    className="bg-black border-gray-700 text-white h-11 text-base"
                  />
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <HelpCircle className="h-3 w-3 mr-1" />
                    URL to an image hosting service with your company credentials
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-900 border border-gray-800 rounded-lg">
                <h4 className="text-primary-100 font-medium mb-2 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Submission Summary
                </h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><span className="text-gray-500">Company:</span> {formData.company}</p>
                  <p><span className="text-gray-500">Position:</span> {formData.position}</p>
                  <p><span className="text-gray-500">Work Email:</span> {formData.workEmail}</p>
                </div>
              </div>

              {message.text && (
                <div
                  className={`p-4 rounded-lg flex items-start ${
                    message.type === "success" ? "bg-green-900/50 border border-green-700 text-green-200" : 
                    "bg-red-900/50 border border-red-700 text-red-200"
                  }`}
                >
                  {message.type === "success" ? (
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {message.text}
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <Button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-800 text-gray-300 hover:bg-gray-700 font-medium px-6 h-11"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary-100 text-black hover:bg-primary-200 font-medium px-8 h-11 min-w-[180px] relative overflow-hidden"
                >
                  {isLoading && (
                    <span className="absolute inset-0 flex items-center justify-center bg-primary-100">
                      <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  )}
                  <span className={isLoading ? 'invisible' : ''}>Submit Application</span>
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ModeratorApplicationForm; 