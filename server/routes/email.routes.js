const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const multer = require("multer");

// Multer memory storage for email file attachments (e.g. Media Kit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Zoho Mail Transporter Configuration
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const LOGO_URL = "https://i.ibb.co/3Y72vJGW/logo-3.png";

// ------------------------------------
// Helper 1: Customer Facing Template
// ------------------------------------
const renderCustomerTemplate = ({ title, greetingName, heroMessage, detailsHeader, detailsRows }) => {
  const currentYear = new Date().getFullYear();
  const rowsHtml = detailsRows
    .map(
      (row) => `
      <tr>
        <td style="padding: 10px 0; font-weight: bold; color: #16406f; width: 40%; border-bottom: 1px solid #edf2f7; vertical-align: top;">
          ${row.label}:
        </td>
        <td style="padding: 10px 0; color: #333333; border-bottom: 1px solid #edf2f7; line-height: 1.4;">
          ${row.value || "Not specified"}
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f6f9; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border-collapse: separate; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
              <tr>
                <td style="background-color: #0f2d52; padding: 25px 30px; text-align: center; border-bottom: 4px solid #d4af37;">
                  <img src="${LOGO_URL}" alt="Tripist Holidays" width="180" style="max-width: 180px; width: 180px; height: auto; display: block; margin: 0 auto; border: 0;" />
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 30px 20px 30px; text-align: left;">
                  <h2 style="color: #0f2d52; margin: 0 0 10px 0; font-size: 22px; font-weight: bold;">${title}</h2>
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0;">
                    Hi <strong>${greetingName}</strong>,<br/><br/>
                    ${heroMessage}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #d4af37; border-radius: 6px; padding: 20px;">
                    <tr>
                      <td>
                        <h3 style="color: #0f2d52; margin: 0 0 15px 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">${detailsHeader}</h3>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 14px; color: #333333;">${rowsHtml}</table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="background-color: #0f2d52; padding: 20px 30px; text-align: center; color: #ffffff; font-size: 13px;">
                  <p style="margin: 0 0 5px 0; font-weight: bold; color: #d4af37;">Tripist Holidays</p>
                  <p style="margin: 0 0 10px 0; color: #cccccc; font-size: 12px;">Flat No 2, Plot No. 1051, I Block, 35th Street, Anna Nagar, Chennai, Tamil Nadu - 600040, India </p>
                  <p style="margin: 0; color: #88a3c3; font-size: 11px;">© ${currentYear} Tripist Holidays. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// ------------------------------------
// Helper 2: Admin Facing Alert Template
// ------------------------------------
const renderAdminTemplate = ({ alertHeadline, summaryMessage, detailsRows }) => {
  const rowsHtml = detailsRows
    .map(
      (row) => `
      <tr>
        <td style="padding: 10px; font-weight: bold; color: #0f2d52; width: 35%; border-bottom: 1px solid #edf2f7; background-color: #f8fafc; vertical-align: top;">
          ${row.label}
        </td>
        <td style="padding: 10px; color: #333333; border-bottom: 1px solid #edf2f7; line-height: 1.4;">
          ${row.value || "N/A"}
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 20px; background-color: #f4f6f9; font-family: Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <tr>
          <td style="background-color: #0f2d52; padding: 18px 20px; text-align: left; border-bottom: 3px solid #d4af37;">
            <h3 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold;">🚨 ${alertHeadline}</h3>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px;">
            <p style="color: #0f2d52; font-size: 16px; font-weight: bold; margin-top: 0; margin-bottom: 15px;">
              ${summaryMessage}
            </p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 14px; border: 1px solid #edf2f7; border-collapse: collapse;">
              ${rowsHtml}
            </table>
            <p style="color: #666666; font-size: 13px; margin-bottom: 0; margin-top: 20px;">
              ⚡ Please review and follow up with the applicant promptly.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// ------------------------------------
// 1. Contact / Holiday Enquiry Form
// ------------------------------------
router.post("/contact", async (req, res) => {
  const {
    fullName,
    email,
    mobile,
    country,
    city,
    destination,
    travelType,
    travelDate,
    adults,
    children,
    budget,
    services,
    message,
  } = req.body;

  if (!fullName || !email || !mobile) {
    return res.status(400).json({ error: "Full Name, email, and mobile number are required." });
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const formattedServices = Array.isArray(services) && services.length > 0 ? services.join(", ") : "None";
    const travellersText = `${adults || 1} Adult(s)${children ? `, ${children} Child(ren)` : ""}`;

    const detailsRows = [
      { label: "Customer Name", value: fullName },
      { label: "Email", value: email },
      { label: "Mobile / Phone", value: mobile },
      { label: "Location", value: [city, country].filter(Boolean).join(", ") },
      { label: "Destination", value: destination },
      { label: "Travel Type", value: travelType },
      { label: "Tentative Date", value: travelDate },
      { label: "Travellers", value: travellersText },
      { label: "Budget", value: budget },
      { label: "Services Requested", value: formattedServices },
      { label: "Special Requirements", value: message },
    ];

    // Customer Auto-reply
    const customerMail = {
      from: `"Tripist Holidays" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your Travel Enquiry: ${destination || "Getaway"} - Tripist Holidays`,
      html: renderCustomerTemplate({
        title: "Your Travel Enquiry is Confirmed!",
        greetingName: fullName,
        heroMessage:
          "Thank you for getting in touch with <strong>Tripist Holidays</strong>! Our dedicated travel specialists have received your itinerary request and are currently preparing the best quotes and travel plan for you. We will contact you within 24 hours.",
        detailsHeader: "Trip Enquiry Summary",
        detailsRows,
      }),
    };

    // Admin Alert
    const destText = destination ? `to ${destination}` : "";
    const adminMail = {
      from: `"Tripist Website" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `[New Trip Enquiry] ${fullName} ${destText}`,
      html: renderAdminTemplate({
        alertHeadline: "New Customer Trip Enquiry",
        summaryMessage: `${fullName} has submitted an enquiry for a travel package ${destText}.`,
        detailsRows,
      }),
    };

    await Promise.all([transporter.sendMail(customerMail), transporter.sendMail(adminMail)]);
    return res.status(200).json({ success: true, message: "Enquiry submitted successfully." });
  } catch (error) {
    console.error("Contact Email Error:", error);
    return res.status(500).json({ error: "Failed to send enquiry. Please try again later." });
  }
});

// ------------------------------------
// 2. Become a Partner Form
// ------------------------------------
router.post("/partner", async (req, res) => {
  const {
    companyName,
    businessType,
    country,
    state,
    city,
    website,
    contactPerson,
    designation,
    email,
    phone,
    services,
    destinations,
    yearsInBusiness,
    certifications,
    additionalInfo,
  } = req.body;

  if (!companyName || !contactPerson || !email || !phone) {
    return res.status(400).json({ error: "Company Name, Contact Person, Email, and Phone are required." });
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const locationText = [city, state, country].filter(Boolean).join(", ");

    const detailsRows = [
      { label: "Company Name", value: companyName },
      { label: "Business Type", value: businessType },
      { label: "Contact Person", value: `${contactPerson} ${designation ? `(${designation})` : ""}` },
      { label: "Email", value: email },
      { label: "Phone", value: phone },
      { label: "Location", value: locationText },
      { label: "Website", value: website },
      { label: "Services Offered", value: services },
      { label: "Destinations Covered", value: destinations },
      { label: "Years in Business", value: yearsInBusiness },
      { label: "Certifications", value: certifications },
      { label: "Additional Info", value: additionalInfo },
    ];

    // Partner Auto-reply
    const partnerMail = {
      from: `"Tripist B2B Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Partnership Application: ${companyName} - Tripist Holidays`,
      html: renderCustomerTemplate({
        title: "B2B Partnership Application Received",
        greetingName: contactPerson,
        heroMessage: `Thank you for your interest in partnering with <strong>Tripist Holidays</strong>! We have received the partnership application for <strong>${companyName}</strong>. Our business development team is evaluating your profile and will be in touch within 48 hours.`,
        detailsHeader: "Registered Partnership Details",
        detailsRows,
      }),
    };

    // Admin Alert
    const adminMail = {
      from: `"Tripist B2B Alert" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `[New Partner Application] ${contactPerson} (${companyName})`,
      html: renderAdminTemplate({
        alertHeadline: "New B2B Partner Registration",
        summaryMessage: `${contactPerson} has submitted a partnership registration for ${companyName}.`,
        detailsRows,
      }),
    };

    await Promise.all([transporter.sendMail(partnerMail), transporter.sendMail(adminMail)]);
    return res.status(200).json({ success: true, message: "Partnership application sent." });
  } catch (error) {
    console.error("Partner Email Error:", error);
    return res.status(500).json({ error: "Failed to send application. Please try again." });
  }
});

// ------------------------------------
// 3. Creator Program Form
// ------------------------------------
router.post("/creator", upload.single("mediaKit"), async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobile,
      country,
      city,
      creatorName,
      primaryCategory,
      instagram,
      youtube,
      facebook,
      blog,
      linkedin,
      portfolio,
      audienceCountry,
      followers,
      monthlyReach,
      engagementRate,
      expertise,
      interests,
      about,
    } = req.body;

    if (!fullName || !email || !mobile) {
      return res.status(400).json({ error: "Full Name, Email, and Mobile are required." });
    }

    const parseList = (val) => {
      if (!val) return "None";
      if (Array.isArray(val)) return val.join(", ");
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed.join(", ") : val;
      } catch {
        return val;
      }
    };

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    const detailsRows = [
      { label: "Creator Name / Brand", value: `${fullName} ${creatorName ? `(@${creatorName})` : ""}` },
      { label: "Email", value: email },
      { label: "Mobile", value: mobile },
      { label: "Location", value: [city, country].filter(Boolean).join(", ") },
      { label: "Primary Category", value: primaryCategory },
      { label: "Socials", value: [instagram, youtube, facebook, blog, linkedin, portfolio].filter(Boolean).join(" | ") || "None" },
      { label: "Audience Stats", value: `${followers || '0'} followers | ${monthlyReach || '0'} reach | ${engagementRate || 'N/A'} engagement (${audienceCountry || 'N/A'})` },
      { label: "Expertise", value: parseList(expertise) },
      { label: "Collaboration Interests", value: parseList(interests) },
      { label: "Pitch / About", value: about },
      { label: "Media Kit Attached", value: req.file ? req.file.originalname : "No file attached" }
    ];

    // Creator Auto-reply
    const creatorMail = {
      from: `"Tripist Creator Network" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Creator Application Received - Welcome ${fullName}!`,
      html: renderCustomerTemplate({
        title: "Welcome to the Tripist Creator Program Application",
        greetingName: fullName,
        heroMessage:
          "Thank you for applying to the <strong>Tripist Creator Network</strong>! We love working with storytellers, photographers, and travel creators. Our influencer marketing team will review your portfolio and reach out regarding upcoming campaigns and FAM trips.",
        detailsHeader: "Your Application Overview",
        detailsRows,
      }),
    };

    // Admin Alert with optional Media Kit Attachment
    const attachments = req.file
      ? [
          {
            filename: req.file.originalname,
            content: req.file.buffer,
            contentType: req.file.mimetype,
          },
        ]
      : [];

    const adminMail = {
      from: `"Tripist Creator Alert" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `[New Creator Application] ${fullName} (${primaryCategory || "Travel Creator"})`,
      html: renderAdminTemplate({
        alertHeadline: "New Creator Collaboration Request",
        summaryMessage: `${fullName} has applied to join the Tripist Creator Program.`,
        detailsRows,
      }),
      attachments,
    };

    await Promise.all([transporter.sendMail(creatorMail), transporter.sendMail(adminMail)]);
    return res.status(200).json({ success: true, message: "Application submitted successfully." });
  } catch (error) {
    console.error("Creator Email Error:", error);
    return res.status(500).json({ error: "Failed to submit creator application." });
  }
});

module.exports = router;