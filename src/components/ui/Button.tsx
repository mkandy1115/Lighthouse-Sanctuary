import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-brand-bronze text-white hover:bg-brand-bronze-light shadow-bronze',
  secondary:
    'border border-brand-border bg-white text-brand-charcoal hover:border-brand-bronze/40 hover:bg-brand-stone',
  ghost:
    'text-brand-charcoal hover:bg-brand-stone',
  danger:
    'bg-red-600 text-white hover:bg-red-700',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-sm',
}

type SharedProps = {
  children: ReactNode
  className?: string
  variant?: Variant
  size?: Size
}

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: never
    href?: never
  }

type LinkButtonProps = SharedProps &
  LinkProps & {
    href?: never
  }

type AnchorButtonProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    to?: never
  }

function classes(variant: Variant, size: Size, className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bronze focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variantStyles[variant],
    sizeStyles[size],
    className,
  )
}

export function Button(props: ButtonProps | LinkButtonProps | AnchorButtonProps) {
  const { children, className, variant = 'primary', size = 'md' } = props as SharedProps

  if ('to' in props && props.to) {
    const { to, ...linkProps } = props
    return (
      <Link to={to} className={classes(variant, size, className)} {...linkProps}>
        {children}
      </Link>
    )
  }

  if ('href' in props && props.href) {
    const { href, ...anchorProps } = props
    return (
      <a href={href} className={classes(variant, size, className)} {...anchorProps}>
        {children}
      </a>
    )
  }

  const buttonProps = props as ButtonProps
  return (
    <button className={classes(variant, size, className)} {...buttonProps}>
      {children}
    </button>
  )
}

export default Button
