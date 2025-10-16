import { getAllUsers, getUser } from '@/lib/db/queries';

export async function GET() {
    try {
        // Check if user is authenticated
        const currentUser = await getUser();
        if (!currentUser) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await getAllUsers();
        return Response.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
