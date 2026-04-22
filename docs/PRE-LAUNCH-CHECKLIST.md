# Pre-Launch Checklist

Steps required before making the Proto-Indo-European Migration Map publicly accessible.
Items are grouped by category and ordered by urgency/dependency.

Legend: ✅ Done · ⚠️ In progress / planned · ☐ Not started

---

## 1. Security hardening

| # | Item | Status | Notes |
|---|---|---|---|
| 1.1 | HTTP security headers (CSP, HSTS, X-Frame, etc.) | ✅ | helmet middleware |
| 1.2 | Subresource Integrity on CDN assets | ✅ | sha384 hashes on Leaflet |
| 1.3 | Rate limiting | ✅ | express-rate-limit, 300 req/15 min |
| 1.4 | Non-root container user | ✅ | appuser in Dockerfile |
| 1.5 | Read-only container filesystem | ✅ | task definition |
| 1.6 | .gitignore (prevent secrets in git) | ✅ | created |
| 1.7 | npm audit in CI pipeline | ✅ | GitHub Actions workflow |
| 1.8 | Container image CVE scanning | ✅ | Trivy in CI + ECR scan-on-push |
| 1.9 | AWS WAF with managed rule set | ⚠️ | see SECURITY.md VULN-08 |
| 1.10 | HTTPS enforced (HTTP → 301 redirect) | ⚠️ | configured in ALB; needs domain |

---

## 2. Legal & compliance

| # | Item | Status | Notes |
|---|---|---|---|
| 2.1 | **Privacy Policy** page | ✅ | `public/privacy.html` — covers server logs, tile CDN connections, no-cookie statement, GDPR rights |
| 2.2 | **Terms of Use / Terms of Service** | ✅ | `public/terms.html` — educational disclaimer, accuracy disclaimer, attributions, prohibited uses |
| 2.3 | **Copyright attributions** | ✅ | Credited in `terms.html` §3c; tile provider attributions visible in map UI |
| 2.4 | **Cookie/tracking notice** | ✅ | No cookies set; stated in `privacy.html` §3. No banner required unless analytics are added. |
| 2.5 | GDPR: IP anonymisation in server logs | ✅ | `server.js` anonymises last IPv4 octet / last 64 IPv6 bits before writing logs; documented in `privacy.html` §2a |
| 2.6 | Verify map tile provider ToS | ☐ | CartoDB/Carto: free tier requires attribution, prohibits commercial use without a paid plan. ESRI: requires attribution, free for reasonable use. Confirm your usage volume is within free tier limits or purchase a plan. |
| 2.7 | Book/research attribution | ☐ | The app is inspired by Spinney's book but does not reproduce text. Confirm the "Based on" framing does not imply endorsement. Consider reaching out to the publisher if the app will be widely promoted. |

---

## 3. Accessibility (a11y)

| # | Item | Status | Notes |
|---|---|---|---|
| 3.1 | Keyboard navigation | ✅ | Focus rings on all interactive elements via `:focus-visible`; legend items changed from `<div>` to `<button>` for native Tab/Enter/Space support |
| 3.2 | Screen reader labels | ✅ | `aria-label` on all icon buttons, time slider (`aria-valuenow`/`aria-valuetext` updated live), map container (`role="application"`), info panel (`role="complementary"`, `aria-hidden` toggled), legend (`role="navigation"`), event ticker (`role="status"`, `aria-live="polite"`), play button (`aria-pressed` toggled) |
| 3.3 | Colour contrast | ✅ | All previously failing colours corrected to ≥4.5:1 against background (see `style.css` comments for before/after values) |
| 3.4 | Alt text / non-visual map access | ☐ | Map itself cannot be navigated by screen reader; text summary or data table is a future enhancement |
| 3.5 | Reduced-motion preference | ✅ | CSS `@media (prefers-reduced-motion: reduce)` disables all transitions; JS reads `window.matchMedia` on init and listens for changes — auto-play is blocked if user prefers reduced motion |
| 3.6 | Mobile / touch usability | ☐ | Layout not yet responsive — future work |

---

## 4. Performance

