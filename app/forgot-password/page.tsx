'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address').toLowerCase(),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async () => {
        setIsLoading(true);
        try {
            // In a production app, this would call an API to send a reset email
            // For now, we simulate the flow
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setIsSubmitted(true);
            toast.success('Check your email for reset instructions');
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-12 lg:py-20">
            <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                <Card>
                    {isSubmitted ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                                Check your email
                            </h2>
                            <p className="text-neutral-500 mb-6">
                                If an account exists with that email, we&apos;ve sent password
                                reset instructions. Please check your inbox and spam folder.
                            </p>
                            <Link href="/login">
                                <Button variant="outline" fullWidth>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-neutral-700" />
                                </div>
                                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                                    Reset Password
                                </h2>
                                <p className="text-neutral-500">
                                    Enter your email and we&apos;ll send you instructions to
                                    reset your password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="you@example.com"
                                    error={errors.email?.message}
                                    fullWidth
                                    autoComplete="email"
                                    {...register('email')}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    isLoading={isLoading}
                                    loadingText="Sending..."
                                >
                                    Send Reset Instructions
                                </Button>
                            </form>

                            <p className="text-center text-sm text-neutral-500 mt-6">
                                Remember your password?{' '}
                                <Link
                                    href="/login"
                                    className="text-neutral-900 hover:text-neutral-700 font-medium"
                                >
                                    Back to Login
                                </Link>
                            </p>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
