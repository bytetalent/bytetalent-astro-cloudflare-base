import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
  website?: string; // honeypot
}

function validate(payload: Partial<ContactPayload>): { valid: true; data: ContactPayload } | { valid: false; error: string } {
  if (!payload.name || payload.name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }
  if (payload.name.length > 200) {
    return { valid: false, error: "Name is too long" };
  }
  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return { valid: false, error: "Valid email is required" };
  }
  if (payload.email.length > 254) {
    return { valid: false, error: "Email is too long" };
  }
  if (!payload.message || payload.message.trim().length === 0) {
    return { valid: false, error: "Message is required" };
  }
  if (payload.message.length > 5000) {
    return { valid: false, error: "Message is too long (max 5000 chars)" };
  }
  if (payload.company && payload.company.length > 200) {
    return { valid: false, error: "Company is too long" };
  }

  return {
    valid: true,
    data: {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      company: payload.company?.trim() || undefined,
      message: payload.message.trim(),
    },
  };
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Cloudflare Pages: env lives on locals.runtime.env in production.
    // Dev: pulls from .env via import.meta.env.
    const env = (locals as any)?.runtime?.env ?? import.meta.env;
    const apiKey = env.RESEND_API_KEY;
    const toEmail = env.CONTACT_TO_EMAIL;
    const fromEmail = env.CONTACT_FROM_EMAIL;

    if (!apiKey || !toEmail || !fromEmail) {
      console.error("[POST /api/contact] missing env vars: RESEND_API_KEY, CONTACT_TO_EMAIL, or CONTACT_FROM_EMAIL");
      return new Response(
        JSON.stringify({ error: "Contact form is not configured", code: "CONFIG_ERROR" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const payload: Partial<ContactPayload> = {
      name: formData.get("name")?.toString(),
      email: formData.get("email")?.toString(),
      company: formData.get("company")?.toString(),
      message: formData.get("message")?.toString(),
      website: formData.get("website")?.toString(),
    };

    // Honeypot — bots fill this field; real users don't see it.
    if (payload.website && payload.website.trim().length > 0) {
      console.warn("[POST /api/contact] honeypot triggered, dropping submission");
      // Return 200 so the bot thinks it succeeded.
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = validate(payload);
    if (!result.valid) {
      console.warn("[POST /api/contact] validation failed:", result.error);
      return new Response(
        JSON.stringify({ error: result.error, code: "VALIDATION_ERROR" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { name, email, company, message } = result.data;

    const resend = new Resend(apiKey);
    const subject = `New contact form submission from ${name}`;
    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : null,
      "",
      "Message:",
      message,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      reply_to: email,
      subject,
      text,
    });

    if (error) {
      console.error("[POST /api/contact] Resend error:", error);
      return new Response(
        JSON.stringify({ error: "Couldn't send the message. Please try again.", code: "SEND_ERROR" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[POST /api/contact] unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error. Please try again.", code: "INTERNAL_ERROR" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
