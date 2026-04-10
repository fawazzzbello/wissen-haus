# Phase 6: Donation Management System

Complete donation campaign management, donor relationship tracking, and batch reporting system.

## Overview

Phase 6 adds:
- Campaign management with goal tracking and milestones
- Campaign donation attribution and progress tracking
- Donor relationship management (preferences, notes, follow-ups)
- Batch reporting (daily, weekly, monthly, quarterly, annual)
- Automatic campaign total updates via database triggers
- Milestone progress tracking with rewards

## Database Schema

### New Tables

#### `donation_campaigns`
Manages fundraising campaigns with goals and tracking.

```sql
- id (UUID, PK)
- name (VARCHAR) - Campaign name
- description (TEXT)
- goal_amount_cents (BIGINT) - Target goal in cents
- current_amount_cents (BIGINT DEFAULT 0) - Current raised amount
- status (VARCHAR) - 'draft', 'active', 'paused', 'closed', 'archived'
- campaign_type (VARCHAR) - 'general', 'emergency', 'specific_project', 'recurring'
- start_date, end_date (TIMESTAMP)
- target_donors (INTEGER) - Goal number of donors
- current_donor_count (INTEGER DEFAULT 0) - Current unique donors
- image_url (VARCHAR)
- impact_statement (TEXT) - Why this campaign matters
- metadata (JSONB) - Custom campaign data
- created_by (UUID) - Admin user ID
- created_at, updated_at (TIMESTAMP)
```

#### `campaign_milestones`
Track progress milestones within campaigns.

```sql
- id (UUID, PK)
- campaign_id (UUID FK) - Parent campaign
- milestone_number (INTEGER)
- target_amount_cents (BIGINT) - Amount needed for this milestone
- current_amount_cents (BIGINT DEFAULT 0) - Current milestone progress
- description (TEXT)
- reward_description (TEXT) - What donors get at this milestone
- achieved_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### `donor_preferences`
Store donor communication preferences.

```sql
- id (UUID, PK)
- donor_id (UUID FK UNIQUE) - Link to donor
- communication_frequency (VARCHAR) - 'weekly', 'monthly', 'quarterly', 'never'
- prefers_email (BOOLEAN DEFAULT TRUE)
- prefers_phone (BOOLEAN DEFAULT FALSE)
- prefers_sms (BOOLEAN DEFAULT FALSE)
- anonymous_donation (BOOLEAN DEFAULT FALSE)
- receive_impact_reports (BOOLEAN DEFAULT TRUE)
- receive_newsletters (BOOLEAN DEFAULT TRUE)
- receive_event_invitations (BOOLEAN DEFAULT TRUE)
- marketing_consent (BOOLEAN DEFAULT TRUE)
- unsubscribe_date (TIMESTAMP)
- metadata (JSONB)
- created_at, updated_at (TIMESTAMP)
```

#### `donor_notes`
Internal staff notes on donors.

```sql
- id (UUID, PK)
- donor_id (UUID FK) - Link to donor
- note_type (VARCHAR) - 'internal', 'follow_up', 'thank_you', 'issue', 'other'
- content (TEXT)
- created_by (UUID) - Staff member who created note
- is_internal (BOOLEAN DEFAULT TRUE) - Not visible to donor
- follow_up_date (TIMESTAMP) - When to follow up
- created_at (TIMESTAMP)
```

#### `batch_reports`
Generated batch reports for analysis.

```sql
- id (UUID, PK)
- report_type (VARCHAR) - 'daily', 'weekly', 'monthly', 'quarterly', 'annual'
- period_start, period_end (TIMESTAMP)
- total_donations (BIGINT) - Count of donations
- total_amount_cents (BIGINT) - Total donated in period
- donor_count (INTEGER) - Unique donors
- new_donors (INTEGER) - New donors in period
- recurring_donors (INTEGER) - Donors on recurring donations
- average_donation_cents (BIGINT)
- largest_donation_cents (BIGINT)
- top_campaign_id (UUID FK)
- top_campaign_amount_cents (BIGINT)
- summary_data (JSONB) - Detailed metrics
- generated_by (UUID) - Admin who generated report
- created_at (TIMESTAMP)
```

#### `batch_processing_logs`
Track batch job execution.

```sql
- id (UUID, PK)
- batch_type (VARCHAR) - 'thank_you_emails', 'reports', 'tax_letters', 'reconciliation'
- status (VARCHAR) - 'pending', 'processing', 'completed', 'failed'
- total_items, processed_items, failed_items (INTEGER)
- error_message (TEXT)
- started_at, completed_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### Enhanced `donations` Table

