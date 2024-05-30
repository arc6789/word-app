import {useState, useEffect} from 'react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "./convex/_generated/api";
import { Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Word from "./pages/wordGenerator"
import WordGame from './pages/wordGame'; 
import Navbar from './pages/navbar';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Word/>} />
        <Route path="/wordGame" element={<WordGame/>} />
      </Routes>
    </div>
  );
}

export default App;
