import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './overrides.css'
import './track-demo'
import './wishlist'
import './size-guide'
import './gallery-nav'

document.addEventListener('click', event => {
	const announcementClose = event.target.closest('.announcement button')
	if (announcementClose) {
		announcementClose.closest('.announcement')?.classList.add('announcement-dismissed')
		localStorage.setItem('noir-announcement-dismissed', 'true')
		return
	}
	const button = event.target.closest('.add-detail, .quick-add')
	if (!button) return
	button.classList.remove('cart-clicked')
	void button.offsetWidth
	button.classList.add('cart-clicked')
	window.setTimeout(() => button.classList.remove('cart-clicked'), 700)
})

if (localStorage.getItem('noir-announcement-dismissed') === 'true') {
	document.documentElement.classList.add('announcement-was-dismissed')
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