```sql
ALTER TABLE donations ADD COLUMN IF NOT EXISTS campaign_id UUID;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS donation_source VARCHAR(50);
ALTER TABLE donations ADD COLUMN IF NOT EXISTS donor_name_at_time VARCHAR(255);
ALTER TABLE donations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS impact_message TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS tax_deductible BOOLEAN DEFAULT TRUE;
```

## Services

### DonationManagementService
Handles all campaign, donor, and report operations.

**Location:** `apps/api/src/services/donation/donationManagementService.ts`

**Methods:**

#### Campaign Management
- `createCampaign(options)` - Create new campaign
- `getCampaignStats(campaignId)` - Get campaign progress
- `listCampaigns(status?)` - List campaigns with optional filtering
- `getCampaignDonations(campaignId)` - Get donations for campaign
- `addDonationToCampaign(donationId, campaignId)` - Link donation to campaign
- `createMilestone(campaignId, number, amount, description, reward)` - Create milestone

#### Donor Management
- `getDonorPreferences(donorId)` - Get donor preferences
- `updateDonorPreferences(donorId, preferences)` - Update preferences
- `addDonorNote(donorId, content, createdBy, noteType, followUpDate)` - Add staff note
- `getDonorNotes(donorId)` - Retrieve all notes for donor

#### Reporting
- `generateBatchReport(reportType, periodStart, periodEnd, generatedBy)` - Generate report
- `getBatchReport(reportId)` - Retrieve generated report

## API Endpoints

All endpoints require authentication. Campaign management endpoints require admin role.

### Campaign Management

#### POST /api/donations/campaigns/create
Create a new campaign.

**Request:**
```json
{
  "name": "Emergency Relief Fund",
  "description": "Help families affected by recent flooding",
  "goalAmountCents": 50000000,
  "campaignType": "emergency",
  "startDate": "2024-04-10T00:00:00Z",
  "endDate": "2024-05-10T00:00:00Z",
  "targetDonors": 500,
  "impactStatement": "Every $100 provides emergency supplies for one family"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "campaignId": "uuid",
    "message": "Campaign created successfully"
  }
}
```

#### GET /api/donations/campaigns/list
List all campaigns.

**Query:**
- `status` (optional) - Filter by status: 'draft', 'active', 'paused', 'closed', 'archived'

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Emergency Relief Fund",
      "status": "active",
      "goalAmount": 50000000,
      "raisedAmount": 15000000,
      "progressPercentage": 30,
      "donorCount": 150,
      "averageDonation": 100000,
      "daysRemaining": 20
    }
  ]
}
```

#### GET /api/donations/campaigns/:id/stats
Get campaign statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Emergency Relief Fund",
    "status": "active",
    "goalAmount": 50000000,
    "raisedAmount": 15000000,
    "progressPercentage": 30,
    "donorCount": 150,
    "averageDonation": 100000,
    "daysRemaining": 20
  }
}
```

