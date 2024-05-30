import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { BrowserRouter } from 'react-router-dom';

const convex = new ConvexReactClient(process.env.REACT_APP_CONVEX_URL);
// console.log(process.env.REACT_APP_CONVEX_URL)
console.log(convex)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
