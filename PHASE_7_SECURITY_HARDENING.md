# Phase 7: Security Hardening

Comprehensive security implementation including MFA, encryption, audit logging, and account protection.

## Overview

Phase 7 adds:
- Multi-factor authentication (TOTP/2FA)
- AES-256-GCM encryption for sensitive data
- Comprehensive audit logging
- Account lockout protection
- Login attempt tracking
- Security event detection
- Password history enforcement
- Session security
- Rate limiting

## Security Components

### 1. Multi-Factor Authentication (MFA)

#### TOTP-Based 2FA
- Time-based One-Time Password (RFC 6238)
- Backup codes for account recovery
- QR code generation
- 30-second time window with ±1 step tolerance

**Features:**
- Generate TOTP secret with speakeasy library
- QR code for easy scanning
- 10 backup codes (8 characters each)
- Verify TOTP tokens
- Backup code tracking and consumption

**Storage:**
```
mfa_setup table:
- Encrypted TOTP secret
- Backup codes array
- Enable/disable status
- Timestamp tracking
```

#### Database Updates
```sql
users table additions:
- mfa_enabled (BOOLEAN)
- mfa_verified (BOOLEAN)
- two_factor_backup_used (INTEGER) - Count of used backup codes
```

### 2. Data Encryption

#### AES-256-GCM Encryption
- Military-grade 256-bit symmetric encryption
- Galois/Counter Mode (GCM) for authentication
- Random IV generation
- Auth tag for integrity verification

**Encrypted Fields:**
- MFA secrets
- Sensitive notes
- Personal information (optional)

**Key Management:**
- Environment variable: `ENCRYPTION_KEY`
- Support for key rotation
- Key fingerprinting for tracking

**Encryption Service Methods:**
```typescript
EncryptionService.encrypt(data: string): string
EncryptionService.decrypt(encryptedData: string): string
EncryptionService.hash(data: string, algorithm?: string): string
EncryptionService.generateToken(length?: number): string
EncryptionService.hashToken(token: string): string
EncryptionService.maskSensitiveData(data: any): any
```

### 3. Audit Logging

#### Comprehensive Event Tracking
Logs all sensitive operations with full context.

**Logged Actions:**
- User authentication (success/failure)
- User creation/modification
- Password changes
- MFA enable/disable
- Donation refunds
- Campaign modifications
- Permission changes
- Admin actions

**Audit Fields:**
- User ID
- Action type
- Resource type and ID
- Change summary (masked)
- Success/failure status
- Error messages
- IP address
- User agent
- Custom metadata
- Timestamp

**Audit Retention:**
- 30-day retention policy
- Automatic cleanup of old logs
- Indexed for fast queries

**Audit Queries:**
```typescript
AuditService.log(entry, req?): Promise<string>
AuditService.getAuditLogsForUser(userId, limit?, offset?): Promise<AuditLogs>
AuditService.getAuditLogsForResource(resourceType, resourceId, limit?): Promise<AuditLog[]>
AuditService.getRecentAuditLogs(limit?, offset?): Promise<AuditLogs>
AuditService.searchAuditLogs(action?, resourceType?, status?, startDate?, endDate?, limit?): Promise<AuditLog[]>
```

### 4. Account Security

#### Login Attempt Tracking
- Records all login attempts (success/failure)
- Tracks IP address, user agent, failure reason
- Automatic account lockout after N failed attempts
- Lockout duration: 30 minutes (configurable)

**Tracking Tables:**
- `login_attempts` - All login attempts
- `account_lockouts` - Lockout events
- `security_events` - Suspicious activities

#### Brute Force Protection
```
Triggers on:
- 5 failed attempts within 1 hour
- Multiple IPs attempting same account
- Rapid successive attempts
- Unusual locations

Actions:
- Account lockout
- Security event logging
- Optional email notification
```

#### Account Lockout Policy
```
Trigger Conditions:
- 5 failed login attempts
- Manual admin lockout
- Suspicious activity detected

Duration:
- 30 minutes (automatic unlock)
- Manual unlock by admin
- Reset on successful login
```

#### Password Security
- Password history enforcement (prevent reuse)
- Keep last 5 passwords
- 90-day reuse prevention
- Track password change timestamps

