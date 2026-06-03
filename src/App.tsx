import { useHashRoute } from './router';
import { NavBar } from './components/NavBar';
import { asidePages, pageForRoute } from './pages/registry';
import styles from './App.module.css';

export default function App() {
  const { route, setRoute } = useHashRoute();

  const pageDef = pageForRoute(route) ?? asidePages[0];

  const PageComponent = pageDef.component;

  return (
    <div className={styles.shell}>
      <NavBar currentRoute={route} onNavigate={setRoute} />
      <PageComponent />
    </div>
  );
}
