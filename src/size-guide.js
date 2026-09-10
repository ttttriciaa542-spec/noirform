function closeSizeGuide() {
  document.querySelector('.size-guide-modal')?.remove()
}

document.addEventListener('click', event => {
  if (event.target.closest('.size-guide-close, .size-guide-backdrop')) {
    closeSizeGuide()
    return
  }
  const trigger = event.target.closest('.size-guide')
  if (!trigger) return
  event.preventDefault()
  if (document.querySelector('.size-guide-modal')) return
  const sizes = [...document.querySelectorAll('.size-options button')].map(button => button.textContent.trim())
  const columns = sizes.length ? sizes : ['XS', 'S', 'M', 'L']
  const rows = [
    ['Bust', '82–86 cm', '86–90 cm', '90–94 cm', '94–100 cm'],
    ['Waist', '62–66 cm', '66–70 cm', '70–76 cm', '76–82 cm'],
    ['Hip', '88–92 cm', '92–96 cm', '96–102 cm', '102–108 cm']
  ]
  const modal = document.createElement('div')
  modal.className = 'size-guide-modal'
  modal.innerHTML = `<div class="size-guide-backdrop"></div><section class="size-guide-panel" role="dialog" aria-modal="true" aria-labelledby="size-guide-title"><button class="size-guide-close" aria-label="Close size guide">×</button><p class="eyebrow">NOIR/FORM / FIT</p><h2 id="size-guide-title">Size guide</h2><p class="size-guide-intro">Measure around the fullest part of your body. If you are between sizes, we recommend choosing the larger size for an easier fit.</p><div class="size-table"><div class="size-table-row size-table-head"><span>Measure</span>${columns.map(size => `<b>${size}</b>`).join('')}</div>${rows.map(([label, ...values]) => `<div class="size-table-row"><strong>${label}</strong>${columns.map((_, index) => `<span>${values[index] || values[values.length - 1]}</span>`).join('')}</div>`).join('')}</div><p class="size-guide-note">Need help choosing? Email <a href="mailto:hello@noirform.co">hello@noirform.co</a></p></section>`
  document.body.appendChild(modal)
})
