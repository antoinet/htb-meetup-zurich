# HTB Meetup Zurich: onboarding backend

One Netlify Function, `POST https://htbzh.netlify.app/api/onboard`, is called by the form on
[htbzh.ch/onboarding.html](https://htbzh.ch/onboarding.html) (served from the `gh-pages` branch).

Every request needs the **meetup code** that's announced at the meetup. If the code is valid,
the response says what happened:

| Who | What happens | `status` |
|---|---|---|
| Existing member of the HTB Enterprise org | The Meetup Lab license is assigned and expires after `HTB_DURATION_DAYS` | `license_assigned` |
| Unknown email | A registration code (invitation email) is sent that already carries the license, with the same duration | `invitation_sent` |
| Unknown email that already has an unused invitation | Nothing is sent. The page offers **Send a new invitation** | `invitation_pending` |
| Same, with `"resend": true` | The unused code is deleted and a new one is created, which sends a fresh email | `invitation_sent` |

The HTB API has no resend endpoint, so resending deletes the unused code and creates a new one.
If creating fails after the delete, the next submission just creates a fresh code.

The code is checked before anything is looked up on Hack The Box, so without it nobody can
trigger emails. Accepted trade-off: anyone who knows the code can tell members from non-members.

Other protections: a hidden honeypot field, a CORS allow-list, and a Netlify rate limit of
about 10 submissions per minute per IP.

## Configuration

Set these under [Project configuration > Environment variables](https://app.netlify.com/projects/htbzh/configuration/env#environment-variables),
scoped to **Functions**. Netlify only applies changes to environment variables on the next deploy.

| Variable | Required | Default | Meaning |
|---|---|---|---|
| `HTB_API_TOKEN` | yes | | HTB Enterprise API token |
| `MEETUP_CODE` | yes | | Code announced at the meetup. Empty or unset means onboarding is closed |
| `HTB_LICENSE_ID` | | `7425` | License to grant ("Meetup Lab") |
| `HTB_DURATION_DAYS` | | `3` | Days until the license or invitation expires |
| `ALLOWED_ORIGINS` | | `https://htbzh.ch` | Comma-separated origins allowed to call the API |

These variables from the old flow are no longer used and can be deleted:
`HTB_SESSION`, `WEBHOOK_URL`, `WEBHOOK_SECRET`, `MY_SECRET`.

## Per meetup

1. Before the meetup, set `MEETUP_CODE` to a new value that's easy to type, for example `blurry-7k2q`.
   Matching ignores case and surrounding spaces.
2. [Trigger a deploy](https://app.netlify.com/projects/htbzh/deploys).
3. Show the code on the intro slide.
4. Afterwards, clear `MEETUP_CODE` and redeploy to close onboarding.

## Local development

```sh
npm install
cat > .env <<'EOF'
HTB_API_TOKEN=...
MEETUP_CODE=test
ALLOWED_ORIGINS=http://localhost:8000
EOF
npx netlify-cli functions:serve --offline --port 9999
curl -X POST localhost:9999/api/onboard -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","code":"test"}'
npm run typecheck
```

`HTB_BASE_URL` points the client at a mock API for tests.
