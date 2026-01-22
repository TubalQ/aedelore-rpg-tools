# Aedelore Security Audit

**Date:** 2026-01-19
**Scope:** Web frontend, API backend, Database, Mobile app, Infrastructure

---

## Executive Summary

Overall security posture: **GOOD** with some issues to address.

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 0 |
| Medium | 4 |
| Low | 4 |
| Informational | 3 |

---

## Critical Issues

### 1. XSS Vulnerability in Character List Modal

**File:** `html/js/main.js` (lines 409-415)
**Severity:** CRITICAL
**Type:** Cross-Site Scripting (Stored XSS)

**Vulnerable Code:**
```javascript
list.innerHTML = characters.map(char => `
    <div class="character-list-item" onclick="loadCharacterById(${char.id})">
        <span class="character-name">${char.name}</span>  // NOT ESCAPED!
        <span class="character-date">${new Date(char.updated_at).toLocaleDateString()}</span>
        <button class="delete-char-btn" onclick="event.stopPropagation(); deleteCharacterById(${char.id}, '${char.name.replace(/'/g, "\\'")}')"
```

**Impact:** An attacker could create a character with name `<img src=x onerror=alert(document.cookie)>` and steal session tokens from any user who views the character list.

**Fix:** Use the `escapeHtml()` function (already exists in dm-session.js):
```javascript
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Then use:
<span class="character-name">${escapeHtml(char.name)}</span>
```

---

## Medium Issues

### 2. In-Memory Token Storage

**File:** `api/server.js` (line 60)
**Severity:** MEDIUM

**Issue:** Authentication tokens are stored in a JavaScript Map in memory. When the API restarts, all users are logged out.

**Impact:**
- Poor user experience on deployments
- Potential for token synchronization issues if scaling to multiple instances

**Fix:** Use the existing `auth_tokens` table in PostgreSQL (already defined in db.js but not used).

---

### 3. Missing Content-Security-Policy Header

**File:** `nginx.conf`
**Severity:** MEDIUM

**Issue:** No CSP header is configured, reducing XSS protection.

**Recommended Fix:**
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://aedelore.nu;" always;
```

---

### 4. Session Token in localStorage

**Files:** `html/js/main.js`, `html/js/dm-session.js`
**Severity:** MEDIUM

**Issue:** Auth tokens are stored in localStorage, which is accessible via JavaScript. Combined with the XSS vulnerability above, this enables token theft.

**Recommendation:** Consider using httpOnly cookies for token storage, or ensure all XSS vectors are eliminated.

---

### 5. iOS Token Storage Unencrypted

**File:** `composeApp/src/iosMain/kotlin/.../AuthManager.ios.kt`
**Severity:** MEDIUM

**Issue:** Token stored in NSUserDefaults (plaintext) instead of iOS Keychain.

**Current Code:**
```kotlin
actual class AuthManager {
    private val defaults = NSUserDefaults.standardUserDefaults
    actual fun saveToken(token: String) {
        defaults.setObject(token, forKey = "aedelore_auth_token")
    }
}
```

**Recommendation:** Use iOS Keychain for secure credential storage.

---

## Low Issues

### 6. Permissive CORS Configuration

**File:** `api/server.js` (line 34)
**Severity:** LOW

**Issue:** `origin: process.env.CORS_ORIGIN || true` defaults to allowing all origins.

**Fix:** Set explicit CORS_ORIGIN in .env file.

---

### 7. Missing HSTS Header

**File:** `nginx.conf`
**Severity:** LOW

**Issue:** No Strict-Transport-Security header to enforce HTTPS.

**Recommended Fix:**
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

### 8. Unused auth_tokens Table

**File:** `api/db.js` (lines 60-67)
**Severity:** LOW

**Issue:** `auth_tokens` table is created but never used. Tokens are stored in-memory instead.

**Recommendation:** Either use the table for persistent tokens or remove it to avoid confusion.

---

### 9. Delete Button Weak Escaping

**File:** `html/js/main.js` (line 413)
**Severity:** LOW

**Issue:** Character name in delete button uses simple quote replacement:
```javascript
'${char.name.replace(/'/g, "\\'")}'
```

This doesn't handle all injection vectors (e.g., `\` followed by `'`).

**Fix:** Use proper escapeHtml + additional attribute escaping.

---

## Informational

### 10. API Exposed on Non-Standard Port

**File:** `compose.yml`
**Severity:** INFO

Web server exposed on port 9020. Ensure this is behind a proper reverse proxy (nginx/caddy) with SSL termination.

---

### 11. IP Address Logging

**File:** `nginx.conf` (line 14)
**Severity:** INFO

Access logs include IP addresses. Consider GDPR implications and retention policies.

---

### 12. Error Messages Don't Leak User Existence

**File:** `api/server.js` (line 251)
**Severity:** INFO (POSITIVE)

Registration error message is generic: "Registration failed. Please try different credentials." - This prevents username enumeration.

---

## What's Done Well

| Area | Implementation |
|------|----------------|
| Password Hashing | bcrypt with 10 rounds |
| SQL Injection | Parameterized queries throughout |
| Rate Limiting | 10 auth attempts per 15min, 100 general per min |
| Account Lockout | 5 failed attempts = 15min lockout |
| Token Generation | crypto.randomBytes(32) - cryptographically secure |
| Token Expiry | 24 hour expiration |
| Security Headers | helmet.js middleware |
| Input Validation | Username/password validation rules |
| Android Token Storage | EncryptedSharedPreferences with AES256 |
| XSS in DM Tool | escapeHtml() used consistently |
| Database Access | No direct DB exposure, internal only |
| Foreign Keys | CASCADE delete for data integrity |

---

## Priority Action Items

1. **IMMEDIATE:** Fix XSS vulnerability in main.js character list
2. **HIGH:** Add Content-Security-Policy header
3. **MEDIUM:** Migrate to persistent token storage (PostgreSQL)
4. **MEDIUM:** Implement iOS Keychain for token storage
5. **LOW:** Add HSTS header
6. **LOW:** Set explicit CORS origin

---

## Testing Recommendations

1. Run OWASP ZAP scan against https://aedelore.nu
2. Test character names with: `<script>alert(1)</script>`, `"><img src=x onerror=alert(1)>`
3. Verify rate limiting works correctly
4. Test session timeout after 24 hours
5. Verify cascade deletes work for user/character/campaign relationships

---

*Audit performed by Claude Code*
