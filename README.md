# 🚀 **MyChatAI — Your AI-Powered Chat Companion**

Welcome to **MyChatAI**, an intelligent and modern chat application that lets you interact naturally with AI, manage your conversations, and personalize your experience through themes and profile customization.
### Live Demo: https://my-chat-ai-canada.vercel.app/

---

## ✨ **Features**

- 💬 **AI-Powered Chat**  
  Start conversations and get instant, human-like AI responses.

- 📁 **Chat Library**  
  View, pin, duplicate, and delete your past chats easily.

- 🎨 **Customizable Themes**  
  Choose from Light, Dark, Pink, Yellow, Blue, or Green themes to match your style.

- 🔐 **Authentication**  
  Sign up or log in securely using email and password (passwords hashed with bcrypt).

- 📄 **Persistent User Data**  
  Store user information, avatars, and theme preferences on Supabase.

- 📌 **Pinned Chats**  
  Keep important conversations easily accessible at the top.

- 💡 **Example Questions**  
  Quickly start chatting using suggested example prompts.

- 🌟 **Profile Avatars**  
  Automatically generated avatars using DiceBear, based on your email.

---

## ⚙️ **Tech Stack**

- **Frontend**: Next.js + React + TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Custom logic (Supabase + bcryptjs)
- **Database**: Supabase (PostgreSQL)
- **AI Responses**: Integrated API endpoint (gemini-1.5-flash)
- **State Management**: React hooks & Context (AuthProvider and ThemeProvider)

---

## 💡 **Areas for Improvement**

- ✅ Add OAuth login (Google, GitHub, etc.)
- ✅ Add conversation export options (PDF, Markdown)
- ✅ Add better error feedback and UI improvements
- ✅ User settings page (change profile avatar,...)
- ✅ Improve mobile responsiveness and PWA support
- ✅ Add moderation and safety checks on AI responses

---

## 🚀 **Getting Started**

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- Supabase account (with tables configured)

---

### Configuration

- Add .env file includes:
- 
NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

GEMINI_API_KEY

NEXT_PUBLIC_GEMINI_API_KEY

### 💬 Usage
Sign up for a new account (requires a unique username).

Log in with your email and password.

Start chatting or try example questions on the homepage.

Manage your chats from the Library (pin, duplicate, or delete).

Switch themes anytime using the theme selector.

Log out when you're done.
