import { NextRequest } from 'next/server';
import { createUser, getUser } from '@/lib/db/queries';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        // Check if user is authenticated and is an owner
        const currentUser = await getUser();
        if (!currentUser) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (currentUser.role !== 'owner') {
            return Response.json({ error: 'Forbidden - Owner access required' }, { status: 403 });
        }

        const body = await request.json();
        const { name, email, password, role, socialGroups } = body;

        // Validate required fields
        if (!name || !email || !password) {
            return Response.json({ error: 'Name, email, and password are required' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return Response.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // Validate password length
        if (password.length < 6) {
            return Response.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const newUser = await createUser({
            name,
            email,
            passwordHash,
            role: role || 'member',
            socialGroups: socialGroups || []
        });

        return Response.json({
            success: true,
            user: newUser,
            message: 'User created successfully'
        });

    } catch (error: any) {
        console.error('Error creating user:', error);

        // Handle unique constraint violation (duplicate email)
        if (error.code === '23505' && error.constraint === 'users_email_key') {
            return Response.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        return Response.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
