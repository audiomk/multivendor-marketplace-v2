'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchAutocomplete() {
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open,        setOpen]        = useState(false)
  const [loading,     setLoading]     = useState(false)
  const router  = useRouter()
  const ref     = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res  = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(query)}`
        )
        const data = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = (term: string) => {
    setOpen(false)
    setQuery(term)
    router.push(`/search?q=${encodeURIComponent(term)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch(query)
  }

  return (
    <div ref={ref} className='relative w-full'>
      <div className='flex'>
        <input
          type='text'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder='Search Indaba Cart...'
          className='flex-1 px-4 py-2 text-black outline-none text-sm
                     rounded-l-lg'
        />
        <button
          onClick={() => handleSearch(query)}
          className='px-4 py-2 rounded-r-lg font-bold transition'
          style={{ background: '#FABB02', color: '#000' }}
        >
          <Search size={18} />
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className='absolute top-full left-0 right-0 bg-white border
                        border-gray-200 rounded-lg shadow-xl z-50 mt-1
                        max-h-64 overflow-y-auto'>
          {loading ? (
            <div className='px-4 py-3 text-sm text-gray-400'>
              Searching...
            </div>
          ) : (
            suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSearch(s)}
                className='w-full text-left px-4 py-2 text-sm hover:bg-[#F5F5F5]
                           flex items-center gap-2 transition-colors'
              >
                <Search size={14} className='text-gray-400 shrink-0' />
                <span dangerouslySetInnerHTML={{
                  __html: s.replace(
                    new RegExp(`(${query})`, 'gi'),
                    '<strong>$1</strong>'
                  )
                }} />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}