**Methods:**
```typescript
AccountSecurityService.recordLoginAttempt(email, success, reason?, req?)
AccountSecurityService.isAccountLocked(userId): Promise<boolean>
AccountSecurityService.lockAccount(userId, reason, lockedBy?)
AccountSecurityService.unlockAccount(userId, unlockedBy)
AccountSecurityService.detectSuspiciousActivity(userId, email, ip)
AccountSecurityService.getLoginHistory(userId, limit?)
AccountSecurityService.isPasswordRecentlyUsed(userId, hash): Promise<boolean>
AccountSecurityService.addToPasswordHistory(userId, hash)
```

## Database Schema

### New Tables

#### `mfa_setup`
Store MFA configuration for users.

```sql
- id (UUID, PK)
- user_id (UUID FK) - Link to user
- mfa_type (VARCHAR) - 'totp', 'sms', 'email'
- secret (VARCHAR) - Encrypted TOTP secret
- backup_codes (TEXT[]) - Array of backup codes
- enabled (BOOLEAN)
- enabled_at (TIMESTAMP)
- created_at (TIMESTAMP)
- UNIQUE(user_id, mfa_type)
```

#### `login_attempts`
Track all login attempts for security analysis.

```sql
- id (UUID, PK)
- email (VARCHAR)
- ip_address (INET) - IP address of attempt
- success (BOOLEAN)
- failure_reason (VARCHAR) - Reason for failure
- user_agent (TEXT)
- created_at (TIMESTAMP)
```

#### `account_lockouts`
Track account lockout events.

```sql
- id (UUID, PK)
- user_id (UUID FK)
- reason (VARCHAR) - Why account was locked
- locked_until (TIMESTAMP)
- created_by (UUID) - Admin who locked (if manual)
- created_at (TIMESTAMP)
```

#### `audit_logs`
Comprehensive action audit trail.

```sql
- id (UUID, PK)
- user_id (UUID FK)
- action (VARCHAR) - Action type
- resource_type (VARCHAR) - Resource being changed
- resource_id (VARCHAR)
- change_summary (TEXT) - Masked summary
- status (VARCHAR) - 'success', 'failure'
- error_message (TEXT)
- ip_address (INET)
- user_agent (TEXT)
- metadata (JSONB)
- created_at (TIMESTAMP)
```

#### `encryption_keys`
Track encryption key versions for rotation.

```sql
- id (UUID, PK)
- key_version (INTEGER)
- key_fingerprint (VARCHAR)
- is_active (BOOLEAN)
- rotation_scheduled_at (TIMESTAMP)
- rotated_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### `secure_sessions`
Track active user sessions.

```sql
- id (UUID, PK)
- user_id (UUID FK)
- token_hash (VARCHAR) - Hash of session token
- ip_address (INET)
- user_agent (TEXT)
- device_fingerprint (VARCHAR)
- is_active (BOOLEAN)
- last_activity (TIMESTAMP)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### `password_history`
Enforce password history policy.

```sql
- id (UUID, PK)
- user_id (UUID FK)
- password_hash (VARCHAR) - Hash of previous password
- created_at (TIMESTAMP)
```

#### `rate_limit_records`
Track rate limiting per IP/user/key.

```sql
- id (UUID, PK)
- identifier (VARCHAR) - IP, user ID, or API key
- endpoint (VARCHAR)
- limit_type (VARCHAR) - 'ip', 'user', 'api_key'
- requests_count (INTEGER)
- window_start, window_end (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### `security_events`
Track suspicious activities.

```sql
- id (UUID, PK)
- event_type (VARCHAR) - Event type
- severity (VARCHAR) - 'low', 'medium', 'high', 'critical'
- description (TEXT)
- user_id (UUID FK)
- ip_address (INET)
- email (VARCHAR)
- metadata (JSONB)
- action_taken (VARCHAR) - Response taken
- resolved (BOOLEAN)
- created_at (TIMESTAMP)
```

### Enhanced `users` Table

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip INET;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_backup_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS encryption_key_version INTEGER DEFAULT 1;
```

## Services

### EncryptionService
Handle all encryption/decryption operations.

```typescript
// Encrypt/decrypt
encrypt(data: string): string
decrypt(encryptedData: string): string

// Hashing
hash(data: string, algorithm?: string): string

// Token generation
generateToken(length?: number): string
hashToken(token: string): string

// Utilities
generateKeyFingerprint(): string
maskSensitiveData(data: any): any
```

### MFAService
Manage TOTP-based two-factor authentication.

```typescript
// Setup
generateTOTPSecret(userId, email): Promise<{secret, qrCode, backupCodes}>

// Verification
verifyTOTPCode(userId, code): Promise<boolean>
useBackupCode(userId, code): Promise<boolean>

// Management
enableMFA(userId): Promise<void>
disableMFA(userId): Promise<void>
isMFAEnabled(userId): Promise<boolean>
getBackupCodeCount(userId): Promise<number>
```

