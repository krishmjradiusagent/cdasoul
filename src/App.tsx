import { Theme } from './settings/types';
import { RadiusTeamEditPage } from './components/generated/RadiusTeamEditPage';

let theme: Theme = 'light';

function App() {
  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme);

  return (
    <div className="w-full h-full min-h-screen">
      <RadiusTeamEditPage />
    </div>);

}

export default App;