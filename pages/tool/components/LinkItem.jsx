import './index.less'
export function LinkItem (props, context) {
  const item = props.item
  return (
    <NuxtLink to={item.path} title={item.title} class="link-item">
      <xia-icon width="40px" height="40px" icon={item.icon} />
      <span class="mt-2">{item.title}</span>
    </NuxtLink>
  )
}
