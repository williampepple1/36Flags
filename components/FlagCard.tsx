'use client'

import { Card } from '@/lib/types'
import Image from 'next/image'

interface FlagCardProps {
  card: Card
  onClick: () => void
  disabled: boolean
}

export default function FlagCard({ card, onClick, disabled }: FlagCardProps) {
  const getFlagUrl = (country: string) => {
    if (country === 'white') {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="white"/%3E%3C/svg%3E'
    }
    return `https://flagcdn.com/w160/${country}.png`
  }

  return (
    <div
      className={`card-flip ${card.isRevealed || card.isMatched ? 'flipped' : ''} ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={!disabled && !card.isRevealed && !card.isMatched ? onClick : undefined}
    >
      <div className="card-flip-inner">
        {/* Card Back (Hidden) */}
        <div className="card-front bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center border-2 border-white/20 hover:border-white/40 transition-all">
          <div className="text-6xl">🏴</div>
        </div>

        {/* Card Front (Flag) */}
        <div className={`card-back flex items-center justify-center p-2 ${
          card.isMatched ? 'bg-green-500/20 border-2 border-green-500' : 'bg-white/10 border-2 border-white/20'
        }`}>
          <div className="relative w-full h-full">
            <Image
              src={getFlagUrl(card.country)}
              alt={`Flag of ${card.country}`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  )
}
