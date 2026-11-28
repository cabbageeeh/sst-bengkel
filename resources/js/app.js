import { createInertiaApp, router } from '@inertiajs/svelte'
import { mount } from 'svelte'
import AppShell from './Components/AppShell.svelte'
import AuthShell from './Components/AuthShell.svelte'
import './management.css'

const pages = import.meta.glob('./Pages/**/*.svelte', { eager: true })

// Keep same-page filters fast. Document navigation avoids the legacy adapter
// passing a new page's props into the outgoing Svelte component.
router.on('before', event => {
  const visit = event.detail.visit
  if (visit.method === 'get' && visit.url.pathname !== window.location.pathname) {
    event.preventDefault()
    window.location.assign(visit.url.href)
  }
})

createInertiaApp({
  resolve: name => {
    const component = pages[`./Pages/${name}.svelte`]
    if (!component) throw new Error(`Halaman tidak ditemukan: ${name}`)
    if (name.endsWith('/pdf') || name.endsWith('/print')) return component
    return {
      ...component,
      layout: (h, child) => h(name.startsWith('auth/') ? AuthShell : AppShell, {pageName:name, user:child.props.user || {}}, [child])
    }
  },
  setup({ el, App, props }) {
    el.classList.add('min-h-screen');
    mount(App, { target: el, props })
  },
})

document.documentElement.classList.remove('dark')
