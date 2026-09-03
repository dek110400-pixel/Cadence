import { render } from 'preact'
import { App } from './app'
import '@fontsource-variable/inter'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/cormorant/500-italic.css'
import '@fontsource/cormorant/600-italic.css'
import './styles/app.css'
import { applyTheme, bootstrap, getState } from './store/store'

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  applyTheme(getState().settings.theme)
})

// evita che iOS chieda "salva password" o simili su input generici
document.addEventListener('gesturestart', (e) => e.preventDefault())

bootstrap().then(() => {
  render(<App />, document.getElementById('app')!)
})
