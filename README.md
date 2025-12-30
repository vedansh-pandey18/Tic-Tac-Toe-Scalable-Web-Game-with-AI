# 🎮 Tic Tac Toe – Scalable Web Game with AI

A modern, interactive **Tic Tac Toe web application** built using **HTML, CSS, and Vanilla JavaScript**, featuring dynamic board sizes, AI-powered gameplay, animated winning logic, persistent score tracking, and an elegant glassmorphism UI.

---

## ✨ Features

### 🎯 Core Features
- **Multiple Game Modes** – Player vs Player (PvP) & Player vs Computer (PvC)
- **Dynamic Board Sizes** – 3×3, 4×4, and 5×5 boards
- **AI Opponent** – Easy, Medium, and Hard difficulty levels
- **Minimax Algorithm** – Optimal AI gameplay for 3×3 board
- **Animated Winning Line** – SVG-based animated strike-through
- **Persistent Scores** – Saved using LocalStorage
- **Keyboard Accessibility** – Play using keyboard controls
- **Sound Effects** – Move, win, draw, and UI sounds

---

### 👤 Player Features
- Enter custom player names
- Track scores across multiple rounds
- Visual move previews on hover
- Smooth animations on moves and wins
- Automatic board reset after each round

---

### 🤖 AI Features
- **Easy Mode** – Random valid moves  
- **Medium Mode** – Defensive and winning strategies  
- **Hard Mode** – Minimax algorithm (3×3 only)  
- Smart disabling of unsupported AI levels for larger boards

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** – Semantic structure
- **CSS3** – Grid, animations, glassmorphism UI
- **Vanilla JavaScript** – Game logic and state management
- **SVG** – Precise animated winning lines
- **LocalStorage API** – Persistent state

### Audio
- **HTML5 Audio API**
- **Custom sound effects** for interactions

---

## 📦 Installation

### Prerequisites
- **Any modern web browser** (Chrome, Edge, Firefox)
- **No frameworks or server required**

### Steps
~~~bash
git clone https://github.com/your-username/tic-tac-toe-ai.git
cd tic-tac-toe-ai
~~~

Open **`index.html`** directly in your browser.

---

## 🚀 Usage

### Getting Started
1. Open the game in your browser
2. Select:
   - **Game Mode** (PvP / PvC)
   - **Board Size** (3×3, 4×4, 5×5)
   - **AI Difficulty** (if PvC)
3. Enter player names and click **Save**
4. Start playing immediately

---

### 🎮 Controls
- **Mouse Click** – Place move
- **Keyboard**
  - **Enter / Space** – Place move
  - **1–9 keys** – Quick input for 3×3 board
- **Reset Button** – Reset scores and board

---

## 🎨 UI & UX Highlights

- **Glassmorphism-inspired dark theme**
- **Player-based neon color system** (X & O)
- **Hover previews** for better decision-making
- **Animated particle effects** on winning moves
- **Responsive layout** for desktop and mobile
- **Accessible UI** with ARIA roles

---

## 🧠 Game Logic Overview

- Centralized **gameState object** for clean state management
- Scalable **win-detection logic** for N×N boards
- **SVG-based calculation** of exact winning line positions
- **Depth-based Minimax scoring** for optimal AI decisions
- Automatic **draw detection**
- **Event-driven UI updates**

---

## 💾 Persistent Storage

Stored using **LocalStorage**:
- Player names
- Scores
- Match history (last 10 games)
- Game mode, board size, AI difficulty

**State persists across page reloads.**

---

## 🗂️ Project Structure

~~~text
tic-tac-toe/
├── index.html        # Main HTML structure
├── style.css         # Styling, animations, UI themes
├── script.js         # Game logic, AI, state handling
│
├── gameball.wav      # Move sound
├── click.wav         # Button click sound
├── claps.mp3         # Win sound
├── aww.mp3           # Draw sound
├── little-bell.mp3   # UI feedback sound
│
└── README.md         # Project documentation
~~~

---

## 🔐 Accessibility & Quality

- **Keyboard navigable cells**
- **Focus-visible styling**
- **ARIA labels** for screen readers
- **No external dependencies**
- Clean separation of **logic and UI**

---

## 📚 Key Engineering Highlights

- Implemented **Minimax algorithm** for unbeatable AI
- Designed **scalable winner-detection** for variable board sizes
- Used **SVG overlays** for precise animated win indication
- Built **state-driven UI rendering** without frameworks
- Managed **persistent state** using browser storage
- Ensured smooth UX with **animations and audio feedback**

---

## 📚 What I Learned

- Applying **game algorithms** in real UI-driven applications
- Structuring **scalable JavaScript logic** without frameworks
- Handling **animations and SVG rendering** dynamically
- Improving **accessibility and keyboard usability**
- Managing **application state and persistence** in frontend apps

---

## 🚢 Deployment

This project can be deployed easily on:
- **GitHub Pages**
- **Netlify**
- **Vercel**

Simply upload the static files and set **`index.html`** as the entry point.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Vedansh Pandey**  
Built with ❤️ to demonstrate **frontend engineering** and **algorithmic thinking**.

---

📌 Note

This project was built to explore scalable game logic, AI decision-making, and modern UI patterns using plain JavaScript without external frameworks.
