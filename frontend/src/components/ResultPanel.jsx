import React from 'react';
import { Database, ShieldAlert, ShieldCheck, Clock, Terminal } from 'lucide-react';

const ResultPanel = ({ type, result, loading }) => {
  const isVulnerable = type === 'vulnerable';

  return (
    <div className={`border rounded-lg overflow-hidden flex flex-col h-full ${
      isVulnerable ? 'border-red-300' : 'border-green-300'
    }`}>
      {/* Header */}
      <div className={`p-3 flex items-center justify-between ${
        isVulnerable ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
      }`}>
        <div className="flex items-center gap-2 font-semibold">
          {isVulnerable ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
          {isVulnerable ? 'Vulnerable Execution' : 'Secure Execution'}
        </div>
        {result && (
          <div className="flex items-center gap-1 text-sm bg-white px-2 py-1 rounded shadow-sm">
            <Clock size={14} />
            <span>{result.timeMs} ms</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-2"></div>
            Executing Query...
          </div>
        ) : !result ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 italic p-6 text-center">
            Ready to execute. Click the button above to test the payload.
          </div>
        ) : (
          <>
            {/* Raw SQL Query */}
            <div className="p-4 border-b bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
              <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs uppercase tracking-wider">
                <Terminal size={14} /> Constructed Query
              </div>
              <pre className="whitespace-pre-wrap break-all">{result.query}</pre>
            </div>

            {/* Results / Error */}
            <div className="flex-1 p-4 overflow-y-auto">
              {result.error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                  <p className="font-bold">Database Error</p>
                  <p className="font-mono text-sm mt-1">{result.error}</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3 text-gray-700 font-medium">
                    <Database size={16} />
                    Data Returned ({result.data?.length || 0} rows)
                  </div>

                  {result.data && result.data.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                          <tr>
                            {Object.keys(result.data[0]).map(key => (
                              <th key={key} className="px-4 py-2 border-b">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.data.map((row, i) => (
                            <tr key={i} className="bg-white border-b hover:bg-gray-50">
                              {Object.values(row).map((val, j) => (
                                <td key={j} className="px-4 py-2">
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white border rounded p-4 text-center text-gray-500 italic">
                      No results returned from query.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultPanel;
