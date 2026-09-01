// @ts-nocheck
import { inngest } from "./client";
import { clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_build');

// @ts-ignore
export const processBulkImport = inngest.createFunction(
  { id: "process-bulk-import" },
  { event: "admin/bulk.import" },
  async ({ event, step }) => {
    const { users } = event.data;
    
    const events = users.map((u: any) => ({
      name: "admin/import.single-user",
      data: { user: u }
    }));
    
    await step.sendEvent("dispatch-imports", events);
    return { dispatched: events.length };
  }
);

// @ts-ignore
export const importSingleUser = inngest.createFunction(
  { id: "import-single-user", retries: 5 },
  { event: "admin/import.single-user" },
  async ({ event, step }) => {
    const u = event.data.user;
    const client = await clerkClient();

    const result = await step.run("create-user", async () => {
      try {
        const newUser = await client.users.createUser({
          emailAddress: [u.email],
          firstName: u.name?.split(" ")[0] || "",
          lastName: u.name?.split(" ").slice(1).join(" ") || "",
          password: "Password123!",
          publicMetadata: {
            role: u.role || "user"
          }
        });
        return { success: true, id: newUser.id };
      } catch (error: any) {
        // If it's a validation error (like email already exists), we shouldn't retry it infinitely.
        // For simplicity, we just return the error string.
        throw new Error(error.errors?.[0]?.message || error.message);
      }
    });

    return result;
  }
);

// @ts-ignore
export const sendWelcomeEmail = inngest.createFunction(
  { id: "send-welcome-email", retries: 3 },
  { event: "email/send-welcome" },
  async ({ event, step }) => {
    const { email, firstName } = event.data;
    
    await step.run("send-email", async () => {
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder') {
        await resend.emails.send({
          from: 'TripCraft AI <welcome@yourdomain.com>',
          to: [email],
          subject: 'Welcome to TripCraft AI!',
          html: `<p>Hi ${firstName || 'Traveler'},</p><p>Welcome to TripCraft AI! Start planning your dream trip today.</p>`,
        });
      }
    });

    return { success: true };
  }
);
