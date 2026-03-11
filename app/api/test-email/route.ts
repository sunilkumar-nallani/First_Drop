import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

/**
 * GET /api/test-email?to=your@email.com
 * Sends a direct test email bypassing all business logic.
 * USE ONLY FOR DEBUGGING — remove before final production.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const to = searchParams.get('to');

    if (!to) {
        return NextResponse.json({ error: 'Add ?to=your@email.com to the URL' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    // 1. Check if API key is set
    if (!apiKey || apiKey === 're_paste_your_key_here') {
        return NextResponse.json({
            status: 'FAIL',
            problem: 'RESEND_API_KEY is not set in Vercel environment variables',
            fix: 'Go to Vercel → Settings → Environment Variables → add RESEND_API_KEY',
        });
    }

    const resend = new Resend(apiKey);

    try {
        const { data, error } = await resend.emails.send({
            from: `FirstDrop Test <${fromEmail}>`,
            to,
            subject: '✅ FirstDrop Email Test',
            html: `
        <h2>Email is working!</h2>
        <p>If you received this, Resend is configured correctly on FirstDrop.</p>
        <p><strong>API Key starts with:</strong> ${apiKey.substring(0, 10)}...</p>
        <p><strong>FROM address:</strong> ${fromEmail}</p>
        <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
      `,
        });

        if (error) {
            return NextResponse.json({
                status: 'FAIL',
                problem: 'Resend returned an error',
                error,
                likely_cause: fromEmail.includes('firstdrop.me')
                    ? 'Your firstdrop.me domain may not be fully verified in Resend yet'
                    : 'Unknown — check the error above',
                fix: 'Go to resend.com → Domains → check firstdrop.me shows "Verified" status',
            });
        }

        return NextResponse.json({
            status: 'SUCCESS',
            message: `Test email sent to ${to}. Check your inbox (and spam folder).`,
            resend_id: data?.id,
            from: fromEmail,
        });
    } catch (err) {
        return NextResponse.json({
            status: 'FAIL',
            problem: 'Exception thrown when calling Resend',
            error: err instanceof Error ? err.message : String(err),
        });
    }
}
