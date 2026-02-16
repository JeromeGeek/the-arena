# The Arena — Cyber-Luxury Game HubThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A cinematic, immersive gaming platform built with Next.js, React, Tailwind CSS, and Framer Motion.## Getting Started



## Tech StackFirst, run the development server:



- **Framework:** Next.js 16 (App Router)```bash

- **UI:** React, Tailwind CSS v4npm run dev

- **Animation:** Framer Motion# or

- **Language:** TypeScriptyarn dev

# or

## Getting Startedpnpm dev

# or

```bashbun dev

npm install```

npm run dev

```Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



Open [http://localhost:3000](http://localhost:3000) in your browser.You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.



## Project StructureThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.



```## Learn More

src/

├── app/To learn more about Next.js, take a look at the following resources:

│   ├── layout.tsx          # Root layout with fonts

│   ├── page.tsx            # Landing page — Battlefield Selection- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

│   ├── globals.css         # Design system & animations- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

│   ├── codenames/

│   │   └── page.tsx        # Codenames gameYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

│   └── imposter/

│       └── page.tsx        # Imposter game## Deploy on Vercel

├── components/

│   ├── AgentCard.tsx       # Codenames agent card with flip animationThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

│   ├── Board.tsx           # 5×5 game board grid

│   ├── GameCard.tsx        # Reusable game card displayCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

│   ├── SetupModal.tsx      # Codenames setup modal
│   └── TurnIndicator.tsx   # Team turn indicator
└── lib/
    ├── codenames.ts        # Codenames game logic & word pools
    └── imposter.ts         # Imposter game logic & categories
```

## Games

### Codenames
- 5×5 grid board with 3D flip card reveals
- Spymaster / Guesser dual-role toggle
- Difficulty levels: Easy, Medium, Hard
- Language support: English & French
- Assassin card with screen-shake effect

### Imposter
- Multi-player social deduction game
- Private word reveal system
- Discussion and voting phases
- Supports 3–10 players

## Design Philosophy

Cyber-luxury tactical aesthetic:
- Deep dark-mode (`#0B0E14`)
- Glassmorphism panels
- Neon precision accents (Red & Blue team gradients)
- Cinematic Framer Motion animations
- TV-first responsive design (55–75" displays)
