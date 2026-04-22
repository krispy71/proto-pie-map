# Security Vulnerability Analysis & Mitigations

Audit date: 2026-04-22  
Scope: full codebase — server, frontend, container, dependencies, deployment pipeline

---

## Severity ratings used

| Level | Meaning |
|---|---|
| **Critical** | Exploitable remotely with no authentication; immediate data/system compromise |
| **High** | Significant exposure; exploitable under realistic conditions |
| **Medium** | Exploitable but requires additional conditions or is limited in impact |
| **Low** | Defence-in-depth gap; not directly exploitable in current form |

---

## Findings and mitigations

### VULN-01 — Missing HTTP security headers
**Severity:** High  
**Status:** ✅ Fixed (`server.js` — helmet middleware)

**What it was:**  
Express served responses with no `Content-Security-Policy`, `X-Frame-Options`,
`X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy` headers.

**Impact:**  
- **Clickjacking**: Any site could embed this app in an `<iframe>` and overlay fake UI
- **MIME sniffing**: Browsers could interpret a served `.js` file as HTML and execute it
- **XSS amplification**: Without a CSP, any injected script would run without restriction
- **Information leakage**: `X-Powered-By: Express` header disclosed the framework version

**Fix applied:**
```javascript
// server.js
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'", `'${LEAFLET_JS_HASH}'`, "https://unpkg.com"],
      styleSrc:       ["'self'", `'${LEAFLET_CSS_HASH}'`, "https://unpkg.com", "'unsafe-inline'"],
      imgSrc:         ["'self'", "data:", "https://*.basemaps.cartocdn.com", ...],
      objectSrc:      ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
}));
```

helmet also removes `X-Powered-By`, sets `X-Content-Type-Options: nosniff`,
`X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: no-referrer`, and
`Permissions-Policy` with restrictive defaults.

**Residual risk:** `'unsafe-inline'` is required for `styleSrc` because Leaflet injects
inline styles for map panes. This cannot be avoided without patching Leaflet or using
a nonce-based CSP (complex; not warranted for a static app). The risk is low because
there is no user-generated content and no dynamic style injection.

---

### VULN-02 — CDN resources loaded without Subresource Integrity
**Severity:** High  
**Status:** ✅ Fixed (`public/index.html`)

**What it was:**  
Leaflet JS and CSS loaded from `https://unpkg.com` without `integrity` attributes.

**Impact:**  
A CDN supply-chain compromise (unpkg.com serves npm package tarballs directly) could
deliver modified JavaScript that runs with full page access — capturing user data,
manipulating the DOM, or exfiltrating data.

**Fix applied:**
```html
<link rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H"
      crossorigin="anonymous" />

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH"
        crossorigin="anonymous"></script>
```

SRI hashes were computed by fetching the live files and running:
```bash
curl -sf <url> | openssl dgst -sha384 -binary | openssl base64 -A
```

**Residual risk:** unpkg.com pins `leaflet@1.9.4` (exact version, not a range), so the
hash is stable. If Leaflet is upgraded, new hashes must be computed and committed.

**Longer-term option:** Vendor Leaflet into `public/lib/` to eliminate the CDN dependency
entirely. This removes the SRI requirement and makes the app work offline.

---

### VULN-03 — No rate limiting
**Severity:** Medium  
**Status:** ✅ Fixed (`server.js` — express-rate-limit)

**What it was:**  
No request throttling. An attacker or misconfigured crawler could exhaust Fargate CPU/memory
with trivial HTTP requests, incurring cost and causing denial of service.

**Fix applied:**
```javascript
const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 300,                   // 300 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
}));
```

**Residual risk:** IP-based rate limiting can be circumvented with distributed requests.
The ALB + AWS WAF (see VULN-08) provides a more robust layer.

---

### VULN-04 — No request logging or audit trail
**Severity:** Medium  
**Status:** ✅ Fixed (`server.js` — morgan)

**What it was:**  
No access logs were produced, making incident investigation impossible.

**Fix applied:**
```javascript
const morgan = require('morgan');
app.use(morgan('combined'));  // Apache combined log format in production
```

Logs flow to stdout → CloudWatch Logs (`/ecs/proto-pie-map`) via the Fargate `awslogs`
driver configured in the ECS task definition.

---

### VULN-05 — Verbose error responses
**Severity:** Medium  
**Status:** ✅ Fixed (`server.js`)

**What it was:**  
Unhandled errors would produce Express default error pages that include the error stack
trace and the Express version string.

**Fix applied:**
```javascript
// 404
app.use((req, res) => res.status(404).type('text').send('Not found'));

// 500 — logs internally but returns no detail to the client
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).type('text').send('Internal server error');
});
```

---

### VULN-06 — Missing .gitignore
**Severity:** Medium  
**Status:** ✅ Fixed (`.gitignore` created)

**What it was:**  
No `.gitignore` file. Accidental `git add .` would commit `node_modules/` (176 MB+),
any future `.env` files, and log files to version control.

**Fix applied:** Standard Node `.gitignore` covering `node_modules/`, `.env*`, logs,
`coverage/`, `.DS_Store`.

---

### VULN-07 — Container running as root (base image default)
**Severity:** Medium  
**Status:** ✅ Already mitigated in Dockerfile

