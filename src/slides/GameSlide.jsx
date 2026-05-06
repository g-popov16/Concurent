import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './GameSlide.css'

gsap.registerPlugin(useGSAP)

export default function GameSlide({ slide }) {
  const Component = slide.component
  const slideRef = useRef(null)

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.game-slide-part', { autoAlpha: 0, x: -18, duration: 0.32 })
      .from('.game-slide-title', { autoAlpha: 0, y: 20, filter: 'blur(8px)', duration: 0.5 }, '-=0.14')
      .from('.game-slide-body > *', { autoAlpha: 0, y: 24, scale: 0.985, duration: 0.52 }, '-=0.2')
  }, { scope: slideRef, dependencies: [slide.id], revertOnUpdate: true })

  return (
    <div className="game-slide" ref={slideRef}>
      <div className="game-slide-header">
        <span className="game-slide-part">Part {slide.part}</span>
        <h2 className="game-slide-title">{slide.title}</h2>
      </div>
      <div className="game-slide-body">
        <Component />
      </div>
    </div>
  )
}
