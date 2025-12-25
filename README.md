# BeyondChatProject

LIVE LINK:https://beyond-chat-project-s9x48w5wc-shaksham6464s-projects.vercel.app/
screenshot of webpage
<img width="1918" height="945" alt="Screenshot 2025-12-24 223625" src="https://github.com/user-attachments/assets/d2fe49fd-d935-40fa-9b61-04d79d3fb445" />
Backend server Screenshot
<img width="1299" height="629" alt="Screenshot 2025-12-24 223755" src="https://github.com/user-attachments/assets/d33d23f7-5855-4373-8e9d-d7597ae2fde1" />

Video of webpage
https://github.com/user-attachments/assets/111a9a5b-1cd4-4bfe-83c3-e9294c1d6179

Architechture design
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│                   (Port 5173 - Vite)                        │
│                                                             │
│  - Homepage with article grid                               │
│  - Article detail pages                                     │
│  - Side-by-side comparison view                            │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST API
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              Node.js + Express Backend                      │
│                   (Port 3000)                               │
│                                                             │
│  - CRUD API endpoints                                       │
│  - SQLite database                                         │
│  - Article model                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼─────────┐  ┌──────▼──────────┐
│  Web Scraper    │  │  Enhancement    │
│  (Phase 1)      │  │  Script         │
│                 │  │  (Phase 2)      │
│ - Cheerio       │  │                 │
│ - Axios         │  │ - Google Search │
│ - BeyondChats   │  │ - Content       │
│   blog          │  │   Scraper       │
│                 │  │ - LLM API       │
│                 │  │   (GPT/Gemini)  │
└─────────────────┘  └─────────────────┘
