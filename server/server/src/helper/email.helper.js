const sesClient = require("../config/SESClient");
const { SendEmailCommand } = require("@aws-sdk/client-ses"); // Your existing SES client
const { SES_SENDER_EMAIL } = require("../constants");
const { logger } = require("../utils/logger");

/**
 * Send email using AWS SES
 * @param {Object} emailData - Email configuration object
 * @param {string|string[]} emailData.to - Recipient email(s)
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.html - HTML content (required)
 * @param {string} [emailData.text] - Plain text content (optional, will be auto-generated from HTML if not provided)
 * @param {string} [emailData.from] - Sender email (optional, uses default from env)
 * @param {string[]} [emailData.cc] - CC recipients (optional)
 * @param {string[]} [emailData.bcc] - BCC recipients (optional)
 * @param {string[]} [emailData.replyTo] - Reply-to addresses (optional)
 * @returns {Promise<Object>} SES response object with MessageId
 */
async function sendEmail(emailData) {
  // Validate required fields
  if (!emailData.to) {
    throw new Error("Recipient email (to) is required");
  }
  if (!emailData.subject) {
    throw new Error("Email subject is required");
  }
  if (!emailData.html) {
    throw new Error("Email HTML content is required");
  }

  // Convert single recipient to array
  const recipients = Array.isArray(emailData.to)
    ? emailData.to
    : [emailData.to];

  // Auto-generate plain text from HTML if not provided
  const textContent = emailData.text || stripHtmlTags(emailData.html);

  // Build SES parameters
  const params = {
    Source: emailData.from || SES_SENDER_EMAIL,
    Destination: {
      ToAddresses: recipients,
      ...(emailData.cc && { CcAddresses: emailData.cc }),
      ...(emailData.bcc && { BccAddresses: emailData.bcc }),
    },
    Message: {
      Subject: {
        Data: emailData.subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: emailData.html,
          Charset: "UTF-8",
        },
        Text: {
          Data: textContent,
          Charset: "UTF-8",
        },
      },
    },
    ...(emailData.replyTo && { ReplyToAddresses: emailData.replyTo }),
  };

  try {
    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);

    logger.info(
      `Email sent successfully to ${recipients.join(", ")} - MessageId: ${
        result.MessageId
      }`
    );
    return {
      success: true,
      messageId: result.MessageId,
      recipients: recipients,
    };
  } catch (error) {
    logger.error("Error sending email:", {
      error: error.message,
      recipients: recipients,
      subject: emailData.subject,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Strip HTML tags and convert to plain text
 * @param {string} html - HTML content
 * @returns {string} Plain text content
 */
function stripHtmlTags(html) {
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
    .replace(/&amp;/g, "&") // Replace &amp; with &
    .replace(/&lt;/g, "<") // Replace &lt; with <
    .replace(/&gt;/g, ">") // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace
}

module.exports = {
  sendEmail,
  stripHtmlTags,
};
