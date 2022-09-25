import Vconsole from 'vconsole'
import { isMobile } from '~~/utils/tool'
const mode = import.meta.env.MODE

export default defineNuxtPlugin((nuxtApp) => {
  if (mode === 'development' && isMobile()) {
    const vc = new Vconsole()
    // console.log()
  }
})
