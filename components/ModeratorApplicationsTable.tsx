'use client';

import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { updateModeratorApplication } from '@/lib/actions/admin.action';
import { formatDistance } from 'date-fns';

interface ModeratorApplicationsTableProps {
  applications: ModeratorApplication[];
}

const ModeratorApplicationsTable = ({ applications }: ModeratorApplicationsTableProps) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processedIds, setProcessedIds] = useState<string[]>([]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    
    try {
      const result = await updateModeratorApplication({ applicationId: id, status });
      
      if (result.success) {
        setProcessedIds(prev => [...prev, id]);
      } else {
        alert(result.message || 'Error updating application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('An error occurred while updating the application');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter out processed applications if they're still in the props
  const activeApplications = applications.filter(app => !processedIds.includes(app.id));

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-900 border-b border-gray-800">
            <TableHead className="text-gray-300">Applicant</TableHead>
            <TableHead className="text-gray-300">Company</TableHead>
            <TableHead className="text-gray-300">Reason</TableHead>
            <TableHead className="text-gray-300">Date</TableHead>
            <TableHead className="text-gray-300 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeApplications.length > 0 ? (
            activeApplications.map((application) => (
              <TableRow 
                key={application.id} 
                className="border-b border-gray-800 hover:bg-gray-900"
              >
                <TableCell className="font-medium text-white">
                  <div>{application.userName}</div>
                  <div className="text-gray-400 text-sm">{application.email}</div>
                </TableCell>
                <TableCell className="text-gray-300">{application.company}</TableCell>
                <TableCell className="text-gray-300 max-w-[300px] truncate">
                  {application.reason}
                </TableCell>
                <TableCell className="text-gray-400 text-sm">
                  {formatDistance(new Date(application.createdAt), new Date(), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-700 hover:bg-green-800"
                      onClick={() => handleUpdateStatus(application.id, 'approved')}
                      disabled={processingId === application.id}
                    >
                      {processingId === application.id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUpdateStatus(application.id, 'rejected')}
                      disabled={processingId === application.id}
                    >
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-400">
                No pending applications
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ModeratorApplicationsTable; 