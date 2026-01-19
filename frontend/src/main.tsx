import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Editor from './pages/Editor'
import Report from './pages/Report'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/editor" element={<Editor />} />
        <Route path="/report/:date" element={<Report />} />
        <Route path="/" element={
          <div style={{ padding: '20px' }}>
            <h1>Email Report System</h1>
            <p>상호작용 가능한 데일리 리포트 시스템</p>
            <ul>
              <li><a href="/editor">차트 에디터</a></li>
              <li><a href="/report/20250119">리포트 예시 (2025-01-19)</a></li>
            </ul>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
