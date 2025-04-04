# Fanfie Development Lessons

## Production Setup (2025-04-04)

### TypeScript Configuration
- **Issue**: Initial JSX parsing errors due to HTML entity encoding
- **Resolution**: Properly configured tsconfig.json with strict JSX handling
- **Prevention**: Always validate TSX syntax before deployment

### Vercel Deployment
- **Issue**: Build failures due to missing app directory structure
- **Resolution**: Implemented minimal viable Next.js app layout
- **Prevention**: Use standardized app directory template for future projects

### Git Configuration
- **Issue**: SSH key authentication failures
- **Resolution**: Switched to HTTPS for initial setup
- **Prevention**: Document Git authentication setup in README

## Documentation Framework (2025-04-03)

### Version Control
- **Issue**: Inconsistent version tracking across documents
- **Resolution**: Implemented semantic versioning (v0.1.0+)
- **Prevention**: Automated version bumping in future iterations