**What it was:**  
Node Docker images run as root by default. A container escape vulnerability would then
grant root access to the host.

**Already in place:**
```dockerfile
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```

**Additional hardening in task definition:**
```json
"readonlyRootFilesystem": true
```
This prevents any process in the container from writing to the filesystem, limiting the
blast radius of any compromise.

---

### VULN-08 — No WAF or DDoS protection
**Severity:** Medium  
**Status:** ⚠️ Planned — not yet implemented

**What it is:**  
The ALB is exposed directly to the internet. Large-scale HTTP floods or targeted attacks
could exhaust Fargate task capacity or ALB LCUs, causing downtime and unexpected cost.

**Planned mitigation:**  
Enable AWS WAF on the ALB with the AWS Managed Rules Common Rule Set:

```bash
# Create WAF web ACL (run once)
aws wafv2 create-web-acl \
  --name proto-pie-map-waf \
  --scope REGIONAL \
  --region us-east-1 \
  --default-action Allow={} \
  --rules '[
    {
      "Name": "AWSManagedRulesCommonRuleSet",
      "Priority": 0,
      "OverrideAction": {"None": {}},
      "Statement": {
        "ManagedRuleGroupStatement": {
          "VendorName": "AWS",
          "Name": "AWSManagedRulesCommonRuleSet"
        }
      },
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "AWSManagedRulesCommonRuleSet"
      }
    },
    {
      "Name": "RateLimitRule",
      "Priority": 1,
      "Action": {"Block": {}},
      "Statement": {
        "RateBasedStatement": {
          "Limit": 2000,
          "AggregateKeyType": "IP"
        }
      },
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "RateLimitRule"
      }
    }
  ]' \
  --visibility-config \
    SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=proto-pie-map-waf

# Associate with the ALB
aws wafv2 associate-web-acl \
  --web-acl-arn <web-acl-arn> \
  --resource-arn $ALB_ARN \
  --region us-east-1
```

AWS Shield Standard (free, always-on) protects against network-layer floods.
AWS Shield Advanced (~$3,000/month) adds 24/7 DDoS response and cost protection.

---

### VULN-09 — HTTP (unencrypted) traffic possible to the origin
**Severity:** Low (mitigated by architecture)  
**Status:** ✅ Mitigated by ALB design

The ALB is configured with:
- HTTPS listener on port 443 using TLS 1.3 policy `ELBSecurityPolicy-TLS13-1-2-2021-06`
- HTTP port 80 listener that issues a 301 redirect to HTTPS
- No public exposure of the container port (3000) — only the ALB security group allows ingress

The container-to-ALB hop is internal to the VPC and uses HTTP (acceptable; data does not
leave AWS infrastructure unencrypted).

For end-to-end encryption, move to HTTPS on the container itself — but this adds
certificate management complexity for no meaningful security gain in this topology.

---

### VULN-10 — Supply chain: npm transitive dependencies
**Severity:** Low  
**Status:** ✅ Mitigated (scanning in CI + lock file)

**What it is:**  
Express pulls ~68 transitive packages. Any could contain malicious code or known CVEs.

**Mitigations in place:**
1. `package-lock.json` pins exact versions of all transitive dependencies
2. `npm ci --only=production` in Dockerfile ensures deterministic installs
3. `npm audit --audit-level=high` runs in CI before every build (see `.github/workflows/deploy.yml`)
4. ECR image scanning (`scanOnPush=true`) runs Clair/Inspector on every pushed image

**Ongoing:** Run `npm audit` and `npm update` periodically. Dependabot can automate PRs
for dependency updates if the repository is hosted on GitHub.

---

## Security header verification

After deployment, verify headers with:
```bash
curl -sI https://yourdomain.com | grep -iE \
  "content-security|x-frame|x-content-type|strict-transport|referrer-policy|permissions"
```

Or use [securityheaders.com](https://securityheaders.com) for a scored report.

Expected output:
```
content-security-policy: default-src 'self'; ...
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
strict-transport-security: max-age=15552000; includeSubDomains
referrer-policy: no-referrer
permissions-policy: camera=(), microphone=(), geolocation=()
```

---

## Vulnerability summary table

| ID | Finding | Severity | Status |
|---|---|---|---|
| VULN-01 | Missing HTTP security headers | High | ✅ Fixed — helmet |
| VULN-02 | CDN resources without SRI | High | ✅ Fixed — integrity attributes |
| VULN-03 | No rate limiting | Medium | ✅ Fixed — express-rate-limit |
| VULN-04 | No access logging | Medium | ✅ Fixed — morgan |
| VULN-05 | Verbose error responses | Medium | ✅ Fixed — custom error handlers |
| VULN-06 | Missing .gitignore | Medium | ✅ Fixed — .gitignore created |
| VULN-07 | Container as root | Medium | ✅ Already fixed — non-root user |
| VULN-08 | No WAF / DDoS protection | Medium | ⚠️ Planned — AWS WAF + Shield |
| VULN-09 | Unencrypted HTTP to origin | Low | ✅ Mitigated — VPC-internal only |
| VULN-10 | npm supply chain | Low | ✅ Mitigated — audit in CI + ECR scan |

No **Critical** vulnerabilities found. The application has no authentication, no database,
no user-generated content, and no server-side data processing — the attack surface is
inherently small.
