interface Props {
  username: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
}

export function UserAvatar({ username, color, size = 'md' }: Props) {
  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
      title={username}
    >
      {username[0].toUpperCase()}
    </div>
  )
}
