import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import ScenarioWorkspace from './pages/ScenarioWorkspace';

function App() {
  const [activeScenario, setActiveScenario] = useState(null);

  return (
    <div className="App">
      {activeScenario ? (
        <ScenarioWorkspace
          scenario={activeScenario}
          onBack={() => setActiveScenario(null)}
        />
      ) : (
        <LandingPage onSelectScenario={setActiveScenario} />
      )}
    </div>
  );
}

export default App;
