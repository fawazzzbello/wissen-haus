# Phase 5: Email Automation & SMTP Integration

Complete email automation system with templates, queue management, and customer support.

## Overview

Phase 5 adds:
- SMTP email service (Gmail, SendGrid, custom servers)
- Email queue system with retries (using Bull + Redis)
- Email templates with variable substitution
- Email campaigns and tracking
- Customer support ticketing system
- Automated email workflows

## Database Schema

### New Tables

#### `email_templates`
Stores reusable email templates with variable placeholders.

```sql
- id (UUID, PK)
- name (VARCHAR, unique) - Template identifier
- subject (VARCHAR) - Email subject with variables
- html_template (TEXT) - HTML content with {variable} placeholders
- text_template (TEXT) - Plain text fallback
- template_variables (TEXT[]) - Array of variable names
- description (TEXT)
- category (VARCHAR) - 'transaction', 'campaign', 'notification', 'system'
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### `email_queue`
Tracks all emails in the queue for delivery and retry.

```sql
- id (UUID, PK)
- recipient_email, recipient_name (VARCHAR)
- subject (VARCHAR)
- html_content, text_content (TEXT)
- template_id (FK to email_templates)
- template_variables (JSONB)
- status (VARCHAR) - 'pending', 'processing', 'sent', 'failed', 'bounced'
- priority (INTEGER) - 1=highest, 10=lowest
- attempt_count, max_attempts (INTEGER)
- last_error (TEXT)
- sent_at (TIMESTAMP)
- scheduled_for (TIMESTAMP) - For scheduled emails
- metadata (JSONB)
- created_at, updated_at (TIMESTAMP)
```

#### `email_campaigns`
Manages email campaigns (bulk sends).

```sql
- id (UUID, PK)
- name, description (VARCHAR, TEXT)
- template_id (FK)
- recipient_segment (VARCHAR) - 'all', 'monthly_donors', 'inactive', 'major_donors'
- scheduled_for (TIMESTAMP)
- status (VARCHAR) - 'draft', 'scheduled', 'sending', 'sent', 'paused'
- total_recipients, sent_count, failed_count (INTEGER)
- opened_count, clicked_count (INTEGER)
- started_at, completed_at (TIMESTAMP)
- metadata (JSONB)
- created_at, updated_at (TIMESTAMP)
```

#### `email_tracking`
Tracks email opens and clicks for analytics.

```sql
- id (UUID, PK)
- email_queue_id (FK), campaign_id (FK)
- opened, clicked (BOOLEAN)
- opened_at, clicked_at (TIMESTAMP)
- click_url (VARCHAR)
- user_agent, ip_address (TEXT, INET)
- created_at, updated_at (TIMESTAMP)
```

#### `support_tickets`
Customer support ticket system.

```sql
- id (UUID, PK)
- ticket_number (VARCHAR, unique)
- donor_id (FK), donor_email (VARCHAR)
- subject, description (VARCHAR, TEXT)
- status (VARCHAR) - 'open', 'in_progress', 'resolved', 'closed'
- priority (VARCHAR) - 'low', 'normal', 'high', 'urgent'
- assigned_to (VARCHAR)
- ai_suggested_response (TEXT) - AI-generated response suggestion
- resolution (TEXT)
- resolved_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

#### `support_messages`
Messages within support tickets.

```sql
- id (UUID, PK)
- ticket_id (FK)
- sender_type (VARCHAR) - 'donor', 'staff', 'system'
- sender_name (VARCHAR)
- message (TEXT)
- attachments (JSONB) - Array of file URLs
- is_internal (BOOLEAN) - Not visible to donor
- created_at (TIMESTAMP)
```

#### `automation_workflows`
Automated email workflows triggered by events.

```sql
- id (UUID, PK)
- name, description (VARCHAR, TEXT)
- trigger_event (VARCHAR) - 'donation_received', 'subscription_created', 'days_since_last_donation'
- trigger_conditions (JSONB)
- template_id (FK)
- delay_hours (INTEGER) - Delay before sending
- is_active (BOOLEAN)
- execution_count (INTEGER)
- created_at, updated_at (TIMESTAMP)
```

#### `workflow_executions`
Log of workflow executions.

```sql
- id (UUID, PK)
- workflow_id (FK), trigger_donor_id (FK)
- email_queue_id (FK)
- status (VARCHAR) - 'pending', 'executed', 'failed', 'skipped'
- error_message (TEXT)
- executed_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

## Services

### SMTPEmailService
Handles SMTP connections and email sending.

**Configuration:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@wissen-haus.org
EMAIL_FROM_NAME=Wissen-Haus
```

**Methods:**
- `sendEmail(options)` - Send single email
- `sendBatch(emails)` - Send multiple emails
- `verify()` - Test SMTP configuration

### EmailTemplateService
Manages email templates and variable substitution.