| # | Item | Status | Notes |
|---|---|---|---|
| 4.1 | Static asset caching headers | ✅ | `maxAge: '1d'` set in `express.static` for production |
| 4.2 | Gzip / Brotli compression | ☐ | Add `compression` middleware to Express, or delegate to the ALB/CloudFront. Can reduce JS/CSS payload 60–70%. |
| 4.3 | CloudFront CDN | ⚠️ | Documented in DEPLOYMENT.md; dramatically reduces ALB cost and global latency |
| 4.4 | Leaflet vendored locally | ☐ | Download `leaflet.js` and `leaflet.css` into `public/lib/`. Eliminates unpkg.com dependency, allows offline use, removes CDN as single point of failure. Update SRI hashes or remove them once local. |
| 4.5 | Bundle size audit | ☐ | `data.js` is ~70 KB uncompressed. `app.js` is ~15 KB. Both are fine; no bundling needed at this size. |
| 4.6 | Performance budget / Core Web Vitals | ☐ | Test with [PageSpeed Insights](https://pagespeed.web.dev) once deployed. Target: LCP < 2.5s, FID < 100ms, CLS < 0.1. |

---

## 5. SEO & discoverability

| # | Item | Status | Notes |
|---|---|---|---|
| 5.1 | `<meta>` description and Open Graph tags | ☐ | Add to `<head>`: `description`, `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`. |
| 5.2 | Social preview image | ☐ | Create a 1200×630px screenshot of the map for OG/Twitter cards. |
| 5.3 | `robots.txt` | ☐ | Create `public/robots.txt`. For an open app: `User-agent: * / Allow: /`. |
| 5.4 | `sitemap.xml` | ☐ | Single-page app; a one-entry sitemap is still useful for search indexing. |
| 5.5 | Canonical URL tag | ☐ | `<link rel="canonical" href="https://yourdomain.com/">` |
| 5.6 | `<html lang="en">` | ✅ | Already present |

---

## 6. Observability & operations

| # | Item | Status | Notes |
|---|---|---|---|
| 6.1 | Analytics | ☐ | Options: Plausible Analytics (privacy-preserving, no cookies, GDPR-safe, ~$9/month) or Fathom. Avoid Google Analytics if minimising GDPR complexity. |
| 6.2 | Error monitoring | ☐ | Add Sentry (free tier) or use CloudWatch Alarms on 5xx error rate. Sentry catches client-side JS errors too. |
| 6.3 | Uptime monitoring | ☐ | Use [UptimeRobot](https://uptimerobot.com) (free) or AWS Route 53 health checks to alert on downtime. |
| 6.4 | CloudWatch dashboard | ☐ | Create a dashboard tracking: ALB 4xx/5xx rate, Fargate CPU/memory, request count, target response time. |
| 6.5 | Cost alerts | ☐ | Set a CloudWatch billing alarm at $50/month to catch unexpected cost spikes. |
| 6.6 | Log retention confirmed | ✅ | CloudWatch log group set to 30-day retention in deployment |
| 6.7 | Rollback procedure tested | ☐ | Do a deliberate rollback (see DEPLOYMENT.md) before go-live. Confirm it completes within 2 minutes. |

---

## 7. Content & accuracy review

| # | Item | Status | Notes |
|---|---|---|---|
| 7.1 | Historical accuracy review | ☐ | Have someone with Indo-European studies background review dates, migration paths, and descriptions. Errors in a public educational tool can spread misinformation. |
| 7.2 | Genetic claims review | ☐ | The genetics descriptions reflect the current scientific consensus but the field moves fast. Add a disclaimer that the app represents the state of knowledge as of 2024 and may not reflect the latest findings. |
| 7.3 | Disclaimer on map | ☐ | Add visible text: "Territorial extents are schematic approximations, not historically precise boundaries. Dates are approximate. Modern borders shown for orientation only." |
| 7.4 | Spell-check all text | ☐ | Run a spell-checker over `data.js` descriptions. |
| 7.5 | Cross-browser testing | ☐ | Test on Chrome, Firefox, Safari, and Edge. Test on iOS Safari and Android Chrome for mobile. |

---

## 8. Infrastructure final checks

| # | Item | Status | Notes |
|---|---|---|---|
| 8.1 | Domain registered and nameservers pointing to Route 53 | ☐ | — |
| 8.2 | ACM certificate issued and validated | ☐ | DNS validation via Route 53 is automatic once CNAME records are added |
| 8.3 | ALB health checks passing | ☐ | `aws elbv2 describe-target-health --target-group-arn $TG_ARN` |
| 8.4 | ECS service stable (no task restarts) | ☐ | `aws ecs describe-services --cluster ... --services ...` |
| 8.5 | Fargate desired count ≥ 2 for HA | ☐ | Single task = single point of failure; set `--desired-count 2` before launch |
| 8.6 | Auto-scaling policy active | ⚠️ | Documented in DEPLOYMENT.md Step 12 |
| 8.7 | Deployment circuit breaker enabled | ✅ | Configured in ECS service create command |
| 8.8 | End-to-end smoke test post-deploy | ☐ | Load the live URL, play the timeline, open info panels, test all 5 tile styles, verify SRI doesn't block Leaflet |

---

## Launch day sequence

1. Complete all ☐ items above (or consciously accept the risk for each)
2. Do a final `npm audit` and `docker build` locally
3. Push to `main` → GitHub Actions runs audit → builds image → Trivy scans → pushes to ECR → deploys to ECS
4. Monitor ECS deployment in AWS Console until stable
5. Run smoke tests against live URL
6. Set `desired-count` to 2 if not already done
7. Announce / share the URL

---

## Items that can be deferred to post-launch

These are improvements but not blockers for a public soft launch:

- CloudFront CDN
- AWS WAF (Shield Standard free tier provides basic flood protection)
- Vendor Leaflet locally
- Mobile-responsive layout
- Full WCAG AA accessibility audit
- Analytics integration
- Formalised incident response plan
