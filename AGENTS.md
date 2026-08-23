---
name: Portal-Modelo-Agents
description: "AI agent instructions for the Portal-Modelo project - a Capoeira & Brazilian Culture portal. Use when contributing to this project or understanding its architecture."
---

# Portal-Modelo: Agent Instructions

## Project Overview

**Portal-Modelo** is a digital portal dedicated to **Capoeira & Brazilian Culture**. This project aims to create an accessible, educational platform that showcases the history, techniques, traditions, and community of Capoeira.

### Vision
Build a comprehensive web platform that serves as a resource for:
- Learning about Capoeira history and philosophy
- Accessing technique tutorials and explanations
- Connecting the global Capoeira community
- Preserving and promoting Brazilian cultural heritage

## Development Setup

⚠️ **Project is in early stages** — foundational architecture decisions are pending. When setting up the project:

1. **Technology choices** should prioritize:
   - Accessibility (WCAG compliant)
   - Multilingual support (Portuguese, English, Spanish minimum)
   - Performance and mobile responsiveness
   - Community contribution-friendly architecture

2. **Suggested tech stack** (to be confirmed):
   - Frontend: React/Next.js with TypeScript (for type safety)
   - Backend: Node.js with Express/Fastify (or Python/Django)
   - Database: PostgreSQL (for relational data about techniques, people, communities)
   - Content management: Headless CMS or Markdown-based for blog/educational content

## Key Conventions

### Naming & Localization
- Use Portuguese terms for Capoeira-specific concepts (e.g., "roda", "berimbau", "mestre")
- Provide English translations in comments/documentation
- Structure content to support multiple languages from the start

### File Organization
```
Portal-Modelo/
├── README.md
├── AGENTS.md (this file)
├── frontend/          (Web UI)
├── backend/           (API & business logic)
├── content/           (Educational materials, blogs)
├── docs/              (Project documentation)
└── scripts/           (Development helpers)
```

### Documentation
- Document culturally-sensitive topics respectfully
- Include historical context for techniques and traditions
- Link to primary sources and community resources

## Common Development Tasks

### When starting with a new feature:
1. Create a feature branch from `main`
2. Update docs/README with the feature description before implementation
3. Ensure multilingual strings are externalized (not hardcoded)
4. Include cultural context in comments for Capoeira-specific features

### When reviewing code:
- Check that Capoeira terminology is used correctly and consistently
- Verify accessibility features are present (alt text for images, captions for videos)
- Ensure content respects cultural significance

### Content & Community:
- Links to mestres' or acknowledged practitioners' resources should be current
- Community features should have moderation guidelines for respect and authenticity

## Resources to Link

As the project grows, update the following sections with actual documentation:
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Contribution guidelines (to be created)
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Technical architecture details (to be created)
- [CULTURE_GUIDE.md](./docs/CULTURE_GUIDE.md) — Best practices for representing Capoeira culturally (to be created)

## Quick Start for AI Agents

When working on Portal-Modelo:
1. **Prioritize accessibility and localization** in every feature
2. **Research cultural accuracy** — when in doubt about Capoeira terms or history, link to authoritative sources
3. **Write with internationalization in mind** — extract strings, support RTL where needed
4. **Document decisions** that affect cultural representation or community engagement
5. **Ask for clarification** on cultural or historical context if uncertain

---

*Last updated: 2026-08-22*  
*Next steps: Define tech stack, create CONTRIBUTING.md, establish community guidelines*