**Built-in Templates:**
1. **welcome_donor** - Welcome new donors
2. **donation_receipt** - Receipt after donation
3. **subscription_confirmation** - Recurring donation confirmation
4. **monthly_impact_report** - Monthly impact updates
5. **reengagement_campaign** - Win-back inactive donors

**Methods:**
- `getTemplate(name)` - Get template by name
- `renderTemplate(template, variables)` - Render with variables
- `createTemplate(...)` - Create new template
- `listTemplates(category)` - List all templates
- `initializeDefaultTemplates()` - Create built-in templates

**Variable Syntax:**
```html
<h1>Hello {donor_name}!</h1>
<p>Thank you for your {amount} donation.</p>
```

### EmailQueue (Bull)
Asynchronous email queue with retry logic.

**Configuration:**
```env
REDIS_URL=redis://localhost:6379
```

**Features:**
- Automatic retries (default 5 attempts)
- Exponential backoff
- Priority queuing
- Scheduled emails
- Job status tracking
- Webhook logging

**Methods:**
- `addEmail(jobData)` - Queue single email
- `addBatch(jobDataArray)` - Queue multiple emails
- `getStats()` - Queue statistics
- `clearFailed()` - Remove failed jobs
- `cleanOldJobs()` - Clean completed jobs

### EmailService
Unified service combining SMTP + Templates + Queue.

**Methods:**
- `sendTemplatedEmail(options)` - Send with template
- `sendDonationReceipt(options)` - Send receipt
- `sendSubscriptionConfirmation(options)` - Send sub confirmation
- `sendWelcome(email, name)` - Send welcome email
- `sendMonthlyReport(options)` - Send impact report
- `sendReengagementCampaign(...)` - Send re-engagement email
- `sendRawEmail(...)` - Send custom email
- `sendBatch(options[])` - Send bulk emails
- `getQueueStats()` - Get queue statistics

## API Endpoints

All endpoints require admin authentication.

### Sending Emails

#### POST /api/emails/send
Send a custom or templated email.

**Request:**
```json
{
  "to": "donor@example.com",
  "toName": "John Doe",
  "templateName": "donation_receipt",
  "templateVariables": {
    "donor_name": "John",
    "amount": "$100",
    "receipt_id": "RCP-12345",
    "date": "2024-04-10"
  },
  "priority": "high"
}
```

Or send custom:
```json
{
  "to": "donor@example.com",
  "subject": "Custom Message",
  "html": "<p>Hello!</p>",
  "text": "Hello!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emailId": "uuid",
    "recipient": "donor@example.com",
    "status": "queued"
  }
}
```

#### POST /api/emails/send-bulk
Send to multiple recipients.

**Request:**
```json
{
  "emails": [
    {
      "to": "donor1@example.com",
      "toName": "Donor 1",
      "templateName": "monthly_impact_report",
      "templateVariables": { ... }
    },
    {
      "to": "donor2@example.com",
      "toName": "Donor 2",
      "templateName": "monthly_impact_report",
      "templateVariables": { ... }
    }
  ]
}
```

### Template Management

#### GET /api/emails/templates
List all templates.

**Query:**
- `category` (optional) - Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "donation_receipt",
      "subject": "Receipt for your {amount} donation",
      "htmlTemplate": "...",
      "templateVariables": ["donor_name", "amount", "receipt_id", "date"],
      "category": "transaction",
      "isActive": true
    }
  ]
}
```

#### GET /api/emails/templates/:name
Get specific template.

#### POST /api/emails/templates
Create new template.

**Request:**
```json
{
  "name": "custom_campaign",
  "subject": "Special Update",
  "htmlTemplate": "<p>Hello {name}!</p>",
  "textTemplate": "Hello {name}!",
  "templateVariables": ["name"],
  "description": "Custom campaign email",
  "category": "campaign"
}
```

### Queue Management

#### GET /api/emails/queue/stats
Get queue statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "waiting": 15,
    "processing": 2,
    "completed": 342,
    "failed": 3,
    "delayed": 0
  }
}
```

#### POST /api/emails/queue/clear-failed
Clear failed jobs.

#### POST /api/emails/queue/cleanup
Clean old completed jobs (default 24 hours).

**Request:**
```json
{
  "maxAgeHours": 48
}
```

### Testing

#### POST /api/emails/test-smtp
Send test email to admin.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Test email queued",
    "emailId": "uuid",
    "recipient": "admin@wissen-haus.org"
  }
}
```

## Configuration

### SMTP Providers

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

1. Enable 2-factor authentication on your Google account
2. Create App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password as SMTP_PASS

#### SendGrid (via SMTP)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-api-key
```

#### Custom Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
```

### Environment Variables

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password
EMAIL_FROM=noreply@wissen-haus.org
EMAIL_FROM_NAME=Wissen-Haus

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Admin email for test
ADMIN_EMAIL=admin@wissen-haus.org
```

## Built-in Templates

### 1. Welcome Email
```
Name: welcome_donor
Variables: {donor_name}
Category: transaction
```

