import { NextRequest } from 'next/server';
import { deleteUser, getUser } from '@/lib/db/queries';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check if user is authenticated and is an owner
        const currentUser = await getUser();
        if (!currentUser) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (currentUser.role !== 'owner') {
            return Response.json({ error: 'Forbidden - Owner access required' }, { status: 403 });
        }

        const { id } = await params;
        const userId = parseInt(id);
        if (isNaN(userId)) {
            return Response.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        // Prevent users from deleting themselves
        if (userId === currentUser.id) {
            return Response.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        const deletedUser = await deleteUser(userId);

        if (!deletedUser) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: 'User deleted successfully',
            user: deletedUser
        });

    } catch (error: any) {
        console.error('Error deleting user:', error);
        return Response.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
