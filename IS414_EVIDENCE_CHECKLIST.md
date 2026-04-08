# IS414 Security Evidence Checklist

Use this checklist during your walkthrough video so each requirement is explicitly demonstrated.

## Confidentiality
- [ ] Show site loaded over `https://` with valid browser lock icon.
- [ ] Show HTTP request redirecting to HTTPS in browser/network tools.

## Authentication
- [ ] Demonstrate username/password login success.
- [ ] Demonstrate weak password rejection (registration or password change).
- [ ] Demonstrate strong password acceptance.
- [ ] Demonstrate unauthenticated user denied on protected API/page.

## Authorization (RBAC)
- [ ] Demonstrate admin can perform create/update/delete actions.
- [ ] Demonstrate donor can access donor dashboard/history endpoints only.
- [ ] Demonstrate non-admin cannot call admin endpoints (`403`/`401`).

## Integrity
- [ ] Demonstrate delete requires explicit confirmation in UI.
- [ ] Demonstrate backend rejects delete if confirmation is missing.

## Credentials
- [ ] Show no real secrets in tracked config files.
- [ ] Show runtime secrets come from environment or local secret file.

## Privacy
- [ ] Show footer link to Privacy Policy.
- [ ] Show GDPR-style cookie consent banner on first visit.
- [ ] Show cookie preference can be revisited from footer and changed.

## Attack Mitigations
- [ ] Show `Content-Security-Policy` response header in browser devtools.

## Availability
- [ ] Show publicly deployed URL is reachable.
- [ ] Show login with provided grader credentials.

## Additional Security Features (selected path)
- [ ] Show `Strict-Transport-Security` header in production response.
- [ ] Show browser-accessible theme preference cookie updates when theme changes.

## Grader Credentials to Provide in Submission
- [ ] Admin account without MFA.
- [ ] Donor account without MFA and with historical donations.
- [ ] (Optional if implemented) MFA-enabled account for feature verification.
