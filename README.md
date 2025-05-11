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
2. Install [TaskMaster MCP](https://github.com/eyaltoledano/claude-task-master)
3. Init TM: "Can you please initialize taskmaster-ai into my project?"
4. Create PRD with Claude to match example example_prd.txt
5. Paste in scripts/prd.txt
6. TM: "Can you parse my PRD at scripts/prd.txt?" (this created the tasks)

Now the basic set up is done here's what I did next:

7. TM: "ive already set up nextjs. mark it as done. what's next?"
8. TM: "let's go add this. here's the docs for it: @https://www.better-auth.com/"
9. TM: "this is how you do it: https://www.better-auth.com/docs/integrations/next"
10. TM: "this is how we do prisma: https://www.better-auth.com/docs/adapters/prisma"
11. Add Prisma myself:
  - `npm install @prisma/client`
  - `npm install prisma --save-dev`
  - `npx prisma`
  - `npx prisma init --datasource-provider postgresql --output ../generated/prisma`
12. Reverted Prisma to v6.6 to run `npx @better-auth/cli@latest generate`
13. Removed some tasks from the task list
14. TM: "i initialised the schema now. let's keep going and mark relevant tasks as done"
15. Handled env vars
16. TM: "keep going. i want a basic frontend working"
17. TM: "here's a shadcn login form we can add. make sure shadcn is set up too" (shared shadcn code block too)
18. `pnpm dlx shadcn@latest init`
19. TM: "this is how we add shadcn components nowadays: 'pnpm dlx shadcn@latest add button'"
20. TM: "ok i did it. we're using react. not vue fyi. let's keep going in our work. we had some errors on login form"
21. Added Better Auth docs to Cursor
22. TM: "@BetterAuth here are the docs to help you"
23. TM: "did you do a lot of copy paste code for the sign up and sign. can we fix that?"
24. TM: "i like react hook form and zod for validation"
25. Fixed bug with styling/Tailwind myself
26. TM: "i like react hook form and zod for validation. also we dont have google login. just keep it simple with username/pw for now. update tasks"
27. TM: "fix lint errors"
28. TM: "lets get to next task now. i want to get to the contact form implementation and POST because that's one of the main features"
29. TM: "i ran prisma generate. keep going"
30. lets take a step back. a user should be able to create multiple links / contact forms. they could go to different bots or emails
31. no you got it wrong. all links are: hi.new/LINK a user could have 10 of those though