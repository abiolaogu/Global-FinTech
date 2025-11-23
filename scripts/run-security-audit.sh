#!/bin/bash

echo "🔒 Running Security Audit for Payment System"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. NPM Audit
echo "1️⃣  Running npm audit..."
if command_exists npm; then
    npm audit --production || echo -e "${YELLOW}⚠️  npm audit found vulnerabilities${NC}"
    echo ""
else
    echo -e "${RED}❌ npm not found${NC}"
fi

# 2. Check for secrets in code
echo "2️⃣  Checking for exposed secrets..."
if command_exists git; then
    # Check for common secret patterns
    echo "Searching for potential secrets..."

    git grep -E '(api[_-]?key|secret|password|token)["\']?\s*[:=]\s*["\'][^"\']{8,}["\']' -- '*.ts' '*.js' '*.json' || echo -e "${GREEN}✅ No obvious secrets found in code${NC}"

    # Check for .env files in git
    if git ls-files | grep -q "^\.env$"; then
        echo -e "${RED}❌ .env file is tracked in git!${NC}"
    else
        echo -e "${GREEN}✅ .env file not tracked in git${NC}"
    fi
    echo ""
else
    echo -e "${YELLOW}⚠️  git not found, skipping secret check${NC}"
fi

# 3. Check file permissions
echo "3️⃣  Checking file permissions..."
if [ -f ".env" ]; then
    perms=$(stat -f "%A" .env 2>/dev/null || stat -c "%a" .env 2>/dev/null)
    if [ "$perms" != "600" ] && [ "$perms" != "0600" ]; then
        echo -e "${YELLOW}WARNING: .env file has insecure permissions: $perms (should be 600)${NC}"
        echo "Run: chmod 600 .env"
    else
        echo -e "${GREEN}OK: .env file has correct permissions${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
fi
echo ""

# 4. Check for SQL injection patterns
echo "4️⃣  Checking for potential SQL injection vulnerabilities..."
sql_injection_found=false

# Check for direct string concatenation in queries
if git grep -E 'query\s*\(\s*["\`].*\$\{' -- '*.ts' '*.js' >/dev/null 2>&1; then
    echo -e "${RED}❌ Potential SQL injection: String interpolation in queries found${NC}"
    sql_injection_found=true
fi

# Check for raw queries without parameterization
if git grep -E 'createQueryBuilder.*where.*\$\{' -- '*.ts' '*.js' >/dev/null 2>&1; then
    echo -e "${RED}❌ Potential SQL injection: Direct string interpolation in where clause${NC}"
    sql_injection_found=true
fi

if [ "$sql_injection_found" = false ]; then
    echo -e "${GREEN}✅ No obvious SQL injection patterns found${NC}"
fi
echo ""

# 5. Check for hardcoded credentials
echo "5️⃣  Checking for hardcoded credentials..."
hardcoded_found=false

if git grep -iE '(password|secret|key)\s*=\s*["\'][^"\']+["\']' -- '*.ts' '*.js' | grep -v 'test' | grep -v 'example' | grep -v 'YOUR_' >/dev/null 2>&1; then
    echo -e "${RED}❌ Potential hardcoded credentials found${NC}"
    hardcoded_found=true
fi

if [ "$hardcoded_found" = false ]; then
    echo -e "${GREEN}✅ No hardcoded credentials found${NC}"
fi
echo ""

# 6. Check encryption implementation
echo "6️⃣  Checking encryption implementation..."
encryption_ok=true

# Check if AES-256-GCM is used
if ! git grep -q "aes-256-gcm" -- '*.ts' '*.js'; then
    echo -e "${YELLOW}⚠️  AES-256-GCM encryption not found${NC}"
    encryption_ok=false
fi

# Check for weak encryption
if git grep -E "(aes-128|des-|rc4)" -- '*.ts' '*.js' >/dev/null 2>&1; then
    echo -e "${RED}❌ Weak encryption algorithm found${NC}"
    encryption_ok=false
fi

