import React from 'react'
import { createRoot } from 'react-dom/client'
import AdminApp from './Admin'
import './styles.css'
import './admin-overrides.css'

createRoot(document.getElementById('admin-root')).render(<React.StrictMode><AdminApp /></React.StrictMode>)
