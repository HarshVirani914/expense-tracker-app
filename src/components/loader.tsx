import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type LoaderProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export const Loader = ({ size = 'md', className, text }: LoaderProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

export const PageLoader = ({ text = 'Loading...' }: { text?: string }) => {
  return (
    <div className="flex items-center justify-center h-96">
      <Loader size="lg" text={text} />
    </div>
  )
}

export const InlineLoader = ({ text }: { text?: string }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader size="md" text={text} />
    </div>
  )
}
