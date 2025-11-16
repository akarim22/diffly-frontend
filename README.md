# Diffly Frontend

Diffly Frontend is a modern React-based web app for visually comparing code changes between two zipped codebase versions — powered by the Diffly Backend.

## Features

- **Compare Two Codebases:** Upload two `.zip` files of your code (versions, branches, etc.) for fast, visual comparison.
- **See What Changed:** Instantly identify added, removed, and modified files.
- **View Diffs Side-by-Side:** Explore line-by-line differences in modified files in a user-friendly layout (powered by [diff2html](https://github.com/rtfpessoa/diff2html)).
- **AI Generated Summary:** Read a plain-English summary of the changes (if backend AI is configured).
- **Download Results:** Export the diff results or AI summary as JSON for further analysis.
- **File Tree Navigation:** Browse and filter files by change status.
- **Collapse/Expand Diffs:** Collapse or expand file diffs for focused review.

## Getting Started

### 1. Install dependencies

```bash
cd diffly-ui
npm install
```

### 2. Start the development server

```bash
npm run dev
```

- The app runs at [http://localhost:5173](http://localhost:5173) (Vite default). Check your terminal for the exact port.

### 3. Connect to backend

- Make sure the [Diffly Backend](https://github.com/akarim22/diffly-backend) is running locally (default at `http://127.0.0.1:8000`).

### 4. Usage

- Open the frontend in your browser.
- Upload two `.zip` files containing your codebase versions via the UI.
- Click "Compare".
- Browse the diff results, explore file changes, and optionally download the summary or diff data.

## Project Structure

- `src/App.jsx` - Main app logic (upload, fetch diff, render results).
- `src/main.jsx` - App entrypoint.
- `index.html`, `vite.config.js` - Vite configuration and bootstrapping.

## Configuration

- By default, the frontend posts files to `http://127.0.0.1:8000/compare`. Change the endpoint in `src/App.jsx` if your backend is elsewhere.
- No authentication or CORS proxy needed in dev if backend/frontend are both local.

## Example Screenshot

*(Add screenshot here if available)*

## Tech Stack

- React (JS/JSX)
- Vite
- diff2html (and CSS)
- Fetch API
- Tailwind CSS or standard CSS modules

## License

*(No license specified yet)*

---

Made by [akarim22](https://github.com/akarim22)
