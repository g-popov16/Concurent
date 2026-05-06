import TitleSlide from '../slides/TitleSlide.jsx'
import TheorySlide from '../slides/TheorySlide.jsx'
import GameSlide from '../slides/GameSlide.jsx'
import SummarySlide from '../slides/SummarySlide.jsx'

export default function SlideRenderer({ slide }) {
  switch (slide.type) {
    case 'title':       return <TitleSlide slide={slide} />
    case 'game':
    case 'codegame':
    case 'quiz':        return <GameSlide slide={slide} />
    case 'interactive': return slide.recap
                          ? <SummarySlide slide={slide} />
                          : <GameSlide slide={slide} />
    case 'theory':
    default:            return <TheorySlide slide={slide} />
  }
}