### AuditService
Log and query all sensitive operations.

```typescript
// Logging
log(entry, req?): Promise<string>
logAuthEvent(userId, email, success, reason?, req?)
logResourceChange(userId, action, resourceType, resourceId, changeSummary, req?)

// Querying
getAuditLogsForUser(userId, limit?, offset?)
getAuditLogsForResource(resourceType, resourceId, limit?)
getRecentAuditLogs(limit?, offset?)
searchAuditLogs(action?, resourceType?, status?, startDate?, endDate?, limit?)
```

### AccountSecurityService
Protect user accounts from unauthorized access.

```typescript
// Login management
recordLoginAttempt(email, success, failureReason?, req?)
getLoginHistory(userId, limit?)

// Account lockout
isAccountLocked(userId): Promise<boolean>
lockAccount(userId, reason, lockedBy?)
unlockAccount(userId, unlockedBy)

// Security monitoring
detectSuspiciousActivity(userId, email, ipAddress): Promise<boolean>
getSecurityEvents(userId, limit?): Promise<SecurityEvent[]>
logSecurityEvent(eventType, severity, description, userId?, ip?, email?)

// Password security
isPasswordRecentlyUsed(userId, hash): Promise<boolean>
addToPasswordHistory(userId, hash)
```

## Usage Examples

### Enable MFA for User
```typescript
import { MFAService } from '@/services/security';

// Generate TOTP secret
const { secret, qrCode, backupCodes } = await MFAService.generateTOTPSecret(
  userId,
  userEmail
);

// Send QR code to frontend
res.json({
  qrCode,
  backupCodes, // Show to user for safe storage
  secret, // For manual entry if QR doesn't work
});

// User scans QR, provides code
const isValid = await MFAService.verifyTOTPCode(userId, userProvidedCode);
if (isValid) {
  await MFAService.enableMFA(userId);
}
```

### Protect Login Endpoint
```typescript
import { AccountSecurityService, AuditService } from '@/services/security';

async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;

  // Check if account is locked
  const user = await findUserByEmail(email);
  if (user && await AccountSecurityService.isAccountLocked(user.id)) {
    return res.status(429).json({
      error: 'Account locked due to too many failed attempts',
    });
  }

  // Verify credentials
  const isValid = await verifyPassword(password, user.password_hash);

  if (!isValid) {
    // Record failed attempt
    await AccountSecurityService.recordLoginAttempt(
      email,
      false,
      'invalid_password',
      req
    );

    // Check for suspicious activity
    const isSuspicious = await AccountSecurityService.detectSuspiciousActivity(
      user.id,
      email,
      getClientIP(req)
    );

    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check MFA
  if (user.mfa_enabled) {
    // Return temporary session requiring MFA verification
    return res.json({
      requiresMFA: true,
      tempToken: generateMFAToken(user.id),
    });
  }

  // Record successful login
  await AccountSecurityService.recordLoginAttempt(email, true, null, req);
  await AuditService.logAuthEvent(user.id, email, true, null, req);

  return res.json({ token: generateAccessToken(user) });
}
```

### Verify MFA Token
```typescript
async function verifyMFAHandler(req: Request, res: Response) {
  const { tempToken, mfaCode, backupCode } = req.body;

  const userId = verifyMFAToken(tempToken);

  // Try TOTP code first
  if (mfaCode) {
    const isValid = await MFAService.verifyTOTPCode(userId, mfaCode);
    if (isValid) {
      const user = await getUserById(userId);
      return res.json({ token: generateAccessToken(user) });
    }
  }

  // Try backup code
  if (backupCode) {
    const isValid = await MFAService.useBackupCode(userId, backupCode);
    if (isValid) {
      const user = await getUserById(userId);
      const remainingCodes = await MFAService.getBackupCodeCount(userId);
      return res.json({
        token: generateAccessToken(user),
        warning: remainingCodes < 2 ? 'Generate new backup codes' : null,
      });
    }
  }

  return res.status(401).json({ error: 'Invalid MFA code' });
}
```

### Audit Trail
```typescript
import { AuditService } from '@/services/security';

// Log a resource change
await AuditService.logResourceChange(
  userId,
  'donation_refunded',
  'donation',
  donationId,
  {
    previousStatus: 'completed',
    newStatus: 'refunded',
    amount: 10000,
  },
  req
);

// Search audit logs
const logs = await AuditService.searchAuditLogs(
  'donation_refunded',
  'donation',
  'success',
  new Date('2024-04-01'),
  new Date('2024-04-30')
);
```

