'use client';

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const schema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center"><p className="text-neutral-500">Loading...</p></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        if (!token) {
            toast.error('Invalid reset link. Please request a new one.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password: data.password }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(result?.error?.message || 'Something went wrong.');
            }

            setIsSuccess(true);
            toast.success('Password updated! You can now log in.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-neutral-50 py-12 lg:py-20">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <Card>
                        <div className="text-center py-4">
                            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Invalid link</h2>
                            <p className="text-neutral-500 mb-6">
                                This password reset link is invalid or has expired.
                            </p>
                            <Link href="/forgot-password">
                                <Button fullWidth>Request a new link</Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-12 lg:py-20">
            <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                <Card>
                    {isSuccess ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Password updated!</h2>
                            <p className="text-neutral-500 mb-6">
                                Your password has been changed. You can now log in with your new password.
                            </p>
                            <Link href="/login">
                                <Button fullWidth>Go to Login</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Lock className="w-8 h-8 text-neutral-700" />
                                </div>
                                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Set new password</h2>
                                <p className="text-neutral-500">Choose a strong password for your account.</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <Input
                                    label="New Password"
                                    type="password"
                                    placeholder="At least 8 characters"
                                    error={errors.password?.message}
                                    fullWidth
                                    autoComplete="new-password"
                                    {...register('password')}
                                />
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="Repeat your password"
                                    error={errors.confirmPassword?.message}
                                    fullWidth
                                    autoComplete="new-password"
                                    {...register('confirmPassword')}
                                />
                                <Button type="submit" fullWidth isLoading={isLoading} loadingText="Updating...">
                                    Update Password
                                </Button>
                            </form>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
