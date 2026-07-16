import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/style.scss'
// 旧スタイルに戻す場合: 上行を消して以下2行を有効化
// import './scss/globals.scss'
// import './index.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
