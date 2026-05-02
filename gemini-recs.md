# Security Audit Recommendations: proto-pie-map
**Date:** 2026-04-28

## Audit Summary
The `proto-pie-map` project demonstrates an excellent security posture for a static-service Node.js application. Key strengths include:
*   **Docker Hardening:** Multi-stage builds with non-root user execution.
*   **CI/CD Integration:** Automated `npm audit` and `Trivy` container scanning.
*   **Middleware Security:** Proper use of `helmet` (CSP), `express-rate-limit`, and GDPR-compliant IP anonymization in logs.
*   **Safe DOM Manipulation:** Heavy reliance on `.textContent` for dynamic updates.

## Critical Findings
*   No critical vulnerabilities were identified during this audit.

## Targeted Recommendations

### 1. Metadata Consistency
*   **File:** `opencode.yaml`
*   **Issue:** The `project_name` is currently set to `acoustic-did`, which appears to be a leftover from a template or a different project.
*   **Action:** Update `project_name: "proto-pie-map"` to ensure consistency across tooling.

### 2. Defense-in-Depth for Client-Side Rendering
*   **Location:** `public/app.js` (specifically `L.divIcon` and `bindTooltip` calls)
*   **Issue:** Some template literals inject data directly into HTML strings. While the source (`data.js`) is currently developer-controlled, this creates a potential "sink" for XSS if the data source ever becomes dynamic or user-influenced.
*   **Action:** Implement a lightweight HTML escape utility for variables used in Leaflet HTML properties:
    ```javascript
    function escapeHTML(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
    ```

### 3. CSP Hardening
*   **Issue:** `style-src` currently allows `'unsafe-inline'`.
*   **Action:** If Leaflet's styles can be fully pre-defined in `leaflet.css`, consider removing `'unsafe-inline'`. If Leaflet requires dynamic style injection, consider implementing a CSP nonce for better security than a broad allowlist.

### 4. Dependency Maintenance
*   **Action:** Continue utilizing the `npm audit` step in the CI/CD pipeline. Regularly run `npm update` to ensure the sub-dependencies (like `body-parser` used by `express`) remain patched against newly discovered CVEs.
