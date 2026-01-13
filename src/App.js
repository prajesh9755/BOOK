import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// --- CONFIGURATION ---
const ADMIN_ID = "admin123";
const ADMIN_PASS = "edit789";
const VIEW_ID = "guest123";
const VIEW_PASS = "view456";

export default function App() {
  const [userRole, setUserRole] = useState(null); // 'EDIT' or 'VIEW'
  const [books, setBooks] = useState({ "Book 1": [{ title: "Ch 1", content: "" }] });
  const [activeBook, setActiveBook] = useState("Book 1");
  const [activeChapter, setActiveChapter] = useState(0);
  const [loginInput, setLoginInput] = useState({ id: '', pass: '' });

  const saveToGithub = async () => {
  const token = process.env.REACT_APP_GITHUB_TOKEN;
  const repo = "prajesh9755/BOOK";
  const path = "books.json";

  // 1. Get the current file "SHA" (GitHub requirement)
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`);
  const fileData = await res.json();

  // 2. Send the update
  await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Update book content",
      content: btoa(unescape(encodeURIComponent(JSON.stringify(books)))), // Encodes text correctly
      sha: fileData.sha,
    }),
  });
  alert("Saved successfully!");
};

  // 1. LOGIN HANDLER
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginInput.id === ADMIN_ID && loginInput.pass === ADMIN_PASS) setUserRole('EDIT');
    else if (loginInput.id === VIEW_ID && loginInput.pass === VIEW_PASS) setUserRole('VIEW');
    else alert("Wrong Credentials");
  };

  if (!userRole) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0e0e10]">
        <form onSubmit={handleLogin} className="bg-[#1e1e20] p-8 rounded-xl shadow-xl w-80">
          <h2 className="text-2xl mb-6 text-center font-bold">Sign In</h2>
          <input className="w-full mb-4 p-2 rounded bg-[#2c2c2e] outline-none" placeholder="ID" 
            onChange={e => setLoginInput({...loginInput, id: e.target.value})} />
          <input className="w-full mb-6 p-2 rounded bg-[#2c2c2e] outline-none" type="password" placeholder="Password" 
            onChange={e => setLoginInput({...loginInput, pass: e.target.value})} />
          <button className="w-full bg-blue-600 p-2 rounded font-bold hover:bg-blue-700">Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#131314]">
      {/* Background Music */}
      <audio autoPlay loop src="/music.mp3" />

      {/* SIDEBAR (20%) */}
      <aside className="w-1/5 bg-[#1e1e20] flex flex-col border-r border-[#333]">
        <div className="p-4 border-b border-[#333]">
          <select 
            className="w-full bg-[#2c2c2e] p-2 rounded outline-none cursor-pointer"
            value={activeBook}
            onChange={(e) => { setActiveBook(e.target.value); setActiveChapter(0); }}
          >
            {Object.keys(books).map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs uppercase text-gray-500 font-bold mb-4 tracking-widest">Chapters</h3>
          {books[activeBook].map((ch, index) => (
            <button 
              key={index}
              onClick={() => setActiveChapter(index)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition ${activeChapter === index ? 'bg-[#333] text-white' : 'hover:bg-[#2c2c2e] text-gray-400'}`}
            >
              {ch.title}
            </button>
          ))}
        </div>

        <div className="p-4 text-xs text-gray-600 border-t border-[#333]">
          Logged in as: {userRole}
        </div>
      </aside>

      {/* MAIN CONTENT (80%) */}
      <main className="w-4/5 flex flex-col bg-[#131314]">
        <header className="p-4 flex justify-between items-center border-b border-[#333]">
          <h1 className="text-xl font-medium">{books[activeBook][activeChapter].title}</h1>
          {userRole === 'EDIT' && (
            <button className="bg-blue-600 px-4 py-1 rounded text-sm hover:bg-blue-700">Save to GitHub</button>
          )}
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {userRole === 'EDIT' ? (
            <ReactQuill 
              theme="snow"
              className="h-full text-white pb-12"
              value={books[activeBook][activeChapter].content}
              onChange={(val) => {
                let newBooks = {...books};
                newBooks[activeBook][activeChapter].content = val;
                setBooks(newBooks);
              }}
            />
          ) : (
            <div 
              className="prose prose-invert lg:prose-xl max-w-none"
              dangerouslySetInnerHTML={{ __html: books[activeBook][activeChapter].content }} 
            />
          )}
        </div>
      </main>
    </div>
  );
}