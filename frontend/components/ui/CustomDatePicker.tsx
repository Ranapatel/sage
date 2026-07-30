'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

interface CustomDatePickerProps {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  onChange: (start: string, end: string) => void
  labelStart?: string
  labelEnd?: string
  className?: string
}

export default function CustomDatePicker({
  startDate,
  endDate,
  onChange,
  labelStart = 'Depart',
  labelEnd = 'Return',
  className = ''
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeInput, setActiveInput] = useState<'start' | 'end'>('start')
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize month from startDate if set
  useEffect(() => {
    if (startDate) {
      const d = new Date(startDate)
      if (!isNaN(d.getTime())) {
        setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1))
      }
    }
  }, [startDate])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Helper formatting
  // Helper formatting with deterministic arrays to avoid locale SSR mismatch
  const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return null
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0])
      const month = parseInt(parts[1]) - 1
      const day = parseInt(parts[2])
      const d = new Date(year, month, day)
      if (!isNaN(d.getTime())) {
        return `${DAY_SHORT[d.getDay()]}, ${MONTH_SHORT[month]} ${day}`
      }
    }
    return dateStr
  }

  // Calendar math
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleDateClick = (dayNumber: number) => {
    const selectedDateObj = new Date(year, month, dayNumber)
    selectedDateObj.setHours(0, 0, 0, 0)
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDateObj.getTime() < today.getTime()) return

    if (activeInput === 'start') {
      if (endDate && new Date(formatted) > new Date(endDate)) {
        onChange(formatted, '')
      } else {
        onChange(formatted, endDate)
      }
      setActiveInput('end')
    } else {
      if (startDate && new Date(formatted) < new Date(startDate)) {
        onChange(formatted, '')
        setActiveInput('end')
      } else {
        onChange(startDate, formatted)
        setIsOpen(false)
      }
    }
  }

  const handlePreset = (daysToAdd: number) => {
    const today = new Date()
    const startStr = startDate || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const parts = startStr.split('-')
    const startD = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    const endD = new Date(startD.getTime() + daysToAdd * 86400000)
    
    const formattedStart = `${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, '0')}-${String(startD.getDate()).padStart(2, '0')}`
    const formattedEnd = `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, '0')}-${String(endD.getDate()).padStart(2, '0')}`
    
    onChange(formattedStart, formattedEnd)
    setIsOpen(false)
  }

  const startFormatted = formatDateLabel(startDate)
  const endFormatted = formatDateLabel(endDate)

  const todayObj = new Date()
  todayObj.setHours(0, 0, 0, 0)

  return (
    <div className={`relative ${className}`} ref={containerRef} suppressHydrationWarning>
      {/* Input Field Triggers */}
      <div className="flex items-center gap-2 w-full" suppressHydrationWarning>
        {/* Depart Trigger */}
        <button
          type="button"
          onClick={() => {
            setActiveInput('start')
            setIsOpen(true)
          }}
          className="flex-1 text-left outline-none cursor-pointer group"
          suppressHydrationWarning
        >
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] block mb-0.5 cursor-pointer">
            {labelStart}
          </label>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A]">
            <CalendarIcon size={14} className="text-[#EA580C] shrink-0" />
            <span className={startFormatted ? 'font-bold text-[#1A1A1A]' : 'text-[#A1A1AA]'}>
              {startFormatted || 'Add date'}
            </span>
          </div>
        </button>

        <div className="w-px bg-[#E8E0D8] h-7 self-center mx-1" />

        {/* Return Trigger */}
        <button
          type="button"
          onClick={() => {
            setActiveInput('end')
            setIsOpen(true)
          }}
          className="flex-1 text-left outline-none cursor-pointer group"
          suppressHydrationWarning
        >
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B] block mb-0.5 cursor-pointer">
            {labelEnd}
          </label>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A]">
            <CalendarIcon size={14} className="text-[#EA580C] shrink-0" />
            <span className={endFormatted ? 'font-bold text-[#1A1A1A]' : 'text-[#A1A1AA]'}>
              {endFormatted || 'Add date'}
            </span>
          </div>
        </button>
      </div>

      {/* Popover Calendar Modal */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[9999] w-[310px] sm:w-[340px] bg-white border border-[#E8E0D8] rounded-[24px] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-xl animate-fade-in text-left">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E8E0D8]">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-full border border-[#E8E0D8] bg-[#FFFBF7] hover:bg-white flex items-center justify-center text-[#1A1A1A] shadow-2xs transition-transform active:scale-95"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <div className="text-center">
              <span className="font-display font-extrabold text-sm text-[#1A1A1A]">
                {monthNames[month]} {year}
              </span>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-full border border-[#E8E0D8] bg-[#FFFBF7] hover:bg-white flex items-center justify-center text-[#1A1A1A] shadow-2xs transition-transform active:scale-95"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-[11px] font-extrabold uppercase tracking-wider text-[#1A1A1A]">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="w-8 h-8" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1
              const dateObj = new Date(year, month, dayNum)
              dateObj.setHours(0, 0, 0, 0)
              const formattedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`

              const isPast = dateObj.getTime() < todayObj.getTime()
              const isStart = startDate === formattedDateStr
              const isEnd = endDate === formattedDateStr
              const isInRange = startDate && endDate && formattedDateStr > startDate && formattedDateStr < endDate

              let cellStyle = 'text-[#1A1A1A] font-bold hover:bg-[#EA580C] hover:text-white rounded-full'
              if (isPast) {
                cellStyle = 'text-[#A1A1AA] cursor-not-allowed opacity-40'
              } else if (isStart || isEnd) {
                cellStyle = 'bg-[#EA580C] text-white font-extrabold rounded-full shadow-md scale-105'
              } else if (isInRange) {
                cellStyle = 'bg-[#FFF4EE] text-[#EA580C] font-bold rounded-none'
              }

              return (
                <button
                  key={dayNum}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDateClick(dayNum)}
                  className={`w-8 h-8 text-xs flex items-center justify-center transition-all ${cellStyle}`}
                >
                  {dayNum}
                </button>
              )
            })}
          </div>

          {/* Presets Bar */}
          <div className="mt-4 pt-3 border-t border-[#E8E0D8] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePreset(3)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF4EE] text-[#EA580C] border border-[#FED7AA] hover:bg-[#EA580C] hover:text-white transition-all active:scale-95"
              >
                +3 Days
              </button>
              <button
                type="button"
                onClick={() => handlePreset(7)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF4EE] text-[#EA580C] border border-[#FED7AA] hover:bg-[#EA580C] hover:text-white transition-all active:scale-95"
              >
                +1 Week
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onChange('', '')
                setIsOpen(false)
              }}
              className="text-[11px] font-bold text-[#6B6B6B] hover:text-[#EA580C]"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
