import React from 'react';
import { AgentConfig } from '../../../lib/types';
import { FileJson, CheckCircle2 } from 'lucide-react';
import { CodeEditor } from '../../shared-ui/CodeEditor';

interface Props {
    config: AgentConfig;
    onChange: (config: AgentConfig) => void;
}

export const AgentOutputPanel: React.FC<Props> = ({ config, onChange }) => {
    const isStructuredOutput = config.outputParser === 'JSON' || config.outputParser === 'AUTO_FIX';
    
    const update = (key: keyof AgentConfig, value: any) => {
        onChange({ ...config, [key]: value });
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                    <FileJson size={18} className="text-pink-500" />
                    <span>Structured Output</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${isStructuredOutput ? 'text-pink-600' : 'text-slate-500'}`}>
                        {isStructuredOutput ? 'JSON Enabled' : 'Disabled'}
                    </span>
                    <button
                        onClick={() => update('outputParser', isStructuredOutput ? 'TEXT' : 'JSON')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${isStructuredOutput ? 'bg-pink-600' : 'bg-slate-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isStructuredOutput ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {isStructuredOutput && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                                <button
                                    onClick={() => update('structuredOutputMethod', 'SCHEMA')}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${config.structuredOutputMethod === 'SCHEMA' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    JSON Schema
                                </button>
                                <button
                                    onClick={() => update('structuredOutputMethod', 'EXAMPLE')}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${config.structuredOutputMethod === 'EXAMPLE' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    One-Shot Example
                                </button>
                            </div>

                            <p className="text-xs text-slate-500">
                                {config.structuredOutputMethod === 'SCHEMA' 
                                    ? 'Define the strict JSON schema the model must follow.' 
                                    : 'Provide a valid JSON example of the expected output format.'}
                            </p>

                            {/* Auto Fix Option */}
                            <div 
                                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${config.autoRepair ? 'bg-pink-50 border-pink-200' : 'bg-white border-slate-200 hover:border-pink-200'}`}
                                onClick={() => update('autoRepair', !config.autoRepair)}
                            >
                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${config.autoRepair ? 'bg-pink-500 border-pink-500' : 'border-slate-300'}`}>
                                    {config.autoRepair && <CheckCircle2 size={12} className="text-white" />}
                                </div>
                                <div>
                                    <span className={`text-sm font-bold block ${config.autoRepair ? 'text-pink-900' : 'text-slate-700'}`}>Auto-Repair Invalid JSON</span>
                                    <p className="text-xs text-slate-500 mt-1">If the model outputs malformed JSON, automatically feed the error back to correct it.</p>
                                </div>
                            </div>
                        </div>

                        {/* Editor Area */}
                        <div className="flex-1 h-[250px] border border-slate-300 rounded-xl overflow-hidden relative shadow-sm">
                            <div className="absolute top-0 right-0 left-0 bg-slate-50 border-b border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                                <span>{config.structuredOutputMethod === 'SCHEMA' ? 'Schema Definition' : 'Example JSON'}</span>
                                <span>JSON</span>
                            </div>
                            <div className="pt-8 h-full">
                                <CodeEditor
                                    language="json"
                                    value={config.structuredOutputMethod === 'SCHEMA' ? config.jsonSchemaDefinition : config.structuredOutputExample}
                                    onChange={(val) => update(config.structuredOutputMethod === 'SCHEMA' ? 'jsonSchemaDefinition' : 'structuredOutputExample', val || '')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};