import React from 'react'
import { ModeToggle } from './mode-toggle'

const Header = () => {
  return (
    <div>
      <div className="flex h-14 w-full  flex-row justify-end items-center border-b border-border bg-sidebar px-4 py-2">
        <ModeToggle/>
     </div>
    </div>
  )
}

export default Header
