#!/bin/bash

# Script para validar build localmente, replicando o workflow do GitHub Actions
# Uso: npm run ci ou yarn ci

set -e  # Exit on error

echo "🔍 Detecting package manager..."

# Detect package manager (same logic as GitHub Actions workflow)
if [ -f "yarn.lock" ]; then
	MANAGER="yarn"
	COMMAND="install"
	RUNNER="yarn"
	echo "✅ Detected: yarn"
elif [ -f "package-lock.json" ]; then
	MANAGER="npm"
	COMMAND="ci"
	RUNNER="npx --no-install"
	echo "✅ Detected: npm"
else
	echo "❌ Unable to determine package manager"
	exit 1
fi

echo ""
echo "📦 Installing dependencies..."
$MANAGER $COMMAND

echo ""
echo "🏗️  Building with Next.js..."
$RUNNER next build

echo ""
echo "📤 Generating static HTML export..."
$RUNNER next export

echo ""
echo "✅ Build validation completed successfully!"
echo "📁 Static files are available in ./out"
