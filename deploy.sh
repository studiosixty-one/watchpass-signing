#!/bin/bash

# Deployment script that ensures correct directory

cd "$(dirname "$0")"

echo "📦 Deploying Netlify function..."
echo "📍 Current directory: $(pwd)"
echo "📁 Functions directory: $(pwd)/netlify/functions"
echo ""

# Verify function file exists
if [ ! -f "netlify/functions/generate-pass.js" ]; then
  echo "❌ Error: Function file not found!"
  exit 1
fi

echo "✅ Function file found"
echo ""

# Deploy
npx netlify deploy --prod --dir=. --functions=netlify/functions

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Your function URL:"
echo "   https://watchpass.netlify.app/.netlify/functions/generate-pass"
echo ""
echo "📝 Next steps:"
echo "   1. Set environment variables in Netlify Dashboard"
echo "   2. Add PASS_SIGNING_SERVICE_URL to Supabase secrets"
echo "   3. Test with: node test-netlify.js"

