![ClaudeCord](./res/banner.png?raw=true "ClaudeCord")

# ClaudeCord - Claude Code, driven from Discord
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-EA4AAA?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/MashiroW)

*A small Discord bot that lets you talk to **Claude Code running on your own PC** from any Discord client: your phone, a laptop, voice dictation. Your private server becomes a copy of the Claude app's sidebar, with one category per project and one channel per conversation.*

---

## 📌 What it does

You write a message in a Discord channel. The bot passes it to Claude Code on your PC, in that project's folder, and posts the answer back in the channel. Claude works exactly as it does in a terminal: it reads and edits your files, runs commands and keeps the thread of each conversation.

```
📁 my-game-mod                ← category = a project (a folder on your PC)
   # add-pause-menu           ← channel = a conversation with Claude
   # fix-save-crash
📁 website
   # dark-mode
📦 Archives
# accueil                     ← help and bot commands
```

In every channel, a request goes the same way:

```
You    : add a pause menu to the game
Claude : ⏳ Patience, je traite ta requête…
Claude : (the answer, split into 2000-character messages when needed)
Claude : ✅ Réponse terminée (42 s) — tu peux envoyer ta prochaine question.
         🪙 40.3k read (32k cached) · 850 written
         ⏱️ 5 h: 81% left · 📅 week: 39% left
```

