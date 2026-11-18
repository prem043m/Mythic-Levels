import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { createInitialState } from '@/services/progression/engine'
import WorldLayout from '@/components/WorldLayout'

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}</output>
}

function renderShell(path = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={<WorldLayout><><p>Page content</p><LocationProbe /></></WorldLayout>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useGameStore.setState({ game: createInitialState({ name: 'Shell test' }) })
})

describe('persistent application shell', () => {
  it('collapses the sidebar without changing the current route', () => {
    renderShell()
    const toggle = screen.getByRole('button', { name: 'Collapse sidebar' })
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard')
    expect(screen.getByRole('link', { name: /The World/ })).toHaveAttribute('href', '/dashboard')
  })

  it('highlights the current destination and uses real seeker state', () => {
    renderShell('/journey')
    expect(screen.getByRole('link', { name: /The Journey/ })).toHaveClass('is-active')
    expect(screen.getAllByText('Shell test')).not.toHaveLength(0)
    expect(screen.getByText('LEVEL 1')).toBeInTheDocument()
  })

  it('hides the contextual seeker panel on dense settings screens', () => {
    renderShell('/settings')
    expect(screen.queryByText('Seeker identity')).not.toBeInTheDocument()
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('leaves ritual routes outside the persistent shell', () => {
    renderShell('/ritual/beast-01')
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Collapse sidebar' })).not.toBeInTheDocument()
  })
})
