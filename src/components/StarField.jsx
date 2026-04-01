import { useMemo } from 'react'

export default function StarField({ count = 120 }) {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left:   Math.random() * 100,
      top:    Math.random() * 100,
      size:   Math.random() * 2.2 + 0.6,
      dur:    (Math.random() * 3 + 2).toFixed(1),
      delay:  (Math.random() * 4).toFixed(1),
      minOp:  (Math.random() * 0.15 + 0.05).toFixed(2),
      maxOp:  (Math.random() * 0.5 + 0.5).toFixed(2),
    }))
  }, [count])

  return (
    <div className="stars-bg">
      {stars.map(s => (
        <div key={s.id} className="star" style={{
          left: `${s.left}%`,
          top:  `${s.top}%`,
          width: `${s.size}px`,
          height: `${s.size}px`,
          '--dur':    `${s.dur}s`,
          '--delay':  `${s.delay}s`,
          '--min-op': s.minOp,
          '--max-op': s.maxOp,
        }} />
      ))}
    </div>
  )
}
