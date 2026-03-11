import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

const schema = z.object({
    email: z.string().email(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = schema.parse(body);

        const normalizedEmail = email.toLowerCase().trim();

        // Always respond with success — never reveal if an account exists (security best practice)
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (user) {
            // Delete any existing reset tokens for this email
            await prisma.passwordResetToken.deleteMany({ where: { email: normalizedEmail } });

            // Generate a secure random token
            const token = crypto.randomBytes(32).toString('hex');

            // Set expiry to 1 hour from now
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

            // Save token to database
            await prisma.passwordResetToken.create({
                data: { email: normalizedEmail, token, expiresAt },
            });

            // Send reset email (fire and forget — response is not delayed)
            sendPasswordResetEmail(normalizedEmail, user.name, token).catch(console.error);
        }

        // Always return success message regardless — prevents email enumeration attacks
        return NextResponse.json({ message: 'If an account exists, a reset email has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: { message: 'Something went wrong.' } }, { status: 500 });
    }
}
