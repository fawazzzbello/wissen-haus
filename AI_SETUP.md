# AI Integration Setup Guide

This guide walks you through setting up the AI providers for the Wissen-Haus platform.

## Overview

The platform supports three AI providers:
- **Anthropic Claude 3.5 Sonnet** (Recommended - best performance)
- **Google Gemini 1.5 Pro** (Free tier available)
- **OpenAI GPT-4o** (Fallback option)

The system automatically falls back to other providers if the primary provider fails.

---

## 1. Anthropic Claude Setup (Recommended)

### Step 1: Create Anthropic Account
1. Go to https://console.anthropic.com
2. Sign up or login
3. Go to API Keys section
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-`)

### Step 2: Add to Environment
```bash
# Local development
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env.local

# Or set in Railway:
# Settings → Variables → Add: ANTHROPIC_API_KEY=sk-ant-...

# Set as primary (optional)
echo "AI_PROVIDER=anthropic" >> .env.local
```

### Step 3: Verify
```bash
curl -X GET http://localhost:5000/api/ai/providers
```

Should show:
```json
{
  "success": true,
  "data": {
    "primary": {
      "name": "Anthropic Claude",
      "available": true
    },
    "available": [
      { "name": "Anthropic Claude", "type": "AnthropicProvider" }
    ]
  }
}
```

### Pricing
- Input: $0.003 per 1K tokens
- Output: $0.015 per 1K tokens
- Free: No free tier, but very affordable

---

## 2. Google Gemini Setup

### Step 1: Create Google Cloud Project
1. Go to https://cloud.google.com
2. Create new project
3. Enable "Generative Language API"
4. Go to "Credentials" → "Create API Key"
5. Copy your API key (no prefix)

### Step 2: Add to Environment
```bash
# Local development
echo "GOOGLE_GEMINI_API_KEY=your_api_key_here" >> .env.local

# Or set in Railway
# Settings → Variables → Add: GOOGLE_GEMINI_API_KEY=...

# Make it primary (if you prefer)
echo "AI_PROVIDER=gemini" >> .env.local
```

### Step 3: Verify
```bash
curl -X GET http://localhost:5000/api/ai/providers
```

### Pricing
- Input: $0.00075 per 1K tokens
- Output: $0.003 per 1K tokens
- **Free tier: 60 requests per minute, unlimited**

---

## 3. OpenAI Setup

### Step 1: Create OpenAI Account
1. Go to https://platform.openai.com
2. Sign up or login
3. Go to API Keys → Create new secret key
4. Copy your key (starts with `sk-`)

### Step 2: Add Billing
1. Go to Billing → Set up paid account
2. Add payment method
3. Set usage limits (optional)

### Step 3: Add to Environment
```bash
# Local development
echo "OPENAI_API_KEY=sk-..." >> .env.local

# Or set in Railway
# Settings → Variables → Add: OPENAI_API_KEY=sk-...

# Make it primary (if you prefer)
echo "AI_PROVIDER=openai" >> .env.local
```

### Step 4: Verify
```bash
curl -X GET http://localhost:5000/api/ai/providers
```

### Pricing
- GPT-4o mini: $0.00015 per 1K input tokens
- Most affordable option with good performance

---

## Using the AI APIs

### 1. Generate Content

```bash
curl -X POST http://localhost:5000/api/ai/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a compelling thank you email for a $1000 donor"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "content": "Dear Valued Donor...",
    "type": "text",
    "tokensUsed": 145,
    "provider": "Anthropic Claude"
  }
}
```

### 2. Analyze Donations

```bash
curl -X POST http://localhost:5000/api/ai/analyze-donations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "donations": [
      { "amount": 100, "date": "2024-01-01", "donor": "John" },
      { "amount": 500, "date": "2024-01-15", "donor": "Jane" },
      { "amount": 1000, "date": "2024-02-01", "donor": "Bob" }
    ]
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "summary": "Strong donation growth with increasing donor engagement",
    "insights": [
      "Average donation increased 50% in February",
      "Growing donor loyalty with repeat gifts"
    ],
    "recommendations": [
      "Focus on retention of high-value donors",
      "Create tiered recognition program"
    ],
    "provider": "Anthropic Claude"
  }
}
```

### 3. Interactive Chat

```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What are best practices for donor retention?"
      }
    ]
  }'
