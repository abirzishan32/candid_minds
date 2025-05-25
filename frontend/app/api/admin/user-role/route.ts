import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/actions/auth.action';
import { db } from '@/firebase/admin';

export async function POST(request: NextRequest) {
    try {
        // Check if current user is admin
        const currentUser = await getCurrentUser();
        const userIsAdmin = await isAdmin();

        if (!currentUser || !userIsAdmin) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { userId, role } = await request.json();

        // Validate input
        if (!userId || !role || !['admin', 'user'].includes(role)) {
            return NextResponse.json(
                { success: false, message: 'Invalid user ID or role' },
                { status: 400 }
            );
        }

        // Update user role
        await db.collection('users').doc(userId).update({ role });

        return NextResponse.json(
            { success: true, message: `User role updated to ${role}` },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update user role' },
            { status: 500 }
        );
    }
}