import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export default function cn(...args: any[]): string {
  return twMerge(clsx(...args))
}
