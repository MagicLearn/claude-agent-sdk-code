# Claude Agent SDK — Course Code

Code for the [Claude Agent SDK course](https://magiclearn.com) on MagicLearn.

Each lesson has a `start/` and `end/` folder. Start with `start/`, follow along with the lesson, and check your work against `end/`.

## Setup

```bash
# Navigate to a lesson
cd section-1-getting-started/lesson-2-setup-and-installation/start

# Install dependencies
bun install

# Run
bun run index.ts
```

## Structure

```
section-{n}-{name}/
  lesson-{n}-{name}/
    start/    ← begin here
    end/      ← reference solution
```

Concept-only lessons (no code) are not included in this repo.

## Prerequisites

- [Bun](https://bun.sh) installed
- Anthropic API key (`ANTHROPIC_API_KEY` environment variable)
- Claude Agent SDK course on MagicLearn
