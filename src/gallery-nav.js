function mountGalleryArrows() {
  document.querySelectorAll('.gallery').forEach(gallery => {
    if (gallery.querySelector('.gallery-arrow')) return
    const thumbnails = [...gallery.querySelectorAll('.thumbs button')]
    if (thumbnails.length < 2) return
    let index = 0
    const goTo = nextIndex => {
      index = (nextIndex + thumbnails.length) % thumbnails.length
      thumbnails[index].click()
    }
    const previous = document.createElement('button')
    previous.className = 'gallery-arrow gallery-prev'
    previous.setAttribute('aria-label', 'Previous product image')
    previous.innerHTML = '<span aria-hidden="true">‹</span>'
    previous.addEventListener('click', () => goTo(index - 1))
    const next = document.createElement('button')
    next.className = 'gallery-arrow gallery-next'
    next.setAttribute('aria-label', 'Next product image')
    next.innerHTML = '<span aria-hidden="true">›</span>'
    next.addEventListener('click', () => goTo(index + 1))
    gallery.append(previous, next)
    thumbnails.forEach((thumbnail, thumbnailIndex) => thumbnail.addEventListener('click', () => { index = thumbnailIndex }))
  })
}

const galleryObserver = new MutationObserver(mountGalleryArrows)
galleryObserver.observe(document.body, { childList: true, subtree: true })
mountGalleryArrows()
