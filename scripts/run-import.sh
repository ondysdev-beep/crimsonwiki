#!/bin/bash

# Crimson Desert Database Import Script
# This script will import all items from crimsondesert.gg

echo "🚀 Starting Crimson Desert Database Import..."
echo "📡 This will:"
echo "   1. Create new hierarchical category structure (Items -> subcategories)"
echo "   2. Import all 5,902 items from crimsondesert.gg"
echo "   3. Remove old duplicate categories"
echo "   4. Update navigation structure"
echo ""

# Check if the server is running
if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo "❌ Server is not running. Please start the development server first:"
    echo "   npm run dev"
    exit 1
fi

# Run the import
echo "🔧 Running database import..."
curl -X POST http://localhost:3000/api/import-database \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer import-crimson-desert-db" \
  -d '{}'

echo ""
echo "✅ Import completed!"
echo ""
echo "📊 Next steps:"
echo "   1. Check the new Items category structure"
echo "   2. Verify all items were imported correctly"
echo "   3. Test navigation to new subcategories"
echo "   4. Update any hardcoded links if needed"
