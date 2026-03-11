import { Resend } from 'resend';

// =============================================================================
// Email Service
// =============================================================================
// This module handles all email notifications for FirstDrop.
// Uses Resend for production email delivery with a graceful fallback
// to console logging when Resend is not configured.
//
// To configure Resend:
// 1. Sign up at https://resend.com
// 2. Get an API key
// 3. Add RESEND_API_KEY to your .env file
// 4. Verify your domain (or use onboarding@resend.dev for testing)
// =============================================================================

// Initialize Resend client if API key is available
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// From email address
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Application URL for links
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * Sends a notification email to a founder when someone joins their waitlist.
 *
 * @param founderEmail - The founder's email address
 * @param ideaTitle - The title of the idea
 * @param userEmail - The email of the user who joined the waitlist
 * @returns Promise resolving to true if sent successfully, false otherwise
 *
 * @example
 * ```typescript
 * await sendFounderNotification(
 *   'founder@example.com',
 *   'My Amazing Startup',
 *   'user@example.com'
 * );
 * ```
 */
export async function sendFounderNotification(
  founderEmail: string,
  ideaTitle: string,
  userEmail: string
): Promise<boolean> {
  const subject = 'Someone just joined your FirstDrop waitlist!';

  // Build the email HTML
  const html = buildFounderNotificationEmail(ideaTitle, userEmail);

  // If Resend is not configured, log to console and return
  if (!resend) {
    console.log('========================================');
    console.log('📧 EMAIL NOTIFICATION (Resend not configured)');
    console.log('========================================');
    console.log(`To: ${founderEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`User joined: ${userEmail}`);
    console.log(`Idea: ${ideaTitle}`);
    console.log('----------------------------------------');
    console.log('To send real emails, set RESEND_API_KEY in your .env file');
    console.log('========================================');
    return true; // Return true so the app doesn't crash
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `FirstDrop <${FROM_EMAIL}>`,
      to: founderEmail,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log(`📧 Email sent successfully: ${data?.id}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Sends a confirmation email to the user who just joined the waitlist.
 *
 * @param userEmail - The user's email address
 * @param ideaTitle - The title of the idea they joined
 * @param ideaSlug - The slug for the idea URL
 * @returns Promise resolving to true if sent successfully, false otherwise
 */
export async function sendUserConfirmationEmail(
  userEmail: string,
  ideaTitle: string,
  ideaSlug: string
): Promise<boolean> {
  const subject = `You're on the waitlist for "${ideaTitle}"!`;
  const html = buildUserConfirmationEmail(ideaTitle, ideaSlug);

  if (!resend) {
    console.log('========================================');
    console.log('📧 USER CONFIRMATION EMAIL (Resend not configured)');
    console.log('========================================');
    console.log(`To: ${userEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Idea: ${ideaTitle}`);
    console.log('========================================');
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `FirstDrop <${FROM_EMAIL}>`,
      to: userEmail,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending user confirmation email:', error);
      return false;
    }

    console.log(`📧 User confirmation email sent: ${data?.id}`);
    return true;
  } catch (error) {
    console.error('Error sending user confirmation email:', error);
    return false;
  }
}

/**
 * Builds the HTML email template for user waitlist confirmation.
 */
function buildUserConfirmationEmail(ideaTitle: string, ideaSlug: string): string {
  const ideaUrl = `${APP_URL}/idea/${ideaSlug}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're on the waitlist!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #1a202c;">You're on the list! 🎉</h1>
              <p style="margin: 0; font-size: 16px; color: #718096;">FirstDrop</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
                Thank you for registering your interest in this idea. We've added you to the waitlist and the founder has been notified.
              </p>

              <table role="presentation" style="width: 100%; background-color: #f7fafc; border-radius: 12px; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px;">You joined the waitlist for</p>
                    <p style="margin: 0; font-size: 20px; font-weight: 700; color: #1a202c;">${escapeHtml(ideaTitle)}</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
                The founder will reach out to you directly with updates. Stay tuned!
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${ideaUrl}" style="display: inline-block; padding: 16px 32px; background-color: #1a202c; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      View the Idea
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #718096;">
                You received this because you joined a waitlist on FirstDrop.
              </p>
              <p style="margin: 0; font-size: 13px; color: #a0aec0;">
                <a href="${APP_URL}" style="color: #1a202c; text-decoration: none;">firstdrop.me</a> — Validate startup ideas before you build
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Builds the HTML email template for founder notifications.
 * Uses inline styles for maximum email client compatibility.
 *
 * @param ideaTitle - The title of the idea
 * @param userEmail - The email of the user who joined
 * @returns HTML string for the email
 */
function buildFounderNotificationEmail(
  ideaTitle: string,
  userEmail: string
): string {
  const dashboardUrl = `${APP_URL}/dashboard`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Someone joined your FirstDrop waitlist!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1a202c; font-family: 'DM Sans', sans-serif;">
                🎉 Great News!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
                Someone just joined the waitlist for your idea on <strong style="color: #1a202c;">FirstDrop</strong>!
              </p>
              
              <table role="presentation" style="width: 100%; background-color: #f7fafc; border-radius: 12px; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px;">
                      Idea
                    </p>
                    <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1a202c;">
                      ${escapeHtml(ideaTitle)}
                    </p>
                    
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px;">
                      New Waitlist Member
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #1a202c;">
                      ${escapeHtml(userEmail)}
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
                Keep building and validating! Your waitlist is growing.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 16px 32px; background-color: #f56565; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      View Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #718096;">
                You're receiving this because you listed an idea on FirstDrop.
              </p>
              <p style="margin: 0; font-size: 14px; color: #a0aec0;">
                <a href="${APP_URL}" style="color: #f56565; text-decoration: none;">FirstDrop</a> - Validate your ideas before you build
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Escapes HTML special characters to prevent XSS attacks.
 *
 * @param text - The text to escape
 * @returns Escaped text safe for HTML insertion
 */
function escapeHtml(text: string): string {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (div) {
    div.textContent = text;
    return div.innerHTML;
  }
  // Server-side fallback
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sends a test email to verify email configuration.
 * Useful for debugging email setup.
 *
 * @param to - The recipient email address
 * @returns Promise resolving to true if sent successfully
 */
export async function sendTestEmail(to: string): Promise<boolean> {
  if (!resend) {
    console.log('Cannot send test email: RESEND_API_KEY not configured');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `FirstDrop <${FROM_EMAIL}>`,
      to,
      subject: 'Test Email from FirstDrop',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from FirstDrop.</p>
        <p>If you're seeing this, your email configuration is working!</p>
      `,
    });

    if (error) {
      console.error('Error sending test email:', error);
      return false;
    }

    console.log(`Test email sent: ${data?.id}`);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
}
