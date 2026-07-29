import { ModeToggle } from './mode-toggle'
import Brand from './brand'

const Header = () => {
  return (
    <header className="bg-background/60 sticky top-0 left-0 z-10 flex h-(--header-height) items-center justify-between px-4 backdrop-blur-md">
      <div className="header-left">
        <Brand />
      </div>
      <div className="header-right">
        <ModeToggle />
      </div>
    </header>
  )
}

export default Header
