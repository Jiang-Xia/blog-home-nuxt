import { useMainStore } from '~/stores'

export default defineNuxtPlugin(({ $pinia, }) => {
  return {
    provide: {
      store: useMainStore($pinia),
    },
  }
})
