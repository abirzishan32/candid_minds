'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createModeratorInterview } from '@/lib/actions/general.action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

const techOptions = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
  'Node.js', 'Python', 'Django', 'Ruby', 'Rails',
  'Java', 'Spring', 'PHP', 'Laravel', 'C#',
  '.NET', 'Go', 'Rust', 'Swift', 'Kotlin',
  'SQL', 'MongoDB', 'Firebase', 'AWS', 'Azure',
  'Docker', 'Kubernetes', 'GraphQL', 'REST'
];

const levelOptions = ['Junior', 'Mid-level', 'Senior', 'Lead', 'Any Level'];
const typeOptions = ['Technical', 'Behavioral', 'Mixed'];

const CreateInterviewPage = () => {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [type, setType] = useState('');
  const [level, setLevel] = useState('');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [questions, setQuestions] = useState<string[]>(['']);
  const [emails, setEmails] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleTechToggle = (tech: string) => {
    setSelectedTech(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech) 
        : [...prev, tech]
    );
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = value;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const updatedQuestions = [...questions];
      updatedQuestions.splice(index, 1);
      setQuestions(updatedQuestions);
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);
  };

  const addEmail = () => {
    setEmails([...emails, '']);
  };

  const removeEmail = (index: number) => {
    if (emails.length > 1) {
      const updatedEmails = [...emails];
      updatedEmails.splice(index, 1);
      setEmails(updatedEmails);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    if (!role || !type || !level || selectedTech.length === 0) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }
    
    // Filter out empty questions
    const filteredQuestions = questions.filter(q => q.trim() !== '');
    
    if (filteredQuestions.length === 0) {
      setError('Please add at least one question');
      setIsSubmitting(false);
      return;
    }
    
    // Filter out empty and invalid emails
    const filteredEmails = emails
      .filter(email => email.trim() !== '' && email.includes('@'));
    
    if (filteredEmails.length === 0) {
      setError('Please add at least one valid email address');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await createModeratorInterview({
        role,
        type,
        level,
        techstack: selectedTech,
        questions: filteredQuestions,
        allowedEmails: filteredEmails
      });
      
      if (response.success) {
        router.push('/moderator-dashboard');
      } else {
        setError(response.message || 'Failed to create interview');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/moderator-dashboard" className="text-primary-100 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-white">Create Company Interview</h1>
      </div>
      
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-white">Job Role <span className="text-red-500">*</span></Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="bg-black border-gray-800 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level" className="text-white">Experience Level <span className="text-red-500">*</span></Label>
              <Select value={level} onValueChange={setLevel} required>
                <SelectTrigger className="bg-black border-gray-800 text-white">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-800 text-white">
                  {levelOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">Interview Type <span className="text-red-500">*</span></Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger className="bg-black border-gray-800 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-800 text-white">
                  {typeOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Tech Stack <span className="text-red-500">*</span></Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {techOptions.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => handleTechToggle(tech)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTech.includes(tech)
                      ? 'bg-primary-100 text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>
          
          {/* Interview Questions */}
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold text-white">Interview Questions <span className="text-red-500">*</span></Label>
              <Button
                type="button"
                onClick={addQuestion}
                className="bg-primary-100 text-black hover:bg-primary-200 text-sm px-3 py-1"
              >
                Add Question
              </Button>
            </div>

            {questions.map((question, index) => (
              <div key={`question-${index}`} className="space-y-2 bg-gray-900 p-4 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-white">Question {index + 1}</label>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <Textarea
                  value={question}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  required
                  placeholder="Enter your interview question here..."
                  className="bg-black border-gray-800 text-white min-h-[100px]"
                />
              </div>
            ))}
          </div>
          
          {/* Allowed Email Addresses */}
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold text-white">Allowed Email Access <span className="text-red-500">*</span></Label>
              <Button
                type="button"
                onClick={addEmail}
                className="bg-primary-100 text-black hover:bg-primary-200 text-sm px-3 py-1"
              >
                Add Email
              </Button>
            </div>
            <p className="text-sm text-gray-400">Only users with these email addresses will be able to access this interview.</p>

            {emails.map((email, index) => (
              <div key={`email-${index}`} className="space-y-2 bg-gray-900 p-4 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-white">Email Address {index + 1}</label>
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmail(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <Input
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  required
                  type="email"
                  placeholder="Enter candidate's email address"
                  className="bg-black border-gray-800 text-white"
                />
              </div>
            ))}
          </div>
          
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 text-red-200 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => router.push('/moderator-dashboard')}
              className="bg-gray-800 hover:bg-gray-700 text-white mr-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-100 text-black hover:bg-primary-200 font-medium px-6"
            >
              {isSubmitting ? 'Creating...' : 'Create Interview'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInterviewPage; 