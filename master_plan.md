# Hevy Workout Data Visualization - Master Plan

## Goal Description
The goal is to build a beautiful, rich, and dynamic data visualization dashboard web application to track and visualize workout data provided in `workout_data.csv`. The dashboard will wow the user with a premium aesthetic (modern typography, gradients, glassmorphism, smooth animations) and provide actionable insights into their fitness progression. 

## 1. Architecture & Tech Stack
- **Framework**: Vite + React + TypeScript (for strong typing of workout sets & summaries, keeping things maintainable).
- **Styling**: Vanilla CSS with modern features (CSS Variables for theming/palettes, Grid/Flexbox, dynamic animations, hover effects) to achieve a highly customized premium look (no Tailwind CSS).
- **Data Parsing**: `papaparse` for reading and normalizing the CSV data directly on the client-side.
- **Date Handling**: `date-fns` or native `Intl.DateTimeFormat` for parsing and styling the dates properly.
- **Visualizations**: `recharts` for clean, responsive, and highly customizable React-based charts.

---

## 2. Data Processing Strategy
The raw dataset (`workout_data.csv`) is flat and set-based. We will process it into these formats when loading the app:

1. **Clean Data**: Fill missing `weight_kg` for bodyweight exercises with implicit weight (or 0). Parse timestamp strings like `"8 Apr 2026, 16:50"` into JavaScript Date objects.
2. **Aggregations**:
    - **By Workout**: Total volume (weight x reps x sets), total duration, total sets.
    - **By Exercise**: Timeline of volume per exercise, highest weight lifted per session, frequency.
    - **By Muscle Group**: Hardcode a map grouping the raw `exercise_title` (e.g., Pull Up, Preacher Curl, Bench Press) to parent groups (Chest, Back, Legs, Shoulders, Arms).

---

## 3. UI/UX & Design System
We will create a visually stunning dashboard with:
- **Color Palette**: A "Dark Mode First" premium look using rich, deep backgrounds (e.g., midnight blue, very dark slate) combined with vibrant accent gradients.
- **Typography**: Inter (or Outfit) from Google Fonts for clean numerical displays and readable labels.
- **Containers**: Glassmorphism (translucency + backdrop-filter blur) on stat cards and graph containers.
- **Micro-Animations**: Setup subtle fade-ins, smooth line drawings on charts, and reactive hover scaling effects on buttons/cards.

---

## 4. Proposed Application Structure/Phases

### Phase 1: Setup & Foundation
- Initialize Vite + React project.
- Create CSV loading, processing, and parsing modules inside a `utils` folder.

### Phase 2: Design System & Styling
- Populate `index.css` defining the CSS Custom Properties.
- Create dashboard structural components: `Sidebar`, `TopNavigation`, `DashboardLayout`, and glassmorphic `Card` components.

### Phase 3: Core Dashboard Features
- **Overview Cards**: Total workouts, total volume to date, current highest duration.
- **Volume Timeline Chart**: An Area chart visualizing volume lifted per session over time.
- **Muscle Split Chart**: A pie or radial chart showing how much effort went into each muscle group.

### Phase 4: Drill-Down capabilities
- An exercise breakdown view to filter metrics by specific exercises.

---

## Next Steps Before Execution:
Answer the open questions proposed in the conversation, specifically about your preferred accent color, and approve the plan!
