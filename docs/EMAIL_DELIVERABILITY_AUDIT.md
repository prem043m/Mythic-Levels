# Gmail SMTP Deliverability Audit

## Scope inspected

- [.env](../.env) (active config, sanitized)
- [.env.example](../.env.example)
- [server/mailer.js](../server/mailer.js)
- [server/emailService.js](../server/emailService.js)
- [server/auth.js](../server/auth.js)
- [server/emailTemplates.js](../server/emailTemplates.js)

## Executive summary

The active email configuration is currently set to use SMTP with a Gmail account, not the mock provider or Resend. The app code implements SMTP AUTH PLAIN with username/password credentials and does not implement Gmail OAuth2/XOAUTH2. The sender header and authenticated Gmail identity are not aligned by default, which is a meaningful deliverability risk unless the custom domain is explicitly authorized through Gmail/Google Workspace. The code does have sensible basic error categorization, but it does not include DKIM signing, DNS verification, or robust retry/backoff handling. The templates are generally acceptable for transactional mail, but they lack a few modern deliverability best practices.

## Verified findings

### 1) Active provider configuration

The active repo config is SMTP-based, not mock or Resend.

Sanitized active config snapshot:

- `EMAIL_PROVIDER=smtp`
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_USER=<Gmail SMTP user, redacted>`
- `SMTP_PASS=<Gmail SMTP password/app password, redacted>`
- `EMAIL_FROM="Mythic Levels <no-reply@yourdomain.com>"`
- `SMTP_SECURE=false`

This is consistent with the app logic in [server/emailService.js](../server/emailService.js):

- `createEmailProvider()` selects SMTP when `EMAIL_PROVIDER === 'smtp'`
- `createSmtpEmailProvider()` builds `cfg` and calls `smtpSend(cfg, ...)`
- `createMailer()` also sends via SMTP when a host is present and the environment is not in the console-fallback path

Important nuance: the checked-in `.env` file is `NODE_ENV=development`, but because `SMTP_HOST` is set, the app does not switch to the console-only fallback. The app still tries to send over SMTP in this environment. In other words, the current working config is Gmail SMTP, even though the environment label is `development`.

### 2) Gmail SMTP authentication mechanism

The code does not implement OAuth2 or Gmail-specific XOAUTH2. It uses a basic SMTP AUTH PLAIN flow in [server/mailer.js](../server/mailer.js):

- `AUTH PLAIN ${Buffer.from("\0" + cfg.user + "\0" + cfg.pass).toString('base64')}`

This means Gmail is being used as an SMTP relay/authenticated account via SMTP username + password. For a Gmail account with 2FA enabled, this is normally an App Password flow, not OAuth2. The code is therefore compatible with a Gmail App Password setup, but not with an OAuth2 token-based Gmail flow.

### 3) Sender identity vs authenticated Gmail identity

The code sends a `From:` header of:

- `Mythic Levels <no-reply@yourdomain.com>`

The SMTP auth identity is a Gmail account, not the same custom domain. This creates a high-risk mismatch unless the custom domain is explicitly authorized in Google Workspace / Gmail SMTP relay configuration.

The app does not validate that the authenticated identity and `From:` header are aligned. That is a deliverability concern because many receiving providers evaluate the authenticated sender and the visible `From:` header together. If `yourdomain.com` is not properly verified and configured to permit Gmail sending as that domain, messages may be rejected, filtered, or marked suspicious.

### 4) SPF, DKIM, and DMARC status

No SPF/DKIM/DMARC configuration is present in the repo and no DKIM signing is implemented in the SMTP client.

Verified repo facts:

- [server/mailer.js](../server/mailer.js) builds the raw SMTP message
- it writes `From`, `To`, `Subject`, `Date`, and MIME headers
- it does not sign with DKIM
- there are no DNS-related config files or validation checks in the inspected code

This means SPF/DKIM/DMARC are not configured in the application code. They must be validated in the actual DNS provider for the domain used in `EMAIL_FROM` (for example `yourdomain.com`). If the sending domain is not set up correctly, deliverability will remain poor even if SMTP connectivity itself works.

### 5) SMTP error handling and failure classification

The error handling is mostly reasonable but not comprehensive.

In [server/emailService.js](../server/emailService.js):

- `classify(error)` maps:
  - authentication errors (`auth`, `535`) to `authentication`
  - timeouts to `timeout`
  - SMTP rejections / 4xx / 5xx to `rejected`
  - everything else to `connection`

The app then throws an `EmailDeliveryError` and the routes in [server/index.js](../server/index.js) surface a structured failure such as `email-delivery-failed` with a category. This is a sensible minimum for request handling.

However, there are notable gaps:

- There is no automatic retry/backoff queue for transient SMTP failures
- There is no distinction between a temp rejection (for example 421/450/451/452) and a permanent rejection (for example 550/551/552/553) beyond coarse regex matching
- There is no bounce/complaint handling or monitoring hook for mailbox feedback loops
- A failed send returns a request-level failure without any provider-side retry strategy

This is acceptable for a small app, but not strong enough for production-grade delivery reliability.

### 6) Resend limits and rate limiting

There are two different layers of throttling in the app:

- `verificationResendAllowed()` in [server/auth.js](../server/auth.js) enforces a resend cooldown of 60 seconds per user
- `limited()` in [server/index.js](../server/index.js) enforces a global IP-based auth limiter of 20 attempts per 15 minutes by default

This is a reasonable baseline for account abuse prevention and OTP spam prevention.

What is missing for a stronger deliverability posture:

- no per-recipient email throttling
- no per-IP or per-account burst protection for forgot-password flows beyond the generic auth limiter
- no provider-side queue/backoff for SMTP send retries
- no workflow to slow or block repeated sends to generic recipients or bounced addresses

So: minimum safety is present, but production-grade deliverability resilience is not yet in place.

### 7) Template deliverability issues

The transactional templates in [server/emailTemplates.js](../server/emailTemplates.js) are structurally sound and do not contain obvious spam-style red flags such as broken HTML or excessive punctuation. They include:

- a proper multipart/alternative message layout
- plain text and HTML variants
- a clear subject line
- a visible brand name
- a confirm/reset link and a basic expiry message

But there are a few practical deliverability gaps:

- no `List-Unsubscribe` header or footer for account/admin-initiated messages
- no `Preheader` text to improve inbox preview quality
- no `text/plain` fallback that includes an explicit, branded, plain-language summary beyond the link
- no DKIM signing or authenticated domain alignment for `no-reply@yourdomain.com`
- depending on mailbox providers, the `From:` identity may be considered suspicious if the domain has not been configured and verified

These are not catastrophic issues, but they are the usual reasons a message may land in spam even when the SMTP transaction itself succeeds.

## Configuration details that require your confirmation

These items cannot be verified solely from the repo and need your environment/DNS confirmation:

1. Is the Gmail account used by `SMTP_USER` a Workspace account or a standard personal Gmail account?
2. Is the custom domain in `EMAIL_FROM` (`yourdomain.com`) actually authorized to send through that Gmail account?
3. Are SPF, DKIM, and DMARC records configured for `yourdomain.com` and aligned with the `From:` domain?
4. Is the `EMAIL_FROM` domain already verified with Google Workspace / Gmail SMTP relay settings?
5. Is the app expected to be deployed as a production env with real HTTPS and a public `FRONTEND_URL`? The current checked-in `.env` still uses `http://localhost:5173` and `NODE_ENV=development`.
6. If using a Gmail App Password, is it still the correct mechanism for the actual account in use today, or did the account move to stricter Gmail security settings?

