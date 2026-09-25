# URL Shortener Frontend

React frontend for the cloud-native URL shortener project.

🔗 **Live Demo:** [https://url-shortener-six-eosin.vercel.app](https://url-shortener-six-eosin.vercel.app)

## Tech Stack

- React
- Vite
- Axios
- React Router DOM
- Plain CSS

## Folder Structure

```text
frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── components/
    │   ├── Message.jsx
    │   └── Navbar.jsx
    ├── pages/
    │   ├── Analytics.jsx
    │   ├── Dashboard.jsx
    │   ├── Login.jsx
    │   ├── MyUrls.jsx
    │   └── Register.jsx
    ├── routes/
    │   └── ProtectedRoute.jsx
    ├── services/
    │   ├── api.js
    │   └── authService.js
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

## Run Locally

Start the backend API gateway first. It should be available at:

```text
http://localhost
```

Install dependencies and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## API Base URL

The Axios service uses:

```js
baseURL: "http://localhost"
```

If your API gateway runs on a different host or port, update `src/services/api.js`.
