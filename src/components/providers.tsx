import { ThemeProvider } from './theme-provider'
import { TooltipProvider } from './ui/tooltip'
import { Toaster } from './ui/sonner'
import { ReactNode } from 'react'

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
    </ThemeProvider>
  )
}

export default Providers