#### GET /api/donations/campaigns/:campaignId/donations
Get all donations for a campaign.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "donorId": "uuid",
      "amountCents": 10000,
      "campaignId": "uuid",
      "campaignName": "Emergency Relief Fund",
      "donationSource": "website",
      "donorNameAtTime": "John Doe",
      "status": "completed",
      "createdAt": "2024-04-10T15:30:00Z",
      "impactMessage": "Thank you for your support"
    }
  ]
}
```

#### POST /api/donations/campaigns/link-donation
Link a donation to a campaign.

**Request:**
```json
{
  "donationId": "uuid",
  "campaignId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation linked to campaign"
}
```

#### POST /api/donations/campaigns/milestones/create
Create a campaign milestone.

**Request:**
```json
{
  "campaignId": "uuid",
  "milestoneNumber": 1,
  "targetAmountCents": 10000000,
  "description": "Reach $100,000 raised",
  "rewardDescription": "Milestone reached! Sponsor a project update video"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "milestoneId": "uuid",
    "message": "Milestone created successfully"
  }
}
```

### Donor Relationship Management

#### GET /api/donations/donors/:donorId/preferences
Get donor communication preferences.

**Response:**
```json
{
  "success": true,
  "data": {
    "donorId": "uuid",
    "communicationFrequency": "monthly",
    "prefersEmail": true,
    "prefersPhone": false,
    "prefersSms": false,
    "anonymousDonation": false,
    "receiveImpactReports": true,
    "receiveNewsletters": true,
    "receiveEventInvitations": true,
    "marketingConsent": true
  }
}
```

#### PUT /api/donations/donors/:donorId/preferences
Update donor preferences.

**Request:**
```json
{
  "communicationFrequency": "quarterly",
  "prefersEmail": true,
  "prefersPhone": false,
  "receiveNewsletters": false,
  "marketingConsent": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donor preferences updated successfully"
}
```

#### POST /api/donations/donors/:donorId/notes
Add a note for a donor (admin only).

**Request:**
```json
{
  "content": "Interested in monthly giving. Will follow up next week.",
  "noteType": "follow_up",
  "followUpDate": "2024-04-17T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "noteId": "uuid",
    "message": "Donor note added successfully"
  }
}
```

#### GET /api/donations/donors/:donorId/notes
Get all notes for a donor (admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "donorId": "uuid",
      "noteType": "follow_up",
      "content": "Interested in monthly giving. Will follow up next week.",
      "createdBy": "uuid",
      "isInternal": true,
      "followUpDate": "2024-04-17T10:00:00Z",
      "createdAt": "2024-04-10T15:30:00Z"
    }
  ]
}
```

### Batch Reporting

#### POST /api/donations/reports/batch
Generate a batch report (admin only).

**Request:**
```json
{
  "reportType": "monthly",
  "periodStart": "2024-04-01T00:00:00Z",
  "periodEnd": "2024-04-30T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "uuid",
    "message": "Batch report generated successfully"
  }
}
```

#### GET /api/donations/reports/:reportId
Get a generated batch report (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reportType": "monthly",
    "periodStart": "2024-04-01T00:00:00Z",
    "periodEnd": "2024-04-30T23:59:59Z",
    "totalDonations": 1250,
    "totalAmountCents": 125000000,
    "donorCount": 450,
    "newDonors": 75,
    "recurringDonors": 120,
    "averageDonationCents": 100000,
    "largestDonationCents": 5000000,
    "topCampaignId": "uuid",
    "topCampaignAmountCents": 50000000,
    "generatedBy": "uuid",
    "createdAt": "2024-05-01T10:30:00Z"
  }
}
```

## Campaign Types

### 1. General Fundraising
For ongoing operational funding of the charity.

**Use Case:** "Support our mission"
**Duration:** Ongoing or annual
**Target:** Recurring donors

### 2. Emergency Relief
Time-sensitive campaigns for urgent needs.

**Use Case:** "Natural disaster relief"
**Duration:** 1-2 months (urgent)
**Target:** Rapid donor mobilization

### 3. Specific Project
Funding for particular initiatives.

**Use Case:** "Build 5 schools in rural areas"
**Duration:** 3-6 months
**Target:** Project-focused donors
**Milestones:** Track per-school progress

### 4. Recurring Support
Monthly or regular giving programs.

**Use Case:** "Become a monthly sustainer"
**Duration:** Ongoing
**Target:** Long-term committed donors

## Donor Preferences

Donors can customize their communication:

- **Frequency:** Weekly, monthly, quarterly, never
- **Channels:** Email, phone, SMS
- **Content:** Impact reports, newsletters, event invitations
- **Privacy:** Anonymous donations option
- **Marketing:** Opt-in/out of marketing messages
- **Opt-out:** Unsubscribe date tracking

## Batch Reports

### Report Types

- **Daily:** Previous 24 hours
- **Weekly:** Previous 7 days
- **Monthly:** Calendar month
- **Quarterly:** 3-month period
- **Annual:** Calendar year

### Metrics Included

- Total donations received
- Total amount raised
- Unique donor count
- New donors acquired
- Recurring donors count
- Average donation amount
- Largest donation amount
- Top-performing campaign
- Summary data as JSON

## Database Triggers

### Automatic Campaign Totals
When a donation is completed and linked to a campaign:
- `current_amount_cents` updates automatically
- `current_donor_count` recalculates distinct donor count

### Milestone Progress
When donations are added or updated:
- `campaign_milestones.current_amount_cents` updates
- Completion status tracked

## Usage Examples

### Create a Campaign
```typescript
const donationService = getDonationManagementService();

