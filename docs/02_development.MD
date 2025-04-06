# Fanfie - Development Guidelines

This document outlines the development practices, code standards, and workflow for the Fanfie project.

## Development Environment

- **Node.js:** v18.x or later
- **npm:** v8.x or later
- **Editor:** VS Code with recommended extensions
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript support

## Code Standards

### TypeScript

- Use strict mode for all TypeScript files
- Define interfaces for all props and state
- Avoid using `any` type
- Use proper type annotations for functions

### React & Next.js

- Use functional components with hooks
- Implement proper client/server component separation
- Follow Next.js 14 App Router conventions
- Use named exports for components

### CSS & Styling

- Use Tailwind CSS for styling
- Follow utility-first approach
- Create reusable components for common UI patterns
- Use CSS variables for theming

## Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── components/        # Shared components
│   │   ├── Camera/        # Camera-related components
│   │   ├── Editor/        # Editing-related components
│   │   └── UI/            # Generic UI components
│   ├── lib/               # Utility functions and helpers
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── public/                # Static assets
└── styles/                # Global styles and Tailwind config
```

## Workflow

### Feature Development Process

1. **Planning**
   - Review feature in roadmap
   - Define acceptance criteria
   - Create tasks/branches

2. **Implementation**
   - Follow one function at a time rule
   - Write clean, documented code
   - Test locally

3. **Documentation**
   - Update relevant documentation
   - Add comments as needed
   - Document lessons learned

4. **Review**
   - Self-review code
   - Ensure all acceptance criteria are met
   - Validate against Definition of Done

5. **Deployment**
   - Deploy to Vercel
   - Verify functionality in production
   - Update release notes

### Git Workflow

- Branch naming: `feature/[feature-name]` or `fix/[issue-name]`
- Commit messages: Follow conventional commits format
- Tag versions using semantic versioning (e.g., v1.0.0)

## Definition of Done

A feature is considered complete when:

1. Code is implemented according to specifications
2. TypeScript and ESLint show no errors
3. Feature works in different browsers and devices
4. Documentation is updated
5. Code is committed and pushed
6. Successfully deployed to production
7. Release notes are updated

## Testing

- Manual testing for UI/UX functionality
- Browser compatibility testing
- Mobile responsiveness testing
- Future: Add automated testing with Jest and React Testing Library

---

*These guidelines are intended to maintain code quality and consistency throughout the project.*

