'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// =============================================================================
// Edit Profile Page
// =============================================================================

interface ProfileData {
    name: string;
    about: string;
    profilePhoto: string;
    socialHandles: {
        twitter: string;
        linkedin: string;
        github: string;
        website: string;
    };
}

export default function EditProfilePage() {
    const router = useRouter();
    const { status } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileData>({
        name: '',
        about: '',
        profilePhoto: '',
        socialHandles: {
            twitter: '',
            linkedin: '',
            github: '',
            website: '',
        },
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/profile/edit');
        }
    }, [status, router]);

    // Fetch current profile data
    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch('/api/dashboard');
                if (res.ok) {
                    const data = await res.json();
                    const user = data.user;
                    const socials = user.socialHandles || {};
                    setProfile({
                        name: user.name || '',
                        about: user.about || '',
                        profilePhoto: user.profilePhoto || '',
                        socialHandles: {
                            twitter: socials.twitter || '',
                            linkedin: socials.linkedin || '',
                            github: socials.github || '',
                            website: socials.website || '',
                        },
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                toast.error('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        }

        if (status === 'authenticated') {
            fetchProfile();
        }
    }, [status]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Build social handles object, filtering out empty values
            const socialHandles: Record<string, string> = {};
            Object.entries(profile.socialHandles).forEach(([key, value]) => {
                if (value.trim()) {
                    socialHandles[key] = value.trim();
                }
            });

            const body: Record<string, unknown> = {
                name: profile.name,
                about: profile.about || null,
            };

            if (profile.profilePhoto.trim()) {
                body.profilePhoto = profile.profilePhoto;
            }

            if (Object.keys(socialHandles).length > 0) {
                body.socialHandles = socialHandles;
            }

            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast.success('Profile updated successfully!');
                router.push('/dashboard');
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error?.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8 lg:py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back link */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-neutral-500 hover:text-navy-700 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <h1 className="text-2xl font-bold text-neutral-900 mb-8">Edit Profile</h1>

                <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <Card className="mb-6">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                            Basic Information
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-neutral-700 mb-1"
                                >
                                    Name *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    value={profile.name}
                                    onChange={(e) =>
                                        setProfile({ ...profile, name: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-colors"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="about"
                                    className="block text-sm font-medium text-neutral-700 mb-1"
                                >
                                    About
                                </label>
                                <textarea
                                    id="about"
                                    rows={4}
                                    maxLength={2000}
                                    value={profile.about}
                                    onChange={(e) =>
                                        setProfile({ ...profile, about: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-colors resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                                <p className="text-xs text-neutral-400 mt-1">
                                    {profile.about.length}/2000 characters
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="profilePhoto"
                                    className="block text-sm font-medium text-neutral-700 mb-1"
                                >
                                    Profile Photo URL
                                </label>
                                <input
                                    id="profilePhoto"
                                    type="url"
                                    value={profile.profilePhoto}
                                    onChange={(e) =>
                                        setProfile({ ...profile, profilePhoto: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-colors"
                                    placeholder="https://example.com/your-photo.jpg"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Social Links */}
                    <Card className="mb-6">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                            Social Links
                        </h2>
                        <p className="text-sm text-neutral-500 mb-4">
                            Add your social media handles so others can connect with you.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="twitter"
                                    className="block text-sm font-medium text-neutral-700 mb-1"
                                >
                                    Twitter / X
                                </label>
                                <input
                                    id="twitter"
                                    type="text"
                                    value={profile.socialHandles.twitter}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            socialHandles: {
                                                ...profile.socialHandles,
                                                twitter: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-colors"
                                    placeholder="@yourusername"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="linkedin"
                                    className="block text-sm font-medium text-neutral-700 mb-1"
                                >
                                    LinkedIn
                                </label>
                                <input
                                    id="linkedin"
                                    type="text"
                                    value={profile.socialHandles.linkedin}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            socialHandles: {
                                                ...profile.socialHandles,
                                                linkedin: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-colors"
                                    placeholder="your-linkedin-username"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="github"
                                    className="block text-sm font-medium text-neutral-700 mb-1"
                                >
                                    GitHub
                                </label>
                                <input
                                    id="github"
                                    type="text"
                                    value={profile.socialHandles.github}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            socialHandles: {
                                                ...profile.socialHandles,
                                                github: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-colors"
                                    placeholder="your-github-username"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="website"
                                    className="block text-sm font-medium text-navy-700 mb-1"
                                >
                                    Website
                                </label>
                                <input
                                    id="website"
                                    type="text"
                                    value={profile.socialHandles.website}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            socialHandles: {
                                                ...profile.socialHandles,
                                                website: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-colors"
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Submit buttons */}
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={saving || !profile.name.trim()}>
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