const campaignId = await donationService.createCampaign({
  name: 'Back to School Initiative',
  description: 'Help underprivileged students prepare for school',
  goalAmountCents: 100000000, // $1,000,000
  campaignType: 'specific_project',
  startDate: new Date('2024-08-01'),
  endDate: new Date('2024-08-31'),
  targetDonors: 1000,
  impactStatement: 'Each $100 provides school supplies for one student',
  createdBy: adminUserId,
});
```

### Get Campaign Progress
```typescript
const stats = await donationService.getCampaignStats(campaignId);
console.log(`Progress: ${stats.progressPercentage}% (${stats.raisedAmount}/${stats.goalAmount})`);
```

### Link Donation to Campaign
```typescript
await donationService.addDonationToCampaign(donationId, campaignId);
```

### Create Milestone
```typescript
const milestoneId = await donationService.createMilestone(
  campaignId,
  1,
  50000000, // $500,000
  'First half of goal',
  'Recognition as Major Campaign Supporter'
);
```

### Update Donor Preferences
```typescript
await donationService.updateDonorPreferences(donorId, {
  communicationFrequency: 'monthly',
  prefersEmail: true,
  prefersPhone: false,
  receiveImpactReports: true,
  marketingConsent: false,
});
```

### Add Donor Note
```typescript
const noteId = await donationService.addDonorNote(
  donorId,
  'Major donor - approached about planned giving',
  adminUserId,
  'follow_up',
  new Date('2024-04-17')
);
```

### Generate Monthly Report
```typescript
const reportId = await donationService.generateBatchReport(
  'monthly',
  new Date('2024-04-01'),
  new Date('2024-04-30'),
  adminUserId
);

const report = await donationService.getBatchReport(reportId);
console.log(`April Donations: $${(report.totalAmountCents / 100).toFixed(2)}`);
```

## Integration with Other Phases

**Phase 4 (Payments):** Donations automatically tracked and linked to campaigns
**Phase 5 (Email):** Send impact reports to donors based on preferences
**Phase 7 (Security):** Encrypt sensitive donor notes
**Phase 8 (Performance):** Cache campaign statistics for high-traffic dashboard

## Security Considerations

- Admin-only endpoints for campaign creation and management
- Donor notes marked as internal (not visible to donors)
- Respect donor preferences for communications
- Audit trail of who created notes and reports
- Tax-deductible flag for compliance
- No sensitive data in logs or reports

## Performance Features

- Indexes on campaign status, creation date, campaign ID
- Triggers update aggregates instead of recalculating
- Batch report generation for scheduled jobs
- Milestone progress cached in database

## Database Migration

```bash
npm run migrate
```

Executes `006_donation_management.sql` which creates:
- donation_campaigns table
- campaign_milestones table
- donor_preferences table
- donor_notes table
- batch_reports table
- batch_processing_logs table
- Enhanced donations table
- Indexes for performance
- Automatic update triggers

## Next Steps

1. Run database migration: `npm run migrate`
2. Create campaigns through API
3. Link donations to campaigns
4. Set up donor preferences
5. Create milestones for major campaigns
6. Generate batch reports for analysis
7. Proceed to Phase 7: Security Hardening
