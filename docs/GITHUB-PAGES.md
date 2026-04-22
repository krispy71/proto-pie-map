# GitHub Pages Deployment Guide

Deploys the static `public/` directory directly to GitHub Pages via GitHub Actions.
No server, no Docker, no cloud account required.

---

## How it works

```
GitHub push (main)
       │
       ▼
.github/workflows/pages.yml
       │
       ├─ actions/configure-pages   — validates Pages is enabled; sets base path
       ├─ actions/upload-pages-artifact  — packages ./public as a tar artifact
       └─ actions/deploy-pages      — GitHub unpacks and serves the artifact
                    │
                    ▼
          https://<username>.github.io/<repo>/
          (or custom domain if configured)
```

GitHub serves the files from its own global CDN — no ALB, no Fargate, no ECR needed.
HTTPS is automatic; GitHub provisions and renews the certificate.

---

## Steps required

### Step 1 — Create and push the repository

If you don't already have the code in a GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create proto-pie-map --public --source=. --remote=origin --push
```

Or use the GitHub web UI: **New repository → push existing code**.

> **Visibility:** GitHub Pages is free for **public** repositories. Private repositories
> require a GitHub Pro, Team, or Enterprise plan.

---

### Step 2 — Enable GitHub Pages in repository settings

1. Open your repository on github.com.
2. Click **Settings** (top navigation bar).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment → Source**, select **GitHub Actions**.
5. Click **Save** (no branch or folder to select — the workflow handles it).

That is the only manual configuration required. The rest is automated.

---

### Step 3 — Trigger the first deployment

Push any commit to the `main` branch (or re-push the initial commit):

```bash
git push origin main
```

Or trigger manually without a code change:

1. Go to **Actions** tab in your repository.
2. Select **Deploy to GitHub Pages** in the left sidebar.
3. Click **Run workflow → Run workflow**.

---

### Step 4 — Find the live URL

After the workflow completes (~30 seconds):

- Go to **Actions → Deploy to GitHub Pages → most recent run**.
- The URL appears in the **Deploy to GitHub Pages** step output and in the job summary.
- Format: `https://<username>.github.io/<repo-name>/`

The URL is also shown in **Settings → Pages** once the first deployment completes.

---

### Step 5 (optional) — Custom domain

To serve from `yourdomain.com` instead of `<username>.github.io/<repo>`:

**5a. Add a CNAME file to `public/`:**
```bash
echo "yourdomain.com" > public/CNAME
git add public/CNAME
git commit -m "Add custom domain"
git push
```

**5b. Create DNS records at your registrar:**

For an apex domain (`yourdomain.com`):
```
# Four A records pointing to GitHub's IP addresses
yourdomain.com  A  185.199.108.153
yourdomain.com  A  185.199.109.153
yourdomain.com  A  185.199.110.153
yourdomain.com  A  185.199.111.153

# AAAA records for IPv6 (optional but recommended)
yourdomain.com  AAAA  2606:50c0:8000::153
yourdomain.com  AAAA  2606:50c0:8001::153
yourdomain.com  AAAA  2606:50c0:8002::153
yourdomain.com  AAAA  2606:50c0:8003::153
```

For a subdomain (`map.yourdomain.com`):
```
map.yourdomain.com  CNAME  <username>.github.io.
```

**5c. Configure in GitHub:**
1. Go to **Settings → Pages → Custom domain**.
2. Enter your domain and click **Save**.
3. GitHub will run a DNS check (may take minutes to hours for DNS to propagate).
4. Once DNS verifies, tick **Enforce HTTPS** — GitHub provisions a Let's Encrypt certificate automatically.

> **Do not** remove the CNAME file from the `public/` directory or GitHub will
> lose track of the custom domain on each new deployment.

---

## How subsequent deployments work

Every push to the `main` branch automatically triggers the workflow. There is no
manual step. The deployment typically completes in under 60 seconds.

To roll back to a previous deployment:
1. Go to **Actions → Deploy to GitHub Pages**.
2. Open the previous successful run.
3. Click **Re-run jobs → Re-run all jobs**.

GitHub will redeploy that exact artifact.

---

## Key differences from the AWS Fargate deployment

