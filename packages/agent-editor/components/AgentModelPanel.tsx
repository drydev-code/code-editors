import React, { useState } from 'react';
import { AgentConfig } from '../../../lib/types';
import { Cpu, Settings2, ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
    config: AgentConfig;
    onChange: (config: AgentConfig) => void;
}

export const AgentModelPanel: React.FC<Props> = ({ config, onChange }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const update = (key: keyof AgentConfig, value: any) => {
        onChange({ ...config, [key]: value });
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <Cpu size={18} className="text-teal-600" />
                    <span>Model & Reasoning</span>
                </div>
                <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${showAdvanced ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Settings2 size={14} /> Advanced
                    {showAdvanced ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
            </div>
            
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Provider</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 font-medium text-slate-700"
                            value={config.provider}
                            onChange={e => update('provider', e.target.value)}
                        >
                            <option value="google">Google Gemini</option>
                            <option value="openai">OpenAI</option>
                            <option value="anthropic">Anthropic</option>
                            <option value="ollama">Ollama (Local)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Model ID</label>
                        <input 
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 font-mono text-slate-700"
                            value={config.modelId}
                            onChange={e => update('modelId', e.target.value)}
                            list="models"
                            placeholder="Select or type model ID..."
                        />
                        <datalist id="models">
                            <option value="gemini-2.5-flash" />
                            <option value="gemini-3-pro-preview" />
                            <option value="gpt-4o" />
                            <option value="claude-3-5-sonnet" />
                        </datalist>
                    </div>
                </div>

                {showAdvanced && (
                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-medium text-slate-600">Temperature</label>
                                <span className="text-xs text-slate-400 font-mono">{config.temperature}</span>
                            </div>
                            <input 
                                type="range" min="0" max="2" step="0.1"
                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                value={config.temperature}
                                onChange={e => update('temperature', parseFloat(e.target.value))}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-medium text-slate-600">Max Tokens</label>
                                <span className="text-xs text-slate-400 font-mono">{config.maxTokens}</span>
                            </div>
                            <input 
                                type="number"
                                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                                value={config.maxTokens}
                                onChange={e => update('maxTokens', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input 
                                type="checkbox" id="jsonMode"
                                className="rounded text-teal-600 focus:ring-teal-500"
                                checked={config.jsonMode}
                                onChange={e => update('jsonMode', e.target.checked)}
                            />
                            <label htmlFor="jsonMode" className="text-sm text-slate-700 font-medium">Native JSON Mode</label>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                                <input 
                                type="checkbox" id="daisyChain"
                                className="rounded text-teal-600 focus:ring-teal-500"
                                checked={config.mode === 'DAISY_CHAIN'}
                                onChange={e => update('mode', e.target.checked ? 'DAISY_CHAIN' : 'STANDARD')}
                            />
                            <label htmlFor="daisyChain" className="text-sm text-slate-700 font-medium">Daisy-Chain Output</label>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};