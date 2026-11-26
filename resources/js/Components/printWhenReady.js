export function printWhenReady() {
  let active = true
  const images = Array.from(document.images, image => image.decode ? image.decode().catch(() => {}) : Promise.resolve())
  Promise.all([document.fonts?.ready, ...images]).then(() => {
    requestAnimationFrame(() => { if (active) window.print() })
  })
  return () => { active = false }
}
