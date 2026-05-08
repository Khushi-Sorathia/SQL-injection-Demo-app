import React, { useState } from 'react';
import axios from 'axios';
import { Play, Code, Info, RefreshCw, Terminal } from 'lucide-react';
import ResultPanel from '../components/ResultPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ScenarioWorkspace = ({ scenario, onBack }) => {
  const [inputs, setInputs] = useState(scenario.defaultInputs);
  const [vulnResult, setVulnResult] = useState(null);
  const [secResult, setSecResult] = useState(null);
  const [loadingVuln, setLoadingVuln] = useState(false);
  const [loadingSec, setLoadingSec] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleExecute = async (type) => {
    const isVuln = type === 'vulnerable';
    const setLoading = isVuln ? setLoadingVuln : setLoadingSec;
    const setResult = isVuln ? setVulnResult : setSecResult;
    const endpoint = `${API_URL}/api/scenario/${scenario.id}/${type}`;

    setLoading(true);
    try {
      let res;
      if (scenario.method === 'GET') {
        // Map inputs to query params
        const params = new URLSearchParams(inputs).toString();
        res = await axios.get(`${endpoint}?${params}`);
      } else {
        res = await axios.post(endpoint, inputs);
      }
      setResult(res.data);
    } catch (err) {
      setResult({
        success: false,
        error: err.message,
        timeMs: '0.00',
        query: 'Execution failed before query'
      });
    }
    setLoading(false);
  };

  const handleExecuteBoth = () => {
    handleExecute('vulnerable');
    handleExecute('secure');
  };

  const handleResetDb = async () => {
    setResetting(true);
    try {
      await axios.post(`${API_URL}/api/admin/reset`);
      setVulnResult(null);
      setSecResult(null);
      alert('Database reset successfully!');
    } catch (err) {
      alert('Failed to reset database');
    }
    setResetting(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4 shadow-md flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-slate-300 hover:text-white font-medium"
          >
            &larr; Back to Scenarios
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2 border-l pl-4 border-slate-600">
            {scenario.title}
          </h1>
        </div>
        <button
          onClick={handleResetDb}
          disabled={resetting}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          <RefreshCw size={16} className={resetting ? "animate-spin" : ""} />
          Reset Database
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Inputs and Explanation */}
        <div className="w-1/3 min-w-[350px] max-w-[450px] bg-white border-r overflow-y-auto flex flex-col shadow-sm z-10">

          {/* Input Form */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
              <Terminal size={20}/> Try a Payload
            </h2>
            <div className="space-y-4">
              {scenario.inputConfig.map(input => (
                <div key={input.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {input.label}
                  </label>
                  <input
                    type={input.type}
                    name={input.name}
                    value={inputs[input.name]}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder={input.placeholder}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleExecuteBoth}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow transition-colors flex justify-center items-center gap-2"
              >
                <Play size={18} /> Execute Both
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExecute('vulnerable')}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded transition-colors border border-red-300"
                >
                  Vuln Only
                </button>
                <button
                  onClick={() => handleExecute('secure')}
                  className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 px-4 rounded transition-colors border border-green-300"
                >
                  Secure Only
                </button>
              </div>
            </div>
          </div>

          {/* Explanation Panel */}
          <div className="p-6 border-b border-gray-200 bg-blue-50 flex-1">
            <h3 className="text-md font-bold mb-3 text-blue-900 flex items-center gap-2">
              <Info size={18} /> Explanation
            </h3>
            <div className="text-sm text-blue-800 space-y-3 leading-relaxed">
              {scenario.explanation}
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-blue-900 mb-2">Suggested Payloads:</h4>
              <ul className="space-y-2">
                {scenario.suggestedPayloads.map((p, idx) => (
                  <li key={idx} className="bg-white p-2 rounded border border-blue-200 shadow-sm">
                    <div className="font-mono text-xs text-slate-800 mb-1 break-all bg-gray-100 p-1 rounded">
                      {p.payload}
                    </div>
                    <div className="text-xs text-blue-700">{p.desc}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Right Area - Results Split Screen */}
        <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">

          <div className="flex-1 min-h-0 flex gap-4">
            <div className="flex-1 h-full">
              <ResultPanel type="vulnerable" result={vulnResult} loading={loadingVuln} />
            </div>
            <div className="flex-1 h-full">
              <ResultPanel type="secure" result={secResult} loading={loadingSec} />
            </div>
          </div>

          {/* Code Snippets at bottom */}
          <div className="h-64 flex gap-4 shrink-0">
             <div className="flex-1 border border-red-300 rounded-lg overflow-hidden flex flex-col bg-white">
                <div className="bg-red-50 text-red-800 px-3 py-2 border-b flex items-center gap-2 font-semibold text-sm">
                  <Code size={16} /> Vulnerable Backend Code
                </div>
                <div className="p-4 bg-gray-900 flex-1 overflow-y-auto">
                  <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap">{scenario.vulnCode}</pre>
                </div>
             </div>
             <div className="flex-1 border border-green-300 rounded-lg overflow-hidden flex flex-col bg-white">
                <div className="bg-green-50 text-green-800 px-3 py-2 border-b flex items-center gap-2 font-semibold text-sm">
                  <Code size={16} /> Secure Backend Code
                </div>
                <div className="p-4 bg-gray-900 flex-1 overflow-y-auto">
                  <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{scenario.secCode}</pre>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ScenarioWorkspace;
