import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QuoteRequest {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  service_type: string;
  urgency: string;
  preferred_date: string | null;
  description: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const quoteData: QuoteRequest = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const emailBody = `
New Quote Request from Tree Tek Website

Customer Information:
- Name: ${quoteData.name}
- Phone: ${quoteData.phone}
- Email: ${quoteData.email}
- Address: ${quoteData.address}
- City: ${quoteData.city}
- ZIP: ${quoteData.zip}

Service Details:
- Service Type: ${quoteData.service_type}
- Urgency: ${quoteData.urgency}
- Preferred Date: ${quoteData.preferred_date || "Not specified"}

Description:
${quoteData.description}

---
This request was submitted through the Tree Tek website.
    `.trim();

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .section { margin-bottom: 20px; }
    .label { font-weight: bold; color: #10b981; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">New Quote Request - Tree Tek</h2>
    </div>
    <div class="content">
      <div class="section">
        <h3>Customer Information</h3>
        <p><span class="label">Name:</span> ${quoteData.name}</p>
        <p><span class="label">Phone:</span> ${quoteData.phone}</p>
        <p><span class="label">Email:</span> ${quoteData.email}</p>
        <p><span class="label">Address:</span> ${quoteData.address}</p>
        <p><span class="label">City:</span> ${quoteData.city}</p>
        <p><span class="label">ZIP:</span> ${quoteData.zip}</p>
      </div>

      <div class="section">
        <h3>Service Details</h3>
        <p><span class="label">Service Type:</span> ${quoteData.service_type}</p>
        <p><span class="label">Urgency:</span> ${quoteData.urgency}</p>
        <p><span class="label">Preferred Date:</span> ${quoteData.preferred_date || "Not specified"}</p>
      </div>

      <div class="section">
        <h3>Description</h3>
        <p>${quoteData.description.replace(/\n/g, '<br>')}</p>
      </div>

      <div class="footer">
        <p>This request was submitted through the Tree Tek website.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: ["josh.bruner15@yahoo.com"],
        reply_to: quoteData.email,
        subject: `New Quote Request: ${quoteData.service_type} - ${quoteData.name}`,
        text: emailBody,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const resendData = await resendResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Quote request email sent successfully",
        emailId: resendData.id
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Error in send-quote-email function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
