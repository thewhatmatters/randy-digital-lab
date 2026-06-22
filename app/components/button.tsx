import { ReactNode } from 'react'
import styles from './button.module.scss'

type Variant = 'default' | 'accent'

type BaseProps = {
  variant?: Variant
  /** Leading icon — always rendered on the left, before the label. */
  icon?: ReactNode
  /** Trailing icon — rendered on the right, after the label (e.g. the ↗ on
   *  external links). Slides out diagonally on hover. */
  trailingIcon?: ReactNode
  children: ReactNode
  className?: string
  'aria-label'?: string
}

type LinkProps = BaseProps & {
  href: string
  /** Defaults to true for absolute http(s) URLs. */
  external?: boolean
}

type ButtonProps = BaseProps & {
  onClick?: () => void
  type?: 'button' | 'submit'
}

/**
 * Shared mono button used across the site (lab "Copy prompt", note-rail CTAs).
 * Renders as an <a> when `href` is given, otherwise a <button>. The icon is
 * always leading (left) so every button reads consistently.
 */
export function Button(props: LinkProps | ButtonProps) {
  const { variant = 'default', icon, trailingIcon, children, className } = props
  const classes = [styles.btn, styles[variant], className].filter(Boolean).join(' ')

  const inner = (
    <>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {trailingIcon && (
        <span className={styles.trailing} aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </>
  )

  if ('href' in props && props.href) {
    const isExternal = props.external ?? /^https?:\/\//.test(props.href)
    return (
      <a
        className={classes}
        href={props.href}
        aria-label={props['aria-label']}
        {...(isExternal
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
      >
        {inner}
      </a>
    )
  }

  const { type = 'button', onClick } = props as ButtonProps
  return (
    <button
      className={classes}
      type={type}
      onClick={onClick}
      aria-label={props['aria-label']}
    >
      {inner}
    </button>
  )
}