## Smallest safe changes to improve deliverability

These are the smallest changes I recommend before implementing anything:

1. Confirm the sender domain is authorized for Gmail SMTP sending and that the Gmail account is using the correct App Password or an approved SMTP relay path.
2. Move the `EMAIL_FROM` domain to the same domain as the authenticated/verified sending identity or ensure Google Workspace is configured to permit that alias legally and technically.
3. Add DKIM signing at the provider or mail relay level. The current code does not sign mail with DKIM; that is a major missing piece for deliverability.
4. Verify SPF, DKIM, and DMARC records for the `no-reply@yourdomain.com` domain and align them to the actual sending domain.
5. Add a clear `preheader` and a stronger plain-text/email footer in the transactional templates.
6. Keep the resend cooldown as-is, but add a small provider-side retry/backoff strategy for transient SMTP failures and a per-user/per-address throttle if abuse or accidental loops become an issue.
7. Do not rely on the `EMAIL_PROVIDER=smtp` setting alone; verify actual DNS/provider-side sender authentication before treating the app as email-ready.

## Recommendation

The code path is currently functional as a basic SMTP sender, but it is not yet convincingly production-ready for Gmail-based deliverability without upstream DNS/provider confirmation. The most important risk is not the SMTP library itself; it is the mismatch between the authenticated Gmail identity and the custom `From:` domain, plus the absence of DKIM/SPF/DMARC alignment.

Until those are confirmed, I would treat the app as "connected to Gmail SMTP but not yet validated for inbox delivery".

## Files inspected

- [.env](../.env)
- [.env.example](../.env.example)
- [server/mailer.js](../server/mailer.js)
- [server/emailService.js](../server/emailService.js)
- [server/auth.js](../server/auth.js)
- [server/emailTemplates.js](../server/emailTemplates.js)
