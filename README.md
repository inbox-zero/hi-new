# Hi.new

> **🚧 Under Construction! 🚧**
>
> Hi.new is currently a work-in-progress and not yet production-ready.
> It will launch at [hi.new](https://hi.new) when it's ready.
>
> *This is a project was created by the team behind [Inbox Zero](https://www.getinboxzero.com), the world's best AI assistant for email.*

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

Follow these steps to get the hi.new development environment running locally:

1.  **Clone the Repository** (if you haven't already).

2.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

3.  **Set Up Local Database (Docker)**:
    *   Ensure Docker is installed and running ([Docker Desktop](https://www.docker.com/products/docker-desktop)).
    *   Copy `.env.example` to `.env.local` and configure your environment variables, especially:
        ```env
        DATABASE_URL="postgresql://postgres:password@localhost:5434/hinew?schema=public"
        # Also set RESEND_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, AUTH_SECRET
        ```
    *   Start the PostgreSQL container:
        ```bash
        docker-compose up -d
        ```
    *   Apply database migrations:
        ```bash
        pnpm exec prisma migrate deploy
        ```
    *   (Optional, if client is out of sync) Generate Prisma client:
        ```bash
        pnpm exec prisma generate
        ```
    *   For more details on managing the Dockerized database, see the "Local Development Database (Docker)" section below (or we can keep the detailed steps here if you prefer to remove the separate subsection).

4.  **Run the Development Server**:
    ```bash
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Local Development Database (Docker)

For local development, this project is configured to use a PostgreSQL database running in Docker. This ensures a consistent database environment.

1.  **Ensure Docker is Installed and Running**:
    If you don't have Docker installed, download and install [Docker Desktop](https://www.docker.com/products/docker-desktop).

2.  **Configure Environment Variables**:
    *   Copy the `.env.example` file to a new file named `.env.local` in the project root.
    *   Ensure the `DATABASE_URL` in `.env.local` is set to:
        ```
        DATABASE_URL="postgresql://postgres:password@localhost:5434/hinew?schema=public"
        ```
    *   Fill in any other required environment variables in `.env.local` (e.g., `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `AUTH_SECRET`).

3.  **Start the PostgreSQL Container**:
    In your project root directory, run:
    ```bash
    docker-compose up -d
    ```
    This command will start the PostgreSQL database service defined in the `[docker-compose.yml](mdc:docker-compose.yml)` file. The `-d` flag runs it in detached mode.
    The database will be accessible on `localhost:5434`, and data will be persisted in the `./.pgdata/` directory (which should be in your `.gitignore`).

4.  **Apply Database Migrations**:
    Once the Docker container is running and the database is ready, apply the Prisma migrations to set up your database schema:
    ```bash
    pnpm exec prisma migrate deploy
    ```
    If this is the very first time or you encounter issues, you might need to ensure your database is clean or use `pnpm exec prisma migrate reset` (this will delete data) followed by `pnpm exec prisma migrate deploy` or `pnpm exec prisma db push --accept-data-loss` for a fresh schema push (use with caution if you have data).

5.  **Run Prisma Generate** (if not automatically run by migrate):
    ```bash
    pnpm exec prisma generate
    ```

Now your Next.js application should be able to connect to the local Dockerized PostgreSQL database when you run `pnpm dev`.

To stop the database container, run: `docker-compose down`
To view logs: `docker-compose logs postgres`

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
(Doesn't show every single prompt, but gets most of it. There was a little manual fixing from me along the way, but after initial project / Prisma / auth was done, it was mostly going on its own). With me often just saying go to next step, or doing a prisma migrate or shadcn add and then having it continue.

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
32. how to use prisma with nextjs: @https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help stop doing new prisma client in each file
33. replace new prisma() in the whole project
34. /Generate Cursor Rules for some of the stuff we've learnt here. like how to use prisma and how to shadcn install components with the correct syntax: pnpm dlx shadcn-ui@latest add form
also we use pnpm and not npm
35. ok keep going on our tasks
36. we need to add the contact form. and POST request for people to call via api. find the task for it
37. yes. but we also need to support POST requests to that url. can that be done in nextjs?
38. update tasks first. then we can do resend stuff
39. i added textarea already. you can do resend
40. webhook now
41. lets complete the pending tasks we have like 5,6,7. or update statuses if done
42. can the user see all their links and edit them? with delivery options? also do they get a secret key for webhook to verify we sent it to them? lets do that
43. we dont use server actions to get data. we use GET. server actions are POST
44. you needed to import the types from "@/generated/prisma". prisma changed @prisma-best-practices.mdc 
45. Given your interest in the core link functionality, would you like to start working on the "Manage Link" page, specifically focusing on allowing users to add Delivery Options (Email/Webhook) to their links? This seems like a very logical next piece. - yes
46. update task list. and add new tasks we need to do next
47. tasks 29-32
48. use lucide for icons
49. list tasks. then update task statuses
50. sure you can do logout now
51. sure. also update tasks
52. sure. you can use upstash for rate limits: @https://upstash.com/docs/redis/sdks/ratelimit-ts/overview 
53. we need to fix this: "Conflicting route and page at /[slug]: route at /[slug]/route and page at /[slug]/page". we do want a post and get request, but the current approach doesn't work
54. you have it wrong. the error clearly shows you cant have route and page conflict. so i guess lets just change the route for the post. could be api/LINK/route.ts i guess
55. I made a manual fix using redirects
56. i want to run a postgres db at: DATABASE_URL="postgresql://postgres:password@localhost:5434/hinew?schema=public". using docker for this is good
57. you can update gitignore and readme file to explain how to run it for people self-hosting
58. i made a small update. let's update the getting started now as pnpm dev on its own no longer works. also user needs to pnpm install as a step. keep it concise
59. I created a migration file using Prisma
60. `pnpm install @prisma/adapter-pg`
61. fix prisma @prisma.ts. this is how the new prisma works:
    import { PrismaPg } from '@prisma/adapter-pg'
    import { PrismaClient } from './generated/prisma'

    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
    const prisma = new PrismaClient({ adapter })
62. why did you import pg? follow my example correctly
63. ah we need these flags:
    generator client {
    provider        = "prisma-client-js" // or `prisma-client`
    previewFeatures = ["queryCompiler", "driverAdapters"]
    output          = "../generated/prisma"
    }
    @schema.prisma 
64. create a landing page for the project. it should be clean, minimal and modern @page.tsx 
65. use blue instead. hero cop update: One link to say hi to anyone—human or AI. subheading should mention you can say hi via api or contact form
66. lets make the rate limiter optional so people can run the project without installing upstash