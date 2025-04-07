import React from 'react';
import { getCurrentUser } from '@/lib/actions/auth.action';
import CreateInterviewForm from '@/components/admin/CreateInterviewForm';

const CreateInterviewPage = async () => {
    const user = await getCurrentUser();

    return (
        <section className="max-w-5xl mx-auto bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">Create Custom Interview</h1>
                <p className="text-gray-400">Design an interview for your company's recruitment process</p>
            </div>

            <CreateInterviewForm adminId={user?.id!} adminName={user?.name!} />
        </section>
    );
};

export default CreateInterviewPage;