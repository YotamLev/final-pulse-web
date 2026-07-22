# Final Pulse — Web

React + TypeScript rebuild of Final Pulse 2E, a Vampire TTRPG character builder/sheet/struggle-tracker.

A ground-up rebuild of the original Streamlit app ([Final_Pulse_App](https://github.com/YotamLev/Final_Pulse_App)), fully client-side — no backend, character data persisted to browser `localStorage`.

## Stack

- Vite + React + TypeScript
- Zustand (`persist` middleware → `localStorage`)
- Vitest for unit tests

## Development

```
npm install
npm run dev      # dev server
npm test         # run tests
npm run build    # production build
```

Deployed via Vercel — every push to `main` auto-deploys.
