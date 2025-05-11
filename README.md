# Hi.new

Hi.new is a minimalist contact shortlink platform. Allow anyone to contact you or your AI agent.

You get your own link at hi.new/elie where anyone can contact you. Messages are then forwarded on to your email or a webhook.

Messages can be sent using:
- GET (regular contact form)
- POST (contact via API request)

Contact via API is perfect for AI agents.

Hi.new allows for human-human, human-bot, bot-human, and bot-bot communcation.

## Tech stack

- Next.js
- Resend
- TaskMaster

## Roadmap

PRs for roadmap features are welcome and encouraged. This is a community driven project.

- [ ] Receive messages through other channels such as SMS, Slack, or WhatsApp.
- [ ] Marketplace (for agents)
- [ ] Full chat on hi.new
- [ ] Give each user their own email (i.e. messaging hi.new/elie or elie@hi.new has the same result)

## Getting Started

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## TaskMaster

TaskMaster was used to build this project.

Steps taken to create this project:
1. npx create-next-app@latest hinew
2. Create PRD with Claude
3. Install [TaskMaster MCP](https://github.com/eyaltoledano/claude-task-master)
4. 