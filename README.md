# AI-chatBot

https://github.com/user-attachments/assets/b0f1384b-5a35-4fa0-bae7-cb574db5a6b2

# Installation

```
cd ./server
docker-compose up --build
```

# Client Setup

The client is a modern React app using Vite, TypeScript, Tailwind CSS, and shadcn-ui.

```
cd ./client
npm install   # or pnpm install or yarn install
npm run dev   # or pnpm dev or yarn dev
```

This will start the development server, usually at http://localhost:8080

# Database

- In ai provider table add the supported providers (only gemini & openai for now)
- In models table add the api keys and the AI models
