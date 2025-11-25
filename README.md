# Venezia (베네치아)

A retro-style typing game built with React, TypeScript, and Supabase.

![Venezia Game Screen](https://via.placeholder.com/800x600?text=Venezia+Game+Screen)

## 🎮 Game Description

Venezia is a classic typing defense game where words fall from the top of the screen. Your goal is to type the words before they reach the bottom (the water). As you progress, the game becomes faster and more challenging with special "Virus" words that have various effects.

## ✨ Key Features

-   **Retro UI**: A nostalgic design reminiscent of classic PC operating systems.
-   **Dynamic Gameplay**:
    -   **Item Words**: Clear them to get special effects (e.g., slow down time, clear screen).
    -   **Virus Words**: Watch out for penalties if you miss them!
-   **Ranking System**:
    -   **Real-time Leaderboards**: View Top 10 rankings for "Weekly", "Monthly", and "All Time" periods.
    -   **New Record Badge**: Get instant feedback when you achieve a personal best score.
-   **Data Persistence**: All game results are securely stored in Supabase for historical analysis.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Vite
-   **State Management**: Zustand, TanStack Query (React Query)
-   **Database**: Supabase (PostgreSQL)
-   **Styling**: CSS Modules / Vanilla CSS

## 🚀 Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   pnpm (recommended) or npm/yarn
-   Supabase account and project

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/venezia.git
    cd venezia
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**
    ```bash
    pnpm dev
    ```

5.  **Build for production**
    ```bash
    pnpm build
    ```

## 📂 Project Structure

```
venezia/
├── src/
│   ├── components/     # UI Components (GameScreen, RankingModal, etc.)
│   ├── domains/        # Domain logic and types
│   ├── hooks/          # Custom React hooks (useGameEffects, etc.)
│   ├── lib/            # Utilities and API functions (Supabase client)
│   ├── store/          # Global state management (Zustand)
│   └── ...
├── query/              # SQL scripts for database schema and RPCs
├── public/             # Static assets
└── ...
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
