import React from 'react';
import { getModeratorApplications } from '@/lib/actions/admin.action';
import { isAdmin } from '@/lib/actions/auth.action';
import AdminCheck from '@/components/AdminCheck';
import ModeratorApplicationsTable from '@/components/ModeratorApplicationsTable';

// Use a dynamic segment to force revalidation on each request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ModeratorApplicationsPage = async () => {
  const userIsAdmin = await isAdmin();
  const { applications, success } = await getModeratorApplications();

  // Cast applications to the correct type
  const typedApplications = applications as ModeratorApplication[];

  return (
    <AdminCheck isAdmin={userIsAdmin}>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-white">Moderator Applications</h1>
        
        {success && typedApplications.length > 0 ? (
          <ModeratorApplicationsTable applications={typedApplications} />
        ) : (
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400">
              {success ? "No pending applications" : "Error loading applications"}
            </p>
          </div>
        )}
      </div>
    </AdminCheck>
  );
};

export default ModeratorApplicationsPage; 