### Password Security
```typescript
import { AccountSecurityService, EncryptionService } from '@/services/security';

async function changePasswordHandler(req: Request, res: Response) {
  const { oldPassword, newPassword } = req.body;

  // Verify old password
  const isValid = await verifyPassword(oldPassword, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid current password' });
  }

  // Check password history
  const newHash = EncryptionService.hashToken(newPassword);
  const isRecentlyUsed = await AccountSecurityService.isPasswordRecentlyUsed(
    userId,
    newHash
  );

  if (isRecentlyUsed) {
    return res.status(400).json({
      error: 'Cannot reuse a recent password',
    });
  }

  // Hash new password with bcrypt
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await pool.query(
    `UPDATE users SET password_hash = $1, password_changed_at = NOW() WHERE id = $2`,
    [hashedPassword, userId]
  );

  // Add to history
  await AccountSecurityService.addToPasswordHistory(userId, newHash);

  // Audit log
  await AuditService.log({
    userId,
    action: 'password_changed',
    resourceType: 'user',
    status: 'success',
  }, req);

  return res.json({ message: 'Password changed successfully' });
}
```

## Environment Variables

```env
# Encryption
ENCRYPTION_KEY=your-256-bit-hex-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Account Security
MAX_FAILED_LOGIN_ATTEMPTS=5
ACCOUNT_LOCKOUT_MINUTES=30
PASSWORD_HISTORY_COUNT=5
PASSWORD_REUSE_DAYS=90

# TOTP
TOTP_WINDOW=1  # Allow ±1 time step
```

## Security Best Practices

### 1. Password Management
- Use bcrypt with salt rounds ≥ 10
- Enforce minimum 12 characters
- Require mixed case, numbers, symbols
- Change password every 90 days
- Prevent reuse of last 5 passwords
- Hash on server-side only

### 2. Authentication
- Require MFA for admin accounts
- Session tokens expire in 1 hour
- Refresh tokens rotate every use
- Store token hash, not token itself
- Invalidate tokens on logout

### 3. Data Protection
- Encrypt sensitive fields at rest
- Use HTTPS/TLS for transport
- No sensitive data in logs
- Mask sensitive data in audit logs
- Separate encryption keys by environment

### 4. Audit Trail
- Log all sensitive operations
- Include full context (IP, user agent, etc.)
- 30-day retention minimum
- Immutable audit records
- Real-time alerts for critical events

### 5. Account Security
- Monitor login patterns
- Rate limit auth endpoints
- Lock accounts after failures
- Track unusual locations
- Notify users of suspicious access

### 6. Key Management
- Store encryption key in environment
- Rotate keys annually
- Track key versions
- Support key rotation without downtime
- Secure key sharing between services

## Monitoring & Alerts

### Critical Events
- Failed login attempts (>3 in 5 min)
- Account lockouts
- Unauthorized API access
- Data access anomalies
- Failed encryption operations
- Backup code exhaustion

### Metrics
- Login success/failure ratio
- Account lockout rate
- MFA adoption percentage
- Audit log volume
- Security events per day

## Performance Considerations

- Encrypt only sensitive fields
- Cache audit log queries (1-minute TTL)
- Batch cleanup of old logs
- Index login_attempts by email
- Index security_events by severity
- Connection pooling for database

## Database Migration

```bash
npm run migrate
```

Executes `007_security_hardening.sql` which creates:
- mfa_setup table
- login_attempts table
- account_lockouts table
- audit_logs table
- encryption_keys table
- secure_sessions table
- password_history table
- rate_limit_records table
- security_events table
- Indexes for performance
- Helper functions

## Integration with Other Phases

**Phase 4 (Payments)**: Audit donation transactions
**Phase 5 (Email)**: Log email sending and failures
**Phase 6 (Donations)**: Audit campaign and report generation
**Phase 8 (Performance)**: Cache audit log queries

## Next Steps

1. Run database migration: `npm run migrate`
2. Generate `ENCRYPTION_KEY` and add to `.env`
3. Install MFA dependencies:
   ```bash
   npm install speakeasy qrcode
   ```
4. Create MFA endpoints in auth routes
5. Enable MFA for admin accounts
6. Set up monitoring for security events
7. Configure email alerts for critical events
8. Proceed to Phase 8: Production Optimization
