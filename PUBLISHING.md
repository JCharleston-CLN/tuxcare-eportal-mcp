# Publishing Guide

## Setup npm Publishing

### 1. Create npm Account (if you don't have one)
- Go to https://www.npmjs.com/signup
- Create account with your email

### 2. Login to npm
```bash
npm login
```

### 3. Test Local Installation
```bash
# Install locally for testing
npm install -g .

# Test the CLI
tuxcare-eportal-mcp --help
```

### 4. Publish to npm
```bash
# Publish the package
npm publish

# Or publish with public access (if scoped)
npm publish --access public
```

### 5. Test npm Installation
```bash
# Test installation from npm
npm install -g tuxcare-eportal-mcp

# Test CLI
tuxcare-eportal-mcp --help
```

## GitHub Actions Publishing

For automated publishing, you need to:

1. Create npm access token:
   - Go to https://www.npmjs.com/settings/tokens
   - Create "Automation" token
   - Copy the token

2. Add to GitHub repository secrets:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: paste your npm token

3. Create a release:
   ```bash
   # Tag a version
   git tag v1.0.0
   git push origin v1.0.0
   ```

This will trigger the GitHub Actions workflow to automatically publish to npm.

## Version Management

To update version:
```bash
# Update version in package.json
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes

# Push with tags
git push --follow-tags
```