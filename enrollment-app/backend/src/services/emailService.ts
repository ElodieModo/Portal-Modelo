import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface Participant {
  firstName: string;
  lastName: string;
  age: number;
}

interface PricingRates {
  adult: number;
  child: number;
  childAgeLimit: number;
}

export const emailService = {
  /**
   * Compute a per-participant price breakdown based on age (child rate applies at/under childAgeLimit)
   */
  computePricing(participants: Participant[], durationHours: number, rates?: PricingRates) {
    if (!rates || !durationHours) {
      return { lines: [] as { label: string; price: string }[], total: 'TBD' };
    }
    let total = 0;
    const lines = participants.map(p => {
      const isChild = p.age <= rates.childAgeLimit;
      const price = (isChild ? rates.child : rates.adult) * durationHours;
      total += price;
      return {
        label: `${p.firstName} ${p.lastName} (${p.age} yo, ${isChild ? 'child' : 'adult'} rate)`,
        price: price.toFixed(2)
      };
    });
    return { lines, total: total.toFixed(2) };
  },

  /**
   * Send enrollment confirmation email to student
   */
  async sendStudentEnrollmentConfirmation(
    studentEmail: string,
    studentName: string,
    courseName: string,
    courseDate: string | null,
    courseTime: string | null,
    rates?: PricingRates,
    numberOfPeople: number = 1,
    participants: Participant[] = [],
    isFreeTrial: boolean = false
  ) {
    const durationHours = this.calculateCourseDuration(courseTime || '');
    const { lines: pricingLines, total: totalPrice } = isFreeTrial
      ? { lines: participants.map(p => ({ label: `${p.firstName} ${p.lastName}`, price: '0.00' })), total: '0.00' }
      : this.computePricing(participants, durationHours, rates);
    const participantsListHtml = pricingLines.map(l => `<li>${l.label}: £${l.price}</li>`).join('');
    const participantsListText = pricingLines.map(l => `- ${l.label}: £${l.price}`).join('\n');
    const freeTrialBannerHtml = isFreeTrial
      ? `<div class="payment-info" style="background-color:#d4edda;"><p>🎉 <strong>Your first class is on us!</strong> This booking is completely free.</p></div>`
      : '';
    const freeTrialBannerText = isFreeTrial ? '🎉 Your first class is on us! This booking is completely free.\n' : '';

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #d4a574; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .course-detail { background-color: white; padding: 15px; border-left: 4px solid #d4a574; margin: 10px 0; }
            .payment-info { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .price { font-size: 24px; font-weight: bold; color: #d4a574; }
            .people-info { background-color: #e8f4f8; padding: 10px; border-radius: 3px; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🥁 Portal Modelo Capoeira</h1>
              <p>Registration Confirmation</p>
            </div>
            <div class="content">
              <p>Hello <strong>${studentName}</strong>,</p>
              <p>Thank you for registering! We're excited to have you join us.</p>
              ${freeTrialBannerHtml}
              
              <div class="course-detail">
                <h3>Course Details</h3>
                <p><strong>Course:</strong> ${courseName}</p>
                ${courseDate ? `<p><strong>Date:</strong> ${courseDate}</p>` : ''}
                ${courseTime ? `<p><strong>Time:</strong> ${courseTime}</p>` : ''}
                <div class="people-info">
                  <p><strong>👥 Number of Participants:</strong> ${numberOfPeople}</p>
                  <ul>${participantsListHtml}</ul>
                  <p><strong>Total Price:</strong> <span class="price">£${totalPrice}</span></p>
                </div>
              </div>

              <div class="payment-info">
                <h4>💷 Payment Information</h4>
                <p><strong>Payment is due on the day of the course.</strong></p>
                <p>We accept:</p>
                <ul>
                  <li>Cash</li>
                  <li>Bank Transfer</li>
                </ul>
                <p>Total amount due: <strong>£${totalPrice}</strong> (for ${numberOfPeople} ${numberOfPeople === 1 ? 'person' : 'people'})</p>
              </div>

              <div class="course-detail" style="border-left-color: #e74c3c;">
                <h4>❌ Cancellation Policy</h4>
                <p>You can cancel your enrollment <strong>up to 24 hours before the course starts</strong>.</p>
                <p>Cancellations made within 24 hours of the course start time cannot be processed online.</p>
              </div>

              <p>If you have any questions, please don't hesitate to contact us.</p>
              <p>See you soon! 💪</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Capoeira Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Hello ${studentName},

Thank you for registering! We're excited to have you join us.
${freeTrialBannerText}
COURSE DETAILS
Course: ${courseName}
${courseDate ? `Date: ${courseDate}` : ''}
${courseTime ? `Time: ${courseTime}` : ''}
Number of Participants: ${numberOfPeople}
${participantsListText}
Total Price: £${totalPrice}

PAYMENT INFORMATION
Payment is due on the day of the course.
We accept: Cash and Bank Transfer
Total amount due: £${totalPrice} (for ${numberOfPeople} ${numberOfPeople === 1 ? 'person' : 'people'})

CANCELLATION POLICY
You can cancel up to 24 hours before the course.
Cancellations within 24 hours cannot be processed online.

If you have any questions, please don't hesitate to contact us.
See you soon!
    `;

    return this.sendEmail({
      to: studentEmail,
      subject: `Registration Confirmation: ${courseName}`,
      html,
      text
    });
  },

  /**
   * Send notification email to instructor about new enrollment
   */
  async sendInstructorNotification(
    instructorEmail: string,
    studentName: string,
    studentEmail: string,
    courseName: string,
    courseDate: string | null,
    courseTime: string | null,
    rates?: PricingRates,
    numberOfPeople: number = 1,
    participants: Participant[] = [],
    isFreeTrial: boolean = false
  ) {
    const durationHours = this.calculateCourseDuration(courseTime || '');
    const { lines: pricingLines, total: totalPrice } = isFreeTrial
      ? { lines: participants.map(p => ({ label: `${p.firstName} ${p.lastName}`, price: '0.00' })), total: '0.00' }
      : this.computePricing(participants, durationHours, rates);
    const participantsListHtml = pricingLines.map(l => `<li>${l.label}: £${l.price}</li>`).join('');
    const participantsListText = pricingLines.map(l => `- ${l.label}: £${l.price}`).join('\n');

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #d4a574; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .student-detail { background-color: white; padding: 15px; border-left: 4px solid #d4a574; margin: 10px 0; }
            .price { font-size: 18px; font-weight: bold; color: #d4a574; }
            .people-info { background-color: #e8f4f8; padding: 10px; border-radius: 3px; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🥁 Portal Modelo Capoeira</h1>
              <p>New Student Registration</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>A new student has registered for your course!</p>
              
              <div class="student-detail">
                <h3>Student Information</h3>
                <p><strong>Name:</strong> ${studentName}</p>
                <p><strong>Email:</strong> ${studentEmail}</p>
                <p><strong>Course:</strong> ${courseName}</p>
                ${courseDate ? `<p><strong>Date:</strong> ${courseDate}</p>` : ''}
                ${courseTime ? `<p><strong>Time:</strong> ${courseTime}</p>` : ''}
                <div class="people-info">
                  <p><strong>👥 Number of Participants:</strong> ${numberOfPeople}</p>
                  <ul>${participantsListHtml}</ul>
                  <p><strong>Total Price Due:</strong> <span class="price">£${totalPrice}</span>${isFreeTrial ? ' (Free trial class)' : ''}</p>
                </div>
              </div>

              <p>You can manage enrollments in your instructor dashboard.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Capoeira Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Hello,

A new student has registered for your course!

STUDENT INFORMATION
Name: ${studentName}
Email: ${studentEmail}
Course: ${courseName}
${courseDate ? `Date: ${courseDate}` : ''}
${courseTime ? `Time: ${courseTime}` : ''}
Number of Participants: ${numberOfPeople}
${participantsListText}
Total Price Due: £${totalPrice}

You can manage enrollments in your instructor dashboard.
    `;

    return this.sendEmail({
      to: instructorEmail,
      subject: `New Registration: ${studentName} - ${courseName}`,
      html,
      text
    });
  },

  async sendStudentCancellationConfirmation(
    studentEmail: string,
    studentName: string,
    courseName: string,
    courseDate: string,
    courseTime: string
  ) {
    const text = `
Hello ${studentName},

Your booking has been cancelled successfully.

Class: ${courseName}
Date: ${courseDate}
Time: ${courseTime}
    `;

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="background:#d4a574; color:white; padding:20px; text-align:center;">Portal Modelo Capoeira</h1>
            <p>Hello <strong>${studentName}</strong>,</p>
            <p>Your booking has been cancelled successfully.</p>
            <p><strong>Class:</strong> ${courseName}<br />
            <strong>Date:</strong> ${courseDate}<br />
            <strong>Time:</strong> ${courseTime}</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: studentEmail,
      subject: `Booking cancelled: ${courseName}`,
      html,
      text
    });
  },

  async sendInstructorCancellationNotification(
    instructorEmail: string,
    studentName: string,
    studentEmail: string,
    courseName: string,
    courseDate: string,
    courseTime: string,
    numberOfPeople: number
  ) {
    const text = `
Hello,

A booking has been cancelled.

Student: ${studentName}
Email: ${studentEmail}
Class: ${courseName}
Date: ${courseDate}
Time: ${courseTime}
Students: ${numberOfPeople}
    `;

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="background:#d4a574; color:white; padding:20px; text-align:center;">Portal Modelo Capoeira</h1>
            <p>A booking has been cancelled.</p>
            <p><strong>Student:</strong> ${studentName}<br />
            <strong>Email:</strong> ${studentEmail}<br />
            <strong>Class:</strong> ${courseName}<br />
            <strong>Date:</strong> ${courseDate}<br />
            <strong>Time:</strong> ${courseTime}<br />
            <strong>Students:</strong> ${numberOfPeople}</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: instructorEmail,
      subject: `Booking cancelled: ${studentName} - ${courseName}`,
      html,
      text
    });
  },

  /**
   * Send welcome email after student account creation
   */
  async sendStudentWelcomeEmail(studentEmail: string, studentName: string) {
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #d4a574; color: white; padding: 20px; text-align: center; border-radius: 5px;">
              <h1>Portal Modelo Capoeira</h1>
              <p>Welcome to our community</p>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <p>Hello <strong>${studentName}</strong>,</p>
              <p>Your student account has been created successfully.</p>
              <p>You can now browse available classes and book your first session.</p>
              <p>We look forward to seeing you in the roda!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Hello ${studentName},

Your student account has been created successfully.
You can now browse available classes and book your first session.

We look forward to seeing you in the roda!
    `;

    return this.sendEmail({
      to: studentEmail,
      subject: 'Welcome to Portal Modelo Capoeira',
      html,
      text
    });
  },

  /**
   * Calculate course duration in hours from time string
   */
  calculateCourseDuration(timeString: string): number {
    if (!timeString) return 0;
    const [startTime, endTime] = timeString.split(' - ');
    if (!startTime || !endTime) return 0;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    return (endHour + endMin / 60) - (startHour + startMin / 60);
  },

  /**
   * Generic email sender
   */
  async sendEmail(options: EmailOptions) {
    try {
      const sendGridApiKey = process.env.SENDGRID_API_KEY;
      const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
      const fromName = process.env.SMTP_FROM_NAME || 'Portal Modelo Capoeira';

      if (sendGridApiKey && fromEmail) {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sendGridApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: options.to }] }],
            from: { email: fromEmail, name: fromName },
            subject: options.subject,
            content: [
              { type: 'text/plain', value: options.text || '' },
              { type: 'text/html', value: options.html }
            ]
          })
        });

        if (!response.ok) {
          const details = await response.text();
          throw new Error(`SendGrid API ${response.status}: ${details}`);
        }

        return { success: true, message: 'Email accepted by SendGrid' };
      }

      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Email service not configured. Skipping email:', options.to);
        return { success: false, message: 'Email service not configured' };
      }

      const info = await transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });

      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
};