| Aspect | GitHub Pages | AWS Fargate |
|---|---|---|
| **Server** | None — static CDN | Node.js / Express |
| **Security headers (CSP, etc.)** | Via `<meta>` tag in HTML; GitHub sets `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff` automatically | Full HTTP headers via helmet |
| **Rate limiting** | GitHub's infrastructure (~5,000 requests/hr per IP soft limit) | express-rate-limit (300 req/15 min) + optional WAF |
| **Access logging** | GitHub controls logs; not accessible to you | morgan → CloudWatch Logs |
| **IP anonymisation** | GitHub's responsibility as data processor | Anonymised in `server.js` before writing |
| **HTTPS** | Automatic (Let's Encrypt via GitHub) | ACM certificate on ALB |
| **Cost** | Free for public repos | ~$28/month (see DEPLOYMENT.md) |
| **CDN / global latency** | GitHub's global CDN (built-in) | Optional CloudFront |
| **Custom domain** | Supported | Via Route 53 + ACM |
| **Bandwidth limit** | 100 GB/month (soft) | Pay-per-use (ALB LCUs) |
| **Storage limit** | 1 GB repository size | ECR storage charged per GB |
| **Build/deploy time** | ~30 seconds | ~5–10 minutes (Docker build + ECS rollout) |
| **Rollback** | Re-run any previous Actions job | `aws ecs update-service --task-definition <rev>` |
| **Docker required** | No | Yes |
| **AWS account required** | No | Yes |

### Security header gap on GitHub Pages

GitHub Pages cannot set arbitrary HTTP headers, so the CSP is delivered via a `<meta
http-equiv="Content-Security-Policy">` tag instead. Two directives behave differently
in this context:

| Directive | HTTP header (Fargate) | Meta tag (Pages) |
|---|---|---|
| `frame-ancestors 'none'` | Enforced | **Ignored by browsers** |
| `upgrade-insecure-requests` | Enforced | Enforced |
| All others | Enforced | Enforced |

**`frame-ancestors` gap:** GitHub Pages automatically sets `X-Frame-Options: DENY` on
all `*.github.io` responses, which prevents clickjacking even without the CSP directive.
For custom domains, GitHub also sets this header if Pages is the host. This gap is
therefore covered.

---

## GDPR / privacy considerations specific to GitHub Pages

When using GitHub Pages, GitHub (Microsoft) acts as your **data processor**:

- GitHub's servers receive visitor IP addresses in their infrastructure logs.
- GitHub's [Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)
  describes how they handle this data.
- You **cannot** control or access these logs, and you cannot apply your own
  IP anonymisation.
- The server-side `morgan` IP anonymisation in `server.js` does not apply — it
  only runs in the Express/Fargate deployment.

**Action required before publishing on GitHub Pages:**
Update `public/privacy.html` §2a to note that when the site is hosted on GitHub Pages,
access logs are controlled by GitHub (Microsoft) under their privacy statement, and link
to it. Replace or supplement the CloudWatch log retention language accordingly.

Example addition to §2a:

> *If this site is hosted on GitHub Pages (github.io): access logs — including IP
> addresses — are collected and retained by GitHub (Microsoft) in accordance with the
> [GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
> We do not have access to these logs.*

---

## Limitations of GitHub Pages

| Limit | Value |
|---|---|
| Repository size | 1 GB recommended maximum |
| Published site size | 1 GB |
| Bandwidth per month | 100 GB (soft limit — GitHub may contact you if exceeded) |
| Builds per hour | 10 |
| Build timeout | 10 minutes |
| No server-side logic | Static files only — no Node.js, PHP, Ruby, etc. |
| No custom HTTP headers | CSP via meta tag only |
| Not for e-commerce | GitHub ToS prohibits running online businesses |
| Not for large file serving | Use a CDN or object storage for large assets |

The Proto Migration Map is well within all these limits — `public/` is approximately
500 KB of text files.

---

## Running both deployments in parallel

The repository has two independent workflows:

| Workflow | Trigger | Purpose |
|---|---|---|
| `.github/workflows/pages.yml` | push to `main` | Deploy `public/` to GitHub Pages |
| `.github/workflows/deploy.yml` | push to `main` (+ PRs) | Audit + Docker build + push to ECR + deploy to ECS |

Both run on every push to `main`. They are independent — a failure in one does not
affect the other.

**If you are using only GitHub Pages** (not AWS):
- The `deploy.yml` jobs that require AWS credentials (`build-and-push`, `deploy`) will
  fail with an authentication error. This is harmless — the Pages deployment still
  succeeds.
- To suppress these failures cleanly, disable the `deploy.yml` workflow:
  **Actions → Build, Scan & Deploy to AWS Fargate → (⋯ menu) → Disable workflow**.

**If you are using both:**
- No changes needed. GitHub Pages hosts the latest static version; AWS Fargate runs
  the hardened server version with full security headers and rate limiting.
- Consider pointing your primary domain to the Fargate deployment (better security
  posture) and using GitHub Pages as a free preview/staging environment.
