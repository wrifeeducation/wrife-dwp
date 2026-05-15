import { Link } from 'react-router-dom'

interface Props {
  variant?: 'on-purple' | 'on-white'
}

/**
 * Consistent home-navigation pill used on every page so a user never
 * gets stuck. The on-purple variant uses translucent white-on-purple,
 * the on-white variant is brand-coloured for plain backgrounds.
 */
export default function HomeNav({ variant = 'on-purple' }: Props) {
  const onPurple = variant === 'on-purple'
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-1.5 text-pwp-xs font-bold px-3 py-1.5 rounded-pwp-pill transition-colors"
      style={onPurple
        ? { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.95)' }
        : { background: 'rgba(108,92,231,0.1)', color: '#3d35a0' }}
    >
      <img src="/mascots/mascot_std_11.png" alt="" width={20} height={20} className="rounded-full" />
      <span>Home</span>
    </Link>
  )
}
