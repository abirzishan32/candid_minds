'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getInterviewById } from '@/lib/actions/general.action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { updateModeratorEmails } from '@/lib/actions/general.action';

interface ManageEmailsPageProps {
  params: {
    id: string;
  };
}

const ManageEmailsPage = ({ params }: ManageEmailsPageProps) => {
  const router = useRouter();
  const [interview, setInterview] = useState<any>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const data = await getInterviewById(params.id);
        
        if (!data || !data.isModeratorInterview) {
          router.push('/moderator-dashboard');
          return;
        }
        
        setInterview(data);
        setEmails(data.allowedEmails?.length ? [...data.allowedEmails] : ['']);
      } catch (error) {
        console.error('Error fetching interview:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInterview();
  }, [params.id, router]);

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
    setMessage({ type: '', text: '' });
    
    // Filter out empty and invalid emails
    const filteredEmails = emails
      .filter(email => email.trim() !== '' && email.includes('@'));
    
    if (filteredEmails.length === 0) {
      setMessage({ 
        type: 'error', 
        text: 'Please add at least one valid email address' 
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await updateModeratorEmails({
        interviewId: params.id,
        allowedEmails: filteredEmails
      });
      
      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: 'Allowed emails updated successfully' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: response.message || 'Failed to update allowed emails' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'An error occurred. Please try again.' 
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/moderator-dashboard" className="text-primary-100 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-white">Manage Interview Access</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-gray-950 border border-gray-800 rounded-xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-6">
            {interview.role} Interview - Email Access Control
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-lg font-medium text-white">
                  Allowed Email Addresses
                </label>
                <Button
                  type="button"
                  onClick={addEmail}
                  className="bg-primary-100 text-black hover:bg-primary-200 text-sm px-3 py-1"
                >
                  Add Email
                </Button>
              </div>
              
              <p className="text-sm text-gray-400">
                Only users with these email addresses will be able to access this interview.
              </p>
              
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
            
            {message.text && (
              <div
                className={`p-3 rounded ${
                  message.type === 'success' 
                    ? 'bg-green-900/50 border border-green-700 text-green-200' 
                    : 'bg-red-900/50 border border-red-700 text-red-200'
                }`}
              >
                {message.text}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-100 text-black hover:bg-primary-200 font-medium px-6"
              >
                {isSubmitting ? 'Updating...' : 'Update Access List'}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Interview Details</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Role:</p>
              <p className="text-white">{interview.role}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Type:</p>
              <p className="text-white">{interview.type}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Level:</p>
              <p className="text-white">{interview.level}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Date Created:</p>
              <p className="text-white">{new Date(interview.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Number of Questions:</p>
              <p className="text-white">{interview.questions.length}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Current Access:</p>
              <p className="text-white">{emails.filter(e => e.trim() !== '').length || 0} email addresses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEmailsPage; 