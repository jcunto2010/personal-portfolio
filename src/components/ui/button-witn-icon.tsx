import { ArrowUpRight } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../lib/utils'

interface ButtonWithIconProps {
  label: string
  variant?: 'default' | 'outline' | 'secondary'
  onClick?: () => void
  className?: string
}

const ButtonWithIconDemo = ({
  label,
  variant = 'default',
  onClick,
  className,
}: ButtonWithIconProps) => {
  const isOutline = variant === 'outline'

  return (
    <Button
      variant={variant}
      onClick={onClick}
      className={cn(
        'relative text-sm min-[1440px]:text-base font-medium rounded-full h-12 min-[1440px]:h-14 p-1 min-[1440px]:p-1.5 ps-6 min-[1440px]:ps-7 pe-14 min-[1440px]:pe-16 group transition-all duration-500 hover:ps-14 hover:pe-6 min-[1440px]:hover:ps-16 min-[1440px]:hover:pe-7 w-fit overflow-hidden cursor-pointer border',
        isOutline
          ? 'bg-[#070B1A] text-[#F5F7FF] border-[#F5F7FF]/25 hover:bg-[#101935]'
          : 'bg-[#5B21B6] text-[#F5F7FF] border-[#5B21B6] hover:bg-[#6D28D9]',
        className,
      )}
    >
      <span className="relative z-10 transition-all duration-500">{label}</span>
      <div
        className={cn(
          'absolute right-1 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45',
          'min-[1440px]:w-11 min-[1440px]:h-11 min-[1440px]:group-hover:right-[calc(100%-48px)]',
          isOutline
            ? 'bg-[#F5F7FF] text-[#070B1A]'
            : 'bg-[#F5F7FF] text-[#070B1A]',
        )}
      >
        <ArrowUpRight size={16} />
      </div>
    </Button>
  )
}

export default ButtonWithIconDemo
