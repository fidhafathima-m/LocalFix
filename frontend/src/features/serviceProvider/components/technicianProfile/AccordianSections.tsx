import React, { useState } from 'react'
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
interface AccordionSectionProps {
  title: string
  number: number
  children: React.ReactNode
  defaultOpen?: boolean
}
const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  number,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <span className="font-medium">
            {number}. {title}
          </span>
        </div>
        <KeyboardArrowUpOutlinedIcon
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`}
        />
      </button>
      <div
        className={`transition-all duration-300 ${isOpen ? 'max-h-[2000px]' : 'max-h-0'} overflow-hidden`}
      >
        <div className="p-6 border-t">{children}</div>
      </div>
    </div>
  )
}
export default AccordionSection
