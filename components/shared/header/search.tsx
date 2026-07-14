'use client'
import { SearchIcon } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function Search({
  categories,
  siteName,
  placeholder,
  allLabel,
}: {
  categories:  string[]
  siteName:    string
  placeholder: string
  allLabel:    string
}) {
  const [query,       setQuery]       = useState('')
  const [category,    setCategory]    = useState('all')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open,        setOpen]        = useState(false)
  const router = useRouter()
  const ref    = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch suggestions
  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); setOpen(false); return }
    const timer = setTimeout(async () => {
      try {
        const cat = category !== 'all' ? `&category=${category}` : ''
        const res  = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(query)}${cat}`
        )
        const data = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0)
      } catch { setSuggestions([]) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, category])

  const handleSearch = (term: string) => {
    setOpen(false)
    setQuery(term)
    const cat = category !== 'all' ? `&category=${encodeURIComponent(category)}` : ''
    router.push(`/search?q=${encodeURIComponent(term)}${cat}`)
  }

  return (
    <div ref={ref} className='relative flex-1'>
      <form
        onSubmit={e => { e.preventDefault(); handleSearch(query) }}
        className='flex items-stretch h-10'
      >
        {/* Category selector */}
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className='w-auto h-full bg-gray-100 text-black border-r
                     rounded-l-md px-2 text-sm outline-none'
        >
          <option value='all'>{allLabel}</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Search input */}
        <input
          type='text'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className='flex-1 bg-gray-100 text-black text-sm px-4
                     outline-none h-full'
        />

        {/* Submit button */}
        <button
          type='submit'
          className='h-full px-3 py-2 rounded-r-md'
          style={{ background: '#FABB02' }}
        >
          <SearchIcon className='w-5 h-5 text-black' />
        </button>
      </form>

      {/* Autocomplete dropdown */}
      {open && suggestions.length > 0 && (
        <div className='absolute top-full left-0 right-0 bg-white border
                        border-gray-200 rounded-lg shadow-xl z-50 mt-1
                        max-h-64 overflow-y-auto'>
          {suggestions.map((s, i) => (
            <button
              key={i}
              type='button'
              onClick={() => handleSearch(s)}
              className='w-full text-left px-4 py-2 text-sm text-gray-900
           hover:bg-[#F5F5F5] flex items-center gap-2
           transition-colors'
            >
              <SearchIcon size={13} className='text-gray-400 shrink-0' />
              <span
                dangerouslySetInnerHTML={{
                  __html: s.replace(
                    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                    '<strong>$1</strong>'
                  ),
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}