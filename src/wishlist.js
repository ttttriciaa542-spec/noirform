const storageKey = 'noir-wishlist'

const readWishlist = () => JSON.parse(localStorage.getItem(storageKey) || '[]')
const saveWishlist = items => localStorage.setItem(storageKey, JSON.stringify(items))

function wishlistKey(button) {
  const label = button.getAttribute('aria-label')
  if (label) return label.replace(/^Wishlist\s+/i, '').trim()
  return document.querySelector('.product-copy h1')?.textContent.trim() || window.location.hash
}

function syncWishlist() {
  const items = readWishlist()
  document.querySelectorAll('.heart, .wishlist').forEach(button => {
    const key = wishlistKey(button)
    const selected = items.includes(key)
    button.classList.toggle('wishlisted', selected)
    button.setAttribute('aria-pressed', String(selected))
    button.setAttribute('title', selected ? 'Remove from wishlist' : 'Add to wishlist')
  })
}

document.addEventListener('click', event => {
  const button = event.target.closest('.heart, .wishlist')
  if (!button) return
  const key = wishlistKey(button)
  const items = readWishlist()
  const next = items.includes(key) ? items.filter(item => item !== key) : [...items, key]
  saveWishlist(next)
  syncWishlist()
})

const observer = new MutationObserver(syncWishlist)
observer.observe(document.body, { childList: true, subtree: true })
syncWishlist()

function mountHeaderWishlist() {
  const tools = document.querySelector('.header-tools')
  if (!tools || tools.querySelector('.wishlist-header')) return
  const button = document.createElement('button')
  button.className = 'wishlist-header'
  button.setAttribute('aria-label', 'Open wishlist')
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.5-8.8 10.3-8.8 10.3S3.2 14.3 3.2 8.8A4.3 4.3 0 0 1 11 6.2a4.3 4.3 0 0 1 9.8 2.6Z" /></svg><span></span>'
  tools.insertBefore(button, tools.querySelector('.cart-link'))
  button.addEventListener('click', () => {
    const existing = document.querySelector('.wishlist-popover')
    if (existing) { existing.remove(); return }
    const popover = document.createElement('div')
    popover.className = 'wishlist-popover'
    const items = readWishlist()
    popover.innerHTML = `<strong>Your wishlist</strong>${items.length ? items.map(item => `<span>${item}</span>`).join('') : '<small>Your saved pieces will appear here.</small>'}`
    document.body.appendChild(popover)
  })
}

const headerObserver = new MutationObserver(mountHeaderWishlist)
headerObserver.observe(document.body, { childList: true, subtree: true })
mountHeaderWishlist()

setInterval(() => {
  const badge = document.querySelector('.wishlist-header span')
  if (badge) badge.textContent = readWishlist().length
}, 250)