if [ "$encryption_ok" = true ]; then
    echo -e "${GREEN}✅ Encryption implementation looks good (AES-256-GCM)${NC}"
fi
echo ""

# 7. Check for XSS vulnerabilities
echo "7️⃣  Checking for potential XSS vulnerabilities..."
xss_found=false

# Check for innerHTML usage
if git grep -E 'innerHTML\s*=' -- '*.ts' '*.js' >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  innerHTML usage found - potential XSS risk${NC}"
    xss_found=true
fi

# Check for dangerouslySetInnerHTML (React)
if git grep 'dangerouslySetInnerHTML' -- '*.tsx' '*.jsx' >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  dangerouslySetInnerHTML found - verify sanitization${NC}"
    xss_found=true
fi

if [ "$xss_found" = false ]; then
    echo -e "${GREEN}✅ No obvious XSS vulnerabilities found${NC}"
fi
echo ""

# 8. Check HTTPS enforcement
echo "8️⃣  Checking HTTPS/TLS configuration..."
if git grep -E 'http://' -- '*.ts' '*.js' | grep -v 'localhost' | grep -v 'test' | grep -v '127.0.0.1' >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  HTTP URLs found in code (should use HTTPS in production)${NC}"
else
    echo -e "${GREEN}✅ No HTTP URLs found (using HTTPS)${NC}"
fi
echo ""

# 9. Check for sensitive data logging
echo "9️⃣  Checking for sensitive data in logs..."
sensitive_logging=false

if git grep -E 'console\.log.*password|console\.log.*secret|console\.log.*token' -- '*.ts' '*.js' >/dev/null 2>&1; then
    echo -e "${RED}❌ Sensitive data may be logged${NC}"
    sensitive_logging=true
fi

if git grep -E 'logger\.(log|info|debug).*password|logger\.(log|info|debug).*secret' -- '*.ts' '*.js' >/dev/null 2>&1; then
    echo -e "${RED}❌ Sensitive data may be logged${NC}"
    sensitive_logging=true
fi

if [ "$sensitive_logging" = false ]; then
    echo -e "${GREEN}✅ No sensitive data logging found${NC}"
fi
echo ""

# 10. Check dependencies for known vulnerabilities
echo "🔟  Checking dependencies with npm audit..."
if command_exists npm; then
    npm audit --json > npm-audit-report.json 2>/dev/null

    vulnerabilities=$(cat npm-audit-report.json | grep -o '"total":[0-9]*' | head -1 | grep -o '[0-9]*')

    if [ -n "$vulnerabilities" ] && [ "$vulnerabilities" -gt 0 ]; then
        echo -e "${RED}❌ Found $vulnerabilities vulnerabilities in dependencies${NC}"
        echo "Run 'npm audit fix' to fix automatically fixable vulnerabilities"
    else
        echo -e "${GREEN}✅ No vulnerabilities found in dependencies${NC}"
    fi

    rm npm-audit-report.json 2>/dev/null
else
    echo -e "${YELLOW}⚠️  npm not found${NC}"
fi
echo ""

# Summary
echo "=============================================="
echo "🔒 Security Audit Complete"
echo "=============================================="
echo ""
echo "📋 Summary of Recommendations:"
echo "1. Ensure all secrets are in .env and never committed"
echo "2. Keep dependencies updated (npm audit fix)"
echo "3. Use parameterized queries to prevent SQL injection"
echo "4. Implement input validation on all user inputs"
echo "5. Use HTTPS in production"
echo "6. Implement rate limiting on all endpoints"
echo "7. Enable CORS with specific origins only"
echo "8. Implement proper authentication and authorization"
echo "9. Use helmet.js for security headers"
echo "10. Regular security audits and penetration testing"
echo ""
echo "For production deployment:"
echo "  - Enable WAF (Web Application Firewall)"
echo "  - Set up DDoS protection"
echo "  - Implement comprehensive logging and monitoring"
echo "  - Use secrets management service (AWS Secrets Manager, etc.)"
echo "  - Enable database encryption at rest"
echo "  - Implement database connection encryption (SSL)"
echo ""
