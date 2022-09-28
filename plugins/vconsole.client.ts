import Vconsole from 'vconsole'
import { isMobile } from '~~/utils/tool'
const mode = import.meta.env.MODE

export default defineNuxtPlugin(() => {
  if (mode === 'development' && isMobile()) {
    const vc = new Vconsole()
    console.warn('vconsole:', vc.version)
  }
})