```

### 4. Generate Reports

```bash
curl -X POST http://localhost:5000/api/ai/generate-report \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "monthly_summary",
    "data": [
      { "date": "2024-01-01", "amount": 1000 },
      { "date": "2024-01-15", "amount": 500 }
    ]
  }'
```

---

## Testing in Development

### 1. Start Development Server
```bash
npm run dev
```

### 2. Get Admin JWT Token
```bash
# Login first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wissen-haus.org",
    "password": "admin@123456"
  }'

# Extract token from response
# TOKEN="eyJhbGciOiJIUzI1NiI..."
```

### 3. Test AI Endpoints
```bash
# Replace TOKEN with your actual token
TOKEN="your_token_here"

# Test providers
curl -X GET http://localhost:5000/api/ai/providers \
  -H "Authorization: Bearer $TOKEN"

# Test content generation
curl -X POST http://localhost:5000/api/ai/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a short mission statement for a youth empowerment organization"
  }'
```

---

## Troubleshooting

### "No AI provider configured"
**Solution**: Set at least one API key:
```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env.local
# or
echo "GOOGLE_GEMINI_API_KEY=..." >> .env.local
# or
echo "OPENAI_API_KEY=sk-..." >> .env.local
```

### "Provider not available"
**Solution**: Verify API key is correct:
```bash
# Test Anthropic
curl -X GET https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

### "Token limit exceeded"
**Solution**: Reduce `maxTokens` in provider settings:
```typescript
// In provider constructor
this.maxTokens = 1000; // default: 2000
```

### "Rate limit exceeded"
**Solution**: Use Google Gemini (most generous free tier) or wait before retrying

### "Authorization required"
**Solution**: Must be logged in as admin
```bash
# Get JWT token from /api/auth/login
# Add to request: Authorization: Bearer <token>
```

---

## Selecting Primary Provider

The system tries providers in this order:
1. `AI_PROVIDER` environment variable (if set)
2. First available provider found
3. Falls back to next provider on error

### Set Primary Provider
```bash
# Option 1: Environment variable
echo "AI_PROVIDER=anthropic" >> .env.local

# Option 2: In code (AIService constructor)
const aiService = new AIService('gemini');
```

### Recommended Setup
- **Production**: Anthropic Claude (most reliable)
- **Development**: Google Gemini (free tier)
- **Fallback**: OpenAI GPT-4o (excellent quality)

---

## Cost Estimation

| Provider | Cost per 1K tokens | Recommendation |
|----------|-------------------|---|
| Anthropic Claude | $0.003-$0.015 | Best quality, stable pricing |
| Google Gemini | $0.00075-$0.003 | Cheapest, free tier |
| OpenAI GPT-4o | $0.00015-$0.003 | Affordable, good quality |

**Estimated monthly cost** for moderate usage (50,000 tokens/day):
- Anthropic: ~$4.50/month
- Google Gemini: ~$1/month
- OpenAI: ~$2.25/month

---

## Advanced: Custom System Prompts

```bash
curl -X POST http://localhost:5000/api/ai/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Analyze this donor data",
    "context": {
      "system": "You are a nonprofit fundraising expert with 20 years of experience. Provide strategic advice with specific, actionable recommendations."
    }
  }'
```

---

## Next Steps

1. **Set up at least one AI provider** (start with Anthropic)
2. **Test the endpoints** using curl commands above
3. **Build AI dashboard frontend** to visualize AI insights
4. **Create automated report generation** scheduled jobs
5. **Integrate AI into donation analysis** workflow

---

## Support

For issues with specific providers:
- **Anthropic**: https://support.anthropic.com
- **Google**: https://cloud.google.com/support
- **OpenAI**: https://help.openai.com

