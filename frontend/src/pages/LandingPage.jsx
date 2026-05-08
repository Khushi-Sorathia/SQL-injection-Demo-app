import React from 'react';
import { Database, ShieldAlert, ArrowRight } from 'lucide-react';
import { scenarios } from '../data/scenarios';

const LandingPage = ({ onSelectScenario }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Database size={32} className="text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">SQL Injection Interactive Demo</h1>
            <p className="text-slate-400 text-sm mt-1">Learn secure coding by visualizing attacks and defenses side-by-side.</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto p-8 w-full">

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-full shrink-0">
              <ShieldAlert size={24} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Welcome to the Demo Environment</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                This application is intentionally vulnerable to demonstrate the mechanics of SQL Injection.
                Select a scenario below to start. You will be able to input payloads and see exactly how
                the vulnerable and secure backend code handles them.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm text-blue-800">
                <strong>Safe Environment:</strong> The database running behind this application is ephemeral.
                Feel free to drop tables or alter data; you can instantly reset it using the "Reset Database" button inside the workspace.
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Select a Learning Module</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
            >
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                    Scenario {scenario.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{scenario.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {scenario.description}
                </p>
              </div>
              <div className="border-t bg-gray-50 p-4">
                <button
                  onClick={() => onSelectScenario(scenario)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Start Scenario <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
};

export default LandingPage;
