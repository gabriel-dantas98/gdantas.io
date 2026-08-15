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
echo "🌐 Checking i18n key parity (pt vs en)..."
$RUNNER tsx scripts/i18n-check.ts || $RUNNER ts-node scripts/i18n-check.ts

echo ""
echo "🧪 Running unit tests..."
$MANAGER run test:unit

echo ""
echo "🖼️  Checking talks catalog and deterministic social images..."
if [ "$MANAGER" = "yarn" ]; then
	yarn talks:check
else
	npm run talks:check
fi

echo ""
echo "🤖 Preparing public Agent Skills discovery metadata..."
$MANAGER run ai:prepare

echo ""
echo "🔒 Checking Agent Skills discovery metadata drift..."
git diff --exit-code -- public/.well-known/agent-skills/index.json

echo ""
echo "🏗️  Building with Next.js..."
$RUNNER next build

echo ""
echo "📤 Generating static HTML export..."
$RUNNER next export

echo ""
echo "🔎 Checking generated sitemap indexability..."
if [ "$MANAGER" = "yarn" ]; then
	yarn sitemap:check
else
	npm run sitemap:check
fi

echo ""
echo "🤖 Checking deterministic AI readiness signals..."
$MANAGER run ai:check

echo ""
echo "✅ Build validation completed successfully!"
echo "📁 Static files are available in ./out"
