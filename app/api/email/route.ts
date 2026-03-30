import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, membershipType, city, skills } = body;

    // 1. Format the role perfectly
    const displayRole = membershipType === 'volunteer' ? 'Volunteer' : 'General Member';
    
    // 2. Create a unique time string so Gmail NEVER groups them together
    const timeString = new Date().toLocaleTimeString();

    // 3. Connect to your Gmail account
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4. EMAIL 1: The Admin Alert (Goes to both of you)
    const adminMailOptions = {
      from: `"Search for a Smile" <${process.env.EMAIL_USER}>`,
      to: ['allanbah73@gmail.com', 'Mahawagberie@gmail.com'], 
      // Notice the timeString added to the subject line here!
      subject: `🚨 New ${displayRole}: ${fullName} (${timeString})`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #ffffff;">
          <h2 style="color: #22c55e;">New Application Received!</h2>
          <p>A new <strong>${displayRole}</strong> application was just submitted.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Role applied for:</strong> ${displayRole}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>WhatsApp:</strong> ${phone}</p>
          <p><strong>Location:</strong> ${city}</p>
          <p><strong>Skills:</strong> ${skills}</p> <br/>
          <br/>
          <p>Please log in to your admin dashboard to review their full application.</p>
        </div>
      `,
    };

    // 5. EMAIL 2: The Applicant Welcome
    const userMailOptions = {
      from: `"Search for a Smile" <${process.env.EMAIL_USER}>`,
      to: email, 
      subject: `Welcome to Search for a Smile, ${fullName}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #fff; background-color: #000; padding: 30px; border-radius: 15px; text-align: center;">
          <h1 style="color: #4ade80;">Search for a Smile</h1>
          <h2 style="color: #fff;">Application Received!</h2>
          <p style="color: #ccc; font-size: 16px; line-height: 1.5;">
            Hi ${fullName}, <br/><br/>
            Thank you so much for applying to be a <strong>${displayRole}</strong>. 
            We are thrilled to have you join our mission to spread happiness and positivity.
          </p>
          <div style="background-color: #111; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #22c55e;">
            <h3 style="color: #4ade80; margin-top: 0;">What happens next?</h3>
            <p style="color: #aaa; font-size: 14px; margin-bottom: 0;">
              Our team is reviewing your application. We will reach out to you shortly via WhatsApp or Email with your next steps and how to join the community!
            </p>
          </div>
          <p style="color: #777; font-size: 12px;">
            If you have any questions, feel free to reply directly to this email.
          </p>
        </div>
      `,
    };

    // 6. Send both emails at the exact same time
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    console.log("✅ EMAILS SENT SUCCESSFULLY!");
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}