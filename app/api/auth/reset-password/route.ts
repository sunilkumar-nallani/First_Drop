import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const schema = z.object({
    token: z.string().min(1),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password } = schema.parse(body);

        // Find token in database
        const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

        if (!resetToken) {
            return NextResponse.json(
                { error: { message: 'Invalid or expired reset link. Please request a new one.' } },
                { status: 400 }
            );
        }

        // Check if token has expired
        if (new Date() > resetToken.expiresAt) {
            await prisma.passwordResetToken.delete({ where: { token } });
            return NextResponse.json(
                { error: { message: 'This reset link has expired. Please request a new one.' } },
                { status: 400 }
            );
        }

        // Hash the new password
        const passwordHash = await bcrypt.hash(password, 12);

        // Update user's password
        await prisma.user.update({
            where: { email: resetToken.email },
            data: { passwordHash },
        });

        // Delete the token — it's been used
        await prisma.passwordResetToken.delete({ where: { token } });

        return NextResponse.json({ message: 'Password updated successfully. You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: { message: 'Something went wrong.' } }, { status: 500 });
    }
}
