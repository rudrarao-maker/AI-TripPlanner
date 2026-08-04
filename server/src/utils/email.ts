import { Resend } from "resend";

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export const sendInviteEmail = async (email: string, name: string) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY is not set. Simulating invite email to:", email);
      return;
    }

    const { data, error } = await resend.emails.send({
      from: "Trip Planner Admin <onboarding@resend.dev>", // Replace with your verified domain
      to: [email],
      subject: "You've been invited to Trip Planner!",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Welcome to Trip Planner, ${name}!</h2>
          <p>You have been invited to join the Trip Planner platform by an administrator.</p>
          <p>Please log in or sign up using your email address: <strong>${email}</strong>.</p>
          <br/>
          <a href="http://localhost:5173/login" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Trip Planner</a>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return;
    }

    console.log("Invite email sent successfully via Resend:", data?.id);
  } catch (error) {
    console.error("Error sending invite email via Resend:", error);
  }
};
