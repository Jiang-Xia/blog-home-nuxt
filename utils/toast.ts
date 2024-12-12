import { useToast } from 'tailvue'

let showMsgLoading = false
export const messageDanger = (msg: string, timeout = 1) => {
  if (showMsgLoading) {
    return
  }
  if (process.client) {
    const $toast = useToast()
    $toast.show({
      type: 'danger',
      timeout,
      message: msg,
    })
    showMsgLoading = true
    setTimeout(() => {
      showMsgLoading = false
    }, 1000)
  }
}
export const messageSuccess = (msg = '', timeout = 1) => {
  if (showMsgLoading) {
    return
  }
  if (process.client) {
    const $toast = useToast()
    $toast.show({
      type: 'success',
      timeout,
      message: msg,
    })
    showMsgLoading = true
  }
  setTimeout(() => {
    showMsgLoading = false
  }, 1000)
}