| | |
|---|---|
| Platform | Windows (the PC that runs Claude Code) |
| Requires | [Node.js](https://nodejs.org) 24+ and [Claude Code](https://claude.com/claude-code) signed in to your Claude plan |
| Dependencies | none: three `.mjs` files, no `npm install` |
| Who can use it | **only you**: the bot ignores every other user and every other server |
| Bot language | the bot's own messages are in French. Claude answers in your language. |

### Features

- **Projects and conversations**: one Discord category per project folder, one channel per conversation. Up to 3 conversations can work in parallel.
- **Syncs with the Claude app**: imports the conversations you already have in the Claude desktop app, copies new exchanges into Discord every 10 minutes, and follows renamed titles and moved folders.
- **Automatic titles**: a new channel is renamed after its first answer, like in the app.
- **Plan usage**: under each answer, the tokens used and what is left of your 5-hour and weekly limits.
- **Attachments**: send a screenshot or a file and Claude reads it.
- **Long answers**: split cleanly into 2000-character messages without breaking code blocks.
- **Runs on its own**: restarts itself if it crashes, and can start with Windows.

---

## 📥 Installation

### 1. Create your server
In Discord: **+** → **Create My Own** → **For me and my friends**.

### 2. Create the bot
1. Open the [Discord Developer Portal](https://discord.com/developers/applications) → **New Application** and give it a name.
2. **Bot** tab:
   - **Reset Token** and copy it. This is the bot's password, keep it secret.
   - Turn on **Message Content Intent**. Without it, the bot can't read your messages.
   - Turn off **Public Bot**, so nobody else can add it to a server.
3. **Installation** tab: set the install link to **None**. Discord requires this before a bot can be made private.
4. **OAuth2 → URL Generator**: tick the `bot` scope and the **Administrator** permission. Open the generated URL and add the bot to your server.

> If Discord says *"Integration requires code grant"*, go to the **Bot** tab and turn off **Requires OAuth2 Code Grant**.

### 3. Get your IDs
In Discord: **User Settings → Advanced → Developer Mode**. Then:
- right-click your server icon → **Copy Server ID**;
- right-click your name → **Copy User ID**.

### 4. Configure
```
git clone https://github.com/MashiroW/ClaudeCord
```
Copy `config.example.json` to `config.json` and fill it in:

| Key | Meaning |
|---|---|
| `discordToken` | your bot token |
| `guildId` | your server ID. The bot ignores every other server. |
| `ownerId` | your user ID. **Only your messages** are sent to Claude. |
| `claudePath` | `claude` if it is on your PATH, otherwise the full path to `claude.exe` (usually `%USERPROFILE%\.local\bin\claude.exe`) |
| `permissionMode` | `auto` (recommended): Claude does safe actions on its own and refuses risky ones. Also `acceptEdits` or `bypassPermissions` (no safety net). |
| `model` / `effort` | the model and reasoning effort, e.g. `claude-opus-5-5` / `medium` |
| `maxParallel` | how many conversations can work at the same time |
| `timeoutMinutes` | maximum duration of one request |
| `showUsage` / `showCost` | show tokens and plan usage / the cost of each answer |
| `syncMinutes` | how often to sync with the Claude app (`0` turns it off) |
| `syncDays`, `syncMaxNew`, `importHistory` | how far back the sync looks, how many new conversations it imports at most, and how many exchanges it copies when importing one |
| `importListSize` | how many conversations `!import` lists |
| `appendSystemPrompt` | extra instructions given to Claude |

`config.json` is git-ignored. Never commit it or share it.

### 5. Run
Double-click **`start.bat`**. On first launch, the bot creates an **#accueil** channel with the help.

---

## ▶️ Starting and stopping

| To… | Do… |
|---|---|
| **Start** | double-click **`start.bat`** |
| **Stop** | close the "Pont Discord - Claude Code" window (it may be minimized in the taskbar) |
| **Restart** after updating the code | type `!restart` in Discord, or close the window and run `start.bat` again |

While the window is open, the bot runs. If it crashes, it restarts after 5 seconds. Your PC must stay awake: while it sleeps, the bot can't answer.

### Start with Windows

| To… | Do… |
|---|---|
| **Enable** | double-click **`autostart-activer.bat`** |
| **Disable** | double-click **`autostart-desactiver.bat`** |

Enabling adds a `ClaudeCord` shortcut to your Windows Startup folder, so the bot starts in a minimized window each time you log in. Disabling removes the shortcut. A bot that is already running keeps running until you close its window.

To check by hand, press `Win + R` and type `shell:startup`. If `ClaudeCord` is in that folder, autostart is on. If you move the project folder, run `autostart-activer.bat` again.

---

## 💬 Commands

Any message that doesn't start with `!` goes to Claude. French and English names both work.

| Command | What it does |
|---|---|
| `!project <folder>` | create a project category and its first conversation, e.g. `!project D:\code\my-game` |
| `!projects` | list projects and their folders |
| `!import`, then `!import 1 3 5` or `!import all` | bring your Claude app conversations into Discord |
| `!sync` | sync with the Claude app now |
| `!new [title]` | new conversation in the same project |
| `!stop` | cancel the request running in this channel |
| `!status` | idle or busy, folder, session |
| `!usage` | what is left of your plan (5-hour window and week) |
| `!archive` | move the channel to 📦 Archives |
| `!restart` | restart the bot |
| `!help` | show the help |

You can also create a channel by hand inside a project category: it becomes a new conversation in that project. Deleting a channel only makes the bot forget it. The conversation stays available in Claude Code.

---

## 👥 Sharing your server

You can invite friends to **read** your conversations. The bot still only obeys you, and their messages are ignored.

- Create an invite with a short expiry and a single use.
- Create a **Guest** role. On private categories, remove **View Channels** from `@everyone`. On the ones you want to show, give it to **Guest**.
- For read-only access, remove **Send Messages** from **Guest**.
- Chat with them in a separate channel outside project categories. Anything *you* write in a project channel goes to Claude.
- Never give guests **Administrator** or **Manage Channels**.

If a friend wants their own Claude in Discord, they should run their own copy with their own PC, bot and Claude plan. Several bots can live on the same server, and each one only answers its own `ownerId`.

---

## 🔒 Security

The bot gives Claude real access to your PC: files, commands, network. Anyone who could talk to it could act on your machine.

- Keep `ownerId` set to **your** ID only.
- Treat the bot token like a password. If it leaks, click **Reset Token** in the Developer Portal and update `config.json`.
- Keep the bot private and `permissionMode` on `auto`.
- Turn on two-factor authentication on your Discord account.

---

## ⚙️ How it works

- **`bridge.mjs`**: the bot. It holds a Gateway WebSocket connection to Discord using Node's built-in `WebSocket`, and calls the REST API with `fetch`. For each message, it runs `claude -p --resume <session> --output-format stream-json` in the project folder, reads the result, and posts it back.
- **`sessions.mjs`**: reads the Claude app's conversation files in `%USERPROFILE%\.claude\projects\`: titles, folders and recent exchanges. Only the start and end of each file are read, since they can be very large.
- **`split.mjs`**: splits answers into messages of 2000 characters or fewer, closing and reopening code blocks across messages.
- **`state.json`** (created on first run, git-ignored): which channel maps to which conversation and folder.

## ⚠️ Good to know

- One request at a time **per channel**. If you write while Claude is working, the bot asks you to wait for the ✅.
- Claude can't ask you for permission through Discord. In `auto` mode it does what is safe and tells you what it refused.
- Don't write in **the same** conversation from the app and from Discord at the same time.
- Conversations started from Discord don't show up in the app's sidebar on their own. Resume them on the PC with `claude --resume` in the project folder.
- It uses your Claude plan, exactly like Claude Code in a terminal.

---

## ❤️ Support

If ClaudeCord saves you time, you can support my work on [GitHub Sponsors](https://github.com/sponsors/MashiroW).
