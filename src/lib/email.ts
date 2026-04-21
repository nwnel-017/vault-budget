type SendVerificationEmailInput = {
  to: string;
  subject: string;
  text: string;
};

export async function sendVerificationEmail({
  to,
  subject,
  text,
}: SendVerificationEmailInput) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.AUTH_FROM_EMAIL;

  // In development, this logs the link if no provider is set yet.
  if (!resendApiKey || !fromEmail) {
    console.warn("Email provider is not configured for Better Auth.");
    console.info(`Verification email for ${to}: ${subject}\n${text}`);
    return;
  }

  // This uses Resend without adding a new package.
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to send verification email. Status: ${response.status}. Body: ${errorBody}`,
    );
  }
}
