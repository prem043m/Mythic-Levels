import { getGateByPosition } from '@/data/catalog'
import { useGameStore } from '@/store/useGameStore'
import { getGateMastery } from '@/services/progression/engine'
import { recommendNextPractice } from '@/services/progression/recommend'
import { levelFromXp } from '@/services/progression/xp'
import {
  ArcanaOverview, CurrentJourneyPanel, DailyQuestPreview, MilestonePanel, WorldTreePreview,
} from '@/components/WorldChamber'

export default function Dashboard() {
  const game = useGameStore((state) => state.game)
  if (!game) return null
  const { player } = game
  const gate = getGateByPosition(player.currentArcana, player.currentGate)
  const recommendation = recommendNextPractice(game)
  const mastery = gate ? getGateMastery(game, gate.id).mastery : 0
  const level = levelFromXp(player.xp)
  return (
    <div className="world-chamber-page">
      <section className="chamber-introduction">
        <div className="introduction-mark" aria-hidden="true">✦</div>
        <p className="world-eyebrow">The chamber is open · Level {level.level}</p>
        <h1>The World Chamber</h1>
        <p className="introduction-copy">
          {gate ? `Seeker ${player.name}, the ${gate.name} waits within ${player.currentArcana}. Your next step is already before you.` : `Seeker ${player.name}, your path through the World is ready to unfold.`}
        </p>
      </section>
      <ArcanaOverview game={game} />
      <WorldTreePreview game={game} />
      <div className="chamber-lower-grid">
        <CurrentJourneyPanel game={game} gate={gate} mastery={mastery} recommendation={recommendation} />
        <DailyQuestPreview game={game} recommendation={recommendation} />
      </div>
      <MilestonePanel game={game} gate={gate} mastery={mastery} recommendation={recommendation} />
    </div>
  )
}
