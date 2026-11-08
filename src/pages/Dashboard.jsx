import { Link } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { getGateByPosition } from '@/data/catalog'
import { getGateMastery } from '@/services/progression/engine'
import { recommendNextPractice } from '@/services/progression/recommend'
import { levelFromXp } from '@/services/progression/xp'
import { WorldLayout } from '@/components/WorldLayout'
import { ArcanaWorldMap, CurrentPathPanel, DailyQuestPanel } from '@/components/WorldChamber'

export default function Dashboard() {
  const game = useGameStore((s) => s.game)
  if (!game) return null
  const { player } = game
  const gate = getGateByPosition(player.currentArcana, player.currentGate)
  const { mastery } = getGateMastery(game, gate.id)
  const recommendation = recommendNextPractice(game)
  const level = levelFromXp(player.xp)
  return (
    <WorldLayout>
      <div className="world-hero">
        <div>
          <p className="world-eyebrow">The chamber is open · Level {level.level}</p>
          <h1>The World Chamber</h1>
          <p>A glimpse of your journey, progress, and next step.</p>
        </div>
        <Link to={`/gate/${gate.id}`} className="mythic-button hero-button">Continue journey <span>→</span></Link>
      </div>
      <ArcanaWorldMap game={game} />
      <div className="world-two-column">
        <CurrentPathPanel game={game} gate={gate} mastery={mastery} recommendation={recommendation} />
        <DailyQuestPanel game={game} recommendation={recommendation} />
      </div>
    </WorldLayout>
  )
}
