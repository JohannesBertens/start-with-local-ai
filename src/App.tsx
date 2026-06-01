import { useAdventure } from './state/useAdventure';
import { NodeView } from './components/NodeView';
import { Breadcrumb } from './components/Breadcrumb';
import { Controls } from './components/Controls';
import { ThemeToggle } from './components/ThemeToggle';
import styles from './App.module.css';

export default function App() {
  const adventure = useAdventure();
  const { state, currentNode } = adventure;

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.mark}>◈</span>
          <span>
            Start With <strong>Local AI</strong>
          </span>
        </div>
        <ThemeToggle theme={adventure.theme} onToggle={adventure.toggleTheme} />
      </header>

      <main className={styles.main}>
        <Breadcrumb
          trail={adventure.trail}
          onJump={adventure.jumpTo}
          onExplore={adventure.exploreAlternate}
        />

        {currentNode ? (
          <NodeView
            node={currentNode}
            onChoose={adventure.choose}
            onAdvance={adventure.advance}
          />
        ) : (
          <p>Lost the trail. Please start over.</p>
        )}

        <Controls
          canGoBack={adventure.canGoBack}
          canGoForward={adventure.canGoForward}
          onBack={adventure.goBack}
          onForward={adventure.goForward}
          onReset={adventure.reset}
        />
      </main>

      <footer className={styles.footer}>
        {state.facts.reason || state.facts.level || state.facts.useCase || state.facts.os || state.facts.tool ? (
          <p className={styles.recap}>
            Your adventure:{' '}
            {[
              state.facts.reason && `reason: ${state.facts.reason}`,
              state.facts.level && `level: ${state.facts.level}`,
              state.facts.useCase && `goal: ${state.facts.useCase}`,
              state.facts.os && `os: ${state.facts.os}`,
              state.facts.tool && `tool: ${state.facts.tool}`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        ) : (
          <p className={styles.recap}>Your choices are saved automatically in this browser.</p>
        )}
      </footer>
    </div>
  );
}