### 2. Donation Receipt
```
Name: donation_receipt
Variables: {donor_name}, {amount}, {receipt_id}, {date}
Category: transaction
```

### 3. Subscription Confirmation
```
Name: subscription_confirmation
Variables: {donor_name}, {amount}, {frequency}, {next_date}
Category: transaction
```

### 4. Monthly Impact Report
```
Name: monthly_impact_report
Variables: {donor_name}, {impact_metric_1}, {impact_metric_2}, {impact_metric_3}, {report_url}
Category: campaign
```

### 5. Re-engagement Campaign
```
Name: reengagement_campaign
Variables: {donor_name}, {months_since_donation}, {donation_url}
Category: campaign
```

## Usage Examples

### Send Donation Receipt
```typescript
const emailService = getEmailService();
await emailService.sendDonationReceipt({
  to: 'donor@example.com',
  donorName: 'John Doe',
  amount: '$100.00',
  receiptId: 'RCP-2024-001',
  date: '2024-04-10',
});
```

### Send Subscription Confirmation
```typescript
await emailService.sendSubscriptionConfirmation({
  to: 'donor@example.com',
  donorName: 'Jane Smith',
  amount: '$50.00/month',
  frequency: 'monthly',
  nextBillingDate: '2024-05-10',
});
```

### Send Custom Template
```typescript
await emailService.sendTemplatedEmail({
  to: 'donor@example.com',
  templateName: 'monthly_impact_report',
  templateVariables: {
    donor_name: 'John Doe',
    impact_metric_1: '50 students reached',
    impact_metric_2: '$5000 in scholarships',
    impact_metric_3: '10 mentorship hours',
    report_url: 'https://wissen-haus.org/reports/april',
  },
});
```

### Send Bulk Campaign
```typescript
const emailService = getEmailService();
const recipients = await pool.query(
  'SELECT email, first_name FROM donors WHERE total_donated > 0'
);

const emailsToSend = recipients.rows.map(row => ({
  to: row.email,
  toName: row.first_name,
  templateName: 'monthly_impact_report',
  templateVariables: { ... },
}));

await emailService.sendBatch(emailsToSend);
```

## Automated Workflows

Triggers available:
- `donation_received` - After donation
- `subscription_created` - After subscription signup
- `days_since_last_donation` - Inactive X days
- `user_signup` - New donor registration
- `donation_anniversary` - Yearly donation anniversary

Example workflow:
1. Trigger: donation_received
2. Delay: 24 hours
3. Template: monthly_impact_report
4. Recipients: automatic

## Queue Processing

Emails are processed asynchronously:
1. Email added to queue with `pending` status
2. Bull/Redis delivers to worker processes
3. Worker calls SMTP service
4. On success: status = `sent`
5. On failure: retry with exponential backoff
6. After max retries: status = `failed`

## Monitoring

### Queue Stats
```bash
curl -X GET http://localhost:5000/api/emails/queue/stats \
  -H "Authorization: Bearer $TOKEN"
```

Returns:
- waiting: Emails not yet processed
- processing: Emails being sent
- completed: Successfully sent
- failed: Failed after retries
- delayed: Scheduled for later

### Clear Failed
```bash
curl -X POST http://localhost:5000/api/emails/queue/clear-failed \
  -H "Authorization: Bearer $TOKEN"
```

## Testing

### Test SMTP Configuration
```bash
curl -X POST http://localhost:5000/api/emails/test-smtp \
  -H "Authorization: Bearer $TOKEN"
```

### Local Testing with Mailhog
For local development:
```bash
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

Then configure:
```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=test
SMTP_PASS=test
```

View emails at: http://localhost:8025

## Database Migration

```bash
npm run migrate
```

Executes `005_email_automation.sql` which creates:
- email_templates table
- email_queue table
- email_campaigns table
- email_tracking table
- support_tickets table
- support_messages table
- automation_workflows table
- workflow_executions table
- Indexes for performance
- Automatic timestamp triggers

## Integration with Other Phases

**Phase 4 (Payments)**: Send receipts and confirmations after donations
**Phase 3 (AI)**: AI generates email content and response suggestions
**Phase 7 (Security)**: Email tracking respects privacy preferences

## Security Considerations

- SMTP credentials stored in environment variables (never in code)
- No sensitive data in email content logs
- Support tickets marked as internal for staff-only notes
- Unsubscribe links (future enhancement)
- DKIM/SPF configuration recommended
- SSL/TLS encryption for SMTP

## Performance Tuning

- Max concurrent email workers: 10 (configurable)
- Retry strategy: exponential backoff
- Clean old jobs daily (24-hour default)
- Redis persistence for reliability
- Bulk send in batches for large campaigns

## Next Steps

1. Deploy database migration: `npm run migrate`
2. Configure SMTP provider (Gmail/SendGrid/custom)
3. Set environment variables
4. Test SMTP configuration
5. Create custom email templates
6. Set up automated workflows
7. Proceed to Phase 6: Donation Management

