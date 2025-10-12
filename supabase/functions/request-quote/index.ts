import { createClient } from 'npm:@supabase/supabase-js@2';
import { Resend } from 'npm:resend@3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const alertEmail = Deno.env.get('ALERT_TO_EMAIL') || 'landtekbiz@gmail.com';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await req.formData();

    const requestData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      zip: formData.get('zip') as string,
      service_type: formData.get('service_type') as string,
      urgency: formData.get('urgency') as string,
      preferred_date: formData.get('preferred_date') as string || null,
      description: formData.get('description') as string,
    };

    const photoUrls: string[] = [];
    const photos = formData.getAll('photos') as File[];

    for (const photo of photos) {
      if (photo && photo.size > 0) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const requestId = crypto.randomUUID();
        const filePath = `${requestId}/${fileName}`;

        const photoBuffer = await photo.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from('requests')
          .upload(filePath, photoBuffer, {
            contentType: photo.type,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('requests')
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          photoUrls.push(urlData.publicUrl);
        }
      }
    }

    const { error: insertError } = await supabase
      .from('service_requests')
      .insert([{
        ...requestData,
        photos: photoUrls,
      }]);

    if (insertError) {
      throw insertError;
    }

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);

        const photoLinks = photoUrls.map((url, i) => `<a href="${url}">Photo ${i + 1}</a>`).join(' | ');

        await resend.emails.send({
          from: 'TREE TEK <noreply@updates.treetek.com>',
          to: alertEmail,
          subject: `New TREE TEK Service Request – ${requestData.service_type} – ${requestData.name}`,
          html: `
            <h2>New Service Request</h2>
            <p><strong>Urgency:</strong> ${requestData.urgency}</p>
            <hr>
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${requestData.name}</p>
            <p><strong>Phone:</strong> ${requestData.phone}</p>
            <p><strong>Email:</strong> ${requestData.email}</p>
            <hr>
            <h3>Service Details</h3>
            <p><strong>Service Type:</strong> ${requestData.service_type}</p>
            <p><strong>Address:</strong> ${requestData.address}, ${requestData.city}, ${requestData.zip}</p>
            ${requestData.preferred_date ? `<p><strong>Preferred Date:</strong> ${requestData.preferred_date}</p>` : ''}
            <p><strong>Description:</strong><br>${requestData.description}</p>
            ${photoUrls.length > 0 ? `<p><strong>Photos:</strong> ${photoLinks}</p>` : ''}
          `,
        });

        await resend.emails.send({
          from: 'TREE TEK <noreply@updates.treetek.com>',
          to: requestData.email,
          subject: 'TREE TEK – We\'ve received your service request!',
          html: `
            <h2>Thank You for Contacting TREE TEK</h2>
            <p>Hi ${requestData.name},</p>
            <p>Thanks for reaching out to TREE TEK! We've received your request for <strong>${requestData.service_type}</strong> and will contact you soon at <strong>${requestData.phone}</strong>.</p>
            <p>If this is an emergency, please call us directly at <strong>(321) 282-9795</strong>.</p>
            <br>
            <p>— TREE TEK Team<br>
            landtekbiz@gmail.com</p>
          `,
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
