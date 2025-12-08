# Agent Editor Implementation

## editors/AgentEditor.tsx

```tsx
import React, { useState, useCallback } from 'react';
import { AgentConfig, UserFunction, EditorType } from '../types';
import { ToolsPanel } from '../components/ToolsPanel';
import { interpolateString } from '../utils';
import { 
    Play, Edit2, AlertCircle, Leaf 
} from 'lucide-react';

// Atomic Organisms
import { AgentModelPanel } from '../components/agent/AgentModelPanel';
import { AgentPromptPanel } from '../components/agent/AgentPromptPanel';
import { AgentOutputPanel } from '../components/agent/AgentOutputPanel';
import { AgentCapabilitiesPanel } from '../components/agent/AgentCapabilitiesPanel';

interface AgentEditorProps {
    // Data
    config: AgentConfig;
    variables: Record<string, any>;
    variablesJson: string;
    variableError: string | null;
    functions: UserFunction[];

    // Callbacks
    onChange: (config: AgentConfig) => void;
    onVariablesChange: (json: string) => void;
    onFunctionsChange: (funcs: UserFunction[]) => void;
    
    // Services
    onAiAssist?: (prompt: string) => Promise<string>;
    onRun?: () => void;

    // Execution State
    isRunning?: boolean;
    runError?: string | null;
    externalRunTrigger?: { message: string, timestamp: number } | null;
}

export const AgentEditor: React.FC<AgentEditorProps> = ({ 
    config, 
    onChange, 
    variables, 
    variablesJson, 
    onVariablesChange, 
    variableError,
    functions,
    onFunctionsChange,
    onAiAssist,
    onRun,
    isRunning,
    runError,
    externalRunTrigger
}) => {
    // Local State for Run Trigger interpolation
    const [processedRunTrigger, setProcessedRunTrigger] = useState<{message: string, timestamp: number} | null>(null);

    // Update generic config key
    const updateConfig = useCallback((key: keyof AgentConfig, value: any) => {
        onChange({ ...config, [key]: value });
    }, [config, onChange]);

    // Handle External Run Trigger (from App)
    React.useEffect(() => {
        if (externalRunTrigger) {
            try {
                // Interpolate before sending to chat panel
                const interpolated = interpolateString(config.userMessageInput, variables, functions);
                setProcessedRunTrigger({ 
                    message: interpolated, 
                    timestamp: externalRunTrigger.timestamp 
                });
            } catch (e: any) {
                // If interpolation fails, we still trigger but might show raw template
                setProcessedRunTrigger({ 
                    message: config.userMessageInput, 
                    timestamp: externalRunTrigger.timestamp 
                });
            }
        }
    }, [externalRunTrigger, config.userMessageInput, variables, functions]);

    return (
        <div className="flex h-full w-full relative">
            {/* Left: Configuration Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-slate-50 custom-scrollbar">
                
                {/* Editor Header (Internal) */}
                <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
                    <div className="max-w-5xl mx-auto flex justify-between items-start">
                        <div className="flex-1 mr-8">
                            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <span>Agent Configuration</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-teal-600">{config.agentType}</span>
                            </div>
                            <div className="flex items-center gap-3 mb-2 group">
                                <input 
                                    className="text-2xl font-bold text-slate-800 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-teal-500 focus:outline-none w-full transition-all placeholder-slate-300" 
                                    value={config.name}
                                    onChange={e => updateConfig('name', e.target.value)}
                                    placeholder="Agent Name"
                                />
                                <Edit2 size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <input 
                                className="text-slate-500 text-sm bg-transparent border-none focus:ring-0 p-0 w-full placeholder-slate-300" 
                                value={config.description}
                                onChange={e => updateConfig('description', e.target.value)}
                                placeholder="Describe the purpose of this agent..."
                            />
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            <button 
                                onClick={onRun}
                                disabled={isRunning}
                                className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95
                                    ${isRunning 
                                        ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                                        : 'bg-teal-600 hover:bg-teal-700 hover:scale-105 shadow-teal-600/20'}`}
                            >
                                <Play size={18} fill="currentColor" className={isRunning ? "opacity-50" : ""} />
                                <span>{isRunning ? 'Running...' : 'Run Agent'}</span>
                            </button>
                            {runError && (
                                <div className="text-xs text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                                    <AlertCircle size={12} /> {runError}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Editor Body: Composition of Atomic Panels */}
                <div className="max-w-5xl mx-auto w-full p-8 pb-24 space-y-8">
                    
                    <AgentModelPanel 
                        config={config} 
                        onChange={onChange} 
                    />

                    <AgentPromptPanel 
                        config={config} 
                        onChange={onChange} 
                        variables={variables}
                        functions={functions}
                    />

                    <AgentOutputPanel 
                        config={config}
                        onChange={onChange}
                    />

                    <AgentCapabilitiesPanel 
                        config={config} 
                        onChange={onChange} 
                        functions={functions}
                    />

                </div>
            </div>

            {/* Right: Tools & Assistant */}
            <ToolsPanel 
                variablesObj={variables}
                variablesJson={variablesJson}
                onVariablesChange={onVariablesChange}
                variableError={variableError}
                functions={functions}
                onFunctionsChange={onFunctionsChange}
                activeEditorType={EditorType.AGENT}
                onInsert={(text) => {
                    // This is a simplified insertion for now. 
                    // In a full implementation, we'd track the last focused input in the Atom/Molecule components
                    // and pass a ref up. For now, we rely on clipboard or drag/drop.
                    navigator.clipboard.writeText(text);
                }}
                onAiAssist={onAiAssist}
                runTrigger={processedRunTrigger}
            />
        </div>
    );
};
```

## components/agent/AgentModelPanel.tsx

```tsx
import React, { useState } from 'react';
import { AgentConfig } from '../../types';
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
                            <option value="gemini-1.5-pro" />
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
```

## components/agent/AgentPromptPanel.tsx

```tsx
import React, { useState } from 'react';
import { AgentConfig, UserFunction } from '../../types';
import { CodeEditor } from '../CodeEditor';
import { Bot, Eye, EyeOff } from 'lucide-react';
import { interpolateString } from '../../utils';

interface Props {
    config: AgentConfig;
    onChange: (config: AgentConfig) => void;
    variables: Record<string, any>;
    functions: UserFunction[];
}

export const AgentPromptPanel: React.FC<Props> = ({ config, onChange, variables, functions }) => {
    const [isPreview, setIsPreview] = useState(false);

    const update = (key: keyof AgentConfig, value: any) => {
        onChange({ ...config, [key]: value });
    };

    const getPreview = (template: string) => {
        try {
            return interpolateString(template, variables, functions);
        } catch (e: any) {
            return `[Preview Error: ${e.message}]`;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Bot size={20} className="text-purple-600" />
                    Prompt Configuration
                </h3>
                <button 
                    onClick={() => setIsPreview(!isPreview)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isPreview ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    {isPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                    {isPreview ? 'Edit Mode' : 'Preview Mode'}
                </button>
            </div>
        
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Prompt */}
                <div className="flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
                            <span>System Instructions</span>
                        </label>
                        {!isPreview && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full border border-slate-200">
                            Markdown Supported
                        </span>}
                    </div>
                    
                    {isPreview ? (
                        <div className="flex-1 border border-slate-300 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
                            <CodeEditor 
                                language="markdown"
                                value={getPreview(config.systemMessage)}
                                onChange={() => {}}
                                readOnly={true}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 border border-slate-300 rounded-xl overflow-hidden shadow-sm hover:border-slate-400 transition-colors">
                            <CodeEditor 
                                language="markdown" 
                                value={config.systemMessage} 
                                onChange={val => update('systemMessage', val || '')} 
                            />
                        </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2 px-1">
                        Define the agent's persona, rules, and context access.
                    </p>
                </div>

                {/* User Prompt */}
                <div className="flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
                            <span>User Message Template</span>
                        </label>
                        {!isPreview && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full border border-slate-200">
                            Markdown / Handlebars
                        </span>}
                    </div>
                    
                    {isPreview ? (
                        <div className="flex-1 border border-slate-300 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
                            <CodeEditor 
                                language="markdown"
                                value={getPreview(config.userMessageInput)}
                                onChange={() => {}}
                                readOnly={true}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 border border-slate-300 rounded-xl overflow-hidden shadow-sm hover:border-slate-400 transition-colors">
                            <CodeEditor 
                                language="markdown" 
                                value={config.userMessageInput} 
                                onChange={val => update('userMessageInput', val || '')} 
                            />
                        </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2 px-1">
                        How the user's request (or trigger event) is formatted.
                    </p>
                </div>
            </div>
        </div>
    );
};
```

## components/agent/AgentOutputPanel.tsx

```tsx
import React from 'react';
import { AgentConfig } from '../../types';
import { FileJson, CheckCircle2 } from 'lucide-react';
import { CodeEditor } from '../CodeEditor';

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
```

## components/agent/AgentCapabilitiesPanel.tsx

```tsx
import React, { useState } from 'react';
import { AgentConfig, UserFunction, MemoryBackend } from '../../types';
import { 
    CloudLightning, Hammer, Server, Plus, X, 
    Box, HardDrive, Cpu, CircleOff, Zap, Database
} from 'lucide-react';
import { CodeEditor } from '../CodeEditor';

interface Props {
    config: AgentConfig;
    onChange: (config: AgentConfig) => void;
    functions: UserFunction[];
}

export const AgentCapabilitiesPanel: React.FC<Props> = ({ config, onChange, functions }) => {
    // MCP Modal Local State
    const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
    const [mcpName, setMcpName] = useState('');
    const [mcpConfigJson, setMcpConfigJson] = useState('{\n  "mcpServers": {\n    "filesystem": {\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]\n    }\n  }\n}');

    const update = (key: keyof AgentConfig, value: any) => {
        onChange({ ...config, [key]: value });
    };

    const handleToolToggle = (toolId: string) => {
        const current = new Set(config.connectedTools);
        if (current.has(toolId)) {
            current.delete(toolId);
        } else {
            current.add(toolId);
        }
        update('connectedTools', Array.from(current));
    };

    const handleAddMcp = () => {
        if (!mcpName) return;
        const newServer = {
            id: Date.now().toString(),
            name: mcpName,
            config: mcpConfigJson
        };
        update('mcpServers', [...config.mcpServers, newServer]);
        setIsMcpModalOpen(false);
        setMcpName('');
    };

    const handleRemoveMcp = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        update('mcpServers', config.mcpServers.filter(s => s.id !== id));
    };

    const memoryOptions: {id: MemoryBackend, label: string, icon: React.ElementType, desc: string}[] = [
        { id: 'NONE', label: 'No Memory', icon: CircleOff, desc: 'Stateless execution' },
        { id: 'IN_MEMORY', label: 'In-Memory', icon: Cpu, desc: 'Ephemeral window' },
        { id: 'REDIS', label: 'Redis', icon: Zap, desc: 'Fast distributed cache' },
        { id: 'POSTGRES', label: 'Postgres', icon: Database, desc: 'Relational vector store' },
        { id: 'MYSQL', label: 'MySQL', icon: Server, desc: 'Standard relational' },
    ];

    return (
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <CloudLightning size={20} className="text-amber-500" />
                Capabilities
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Tools Section */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 font-bold text-slate-700">
                            <Hammer size={18} className="text-slate-500" />
                            <span>Tools (Optional)</span>
                        </div>
                        <div className="flex gap-2 text-[10px]">
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-600">MCP Compatible</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Add MCP Button */}
                        <div 
                            onClick={() => setIsMcpModalOpen(true)}
                            className="p-3 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50 cursor-pointer transition-all group min-h-[100px]"
                        >
                            <Plus size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Add MCP Server</span>
                        </div>

                        {/* MCP Servers */}
                        {config.mcpServers.map(server => (
                            <div 
                                key={server.id}
                                className="p-3 rounded-xl border bg-slate-50 border-slate-200 flex flex-col justify-between min-h-[100px] relative group"
                            >
                                <div>
                                    <div className="flex justify-between items-start">
                                        <Server size={18} className="text-indigo-500" />
                                    </div>
                                    <div className="text-xs font-bold text-slate-700 mt-2">
                                        {server.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate mt-1">
                                        MCP Protocol
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => handleRemoveMcp(server.id, e)}
                                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        {/* Existing Functions */}
                        {functions.map(fn => {
                            const isSelected = config.connectedTools.includes(fn.id);
                            return (
                                <div 
                                    key={fn.id}
                                    onClick={() => handleToolToggle(fn.id)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 min-h-[100px] relative overflow-hidden group
                                        ${isSelected 
                                            ? 'bg-teal-50 border-teal-500 shadow-sm ring-1 ring-teal-500/20' 
                                            : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-md'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <Box size={18} className={isSelected ? 'text-teal-600' : 'text-slate-400'} />
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                                    </div>
                                    <div>
                                        <div className={`text-xs font-bold ${isSelected ? 'text-teal-800' : 'text-slate-700'}`}>
                                            {fn.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1 truncate">
                                            ({fn.params.join(', ')})
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Memory Section */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full flex flex-col">
                    <div className="flex items-center gap-2 font-bold text-slate-700 mb-4">
                        <HardDrive size={18} className="text-slate-500" />
                        <span>Memory (Optional)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {memoryOptions.map(opt => {
                            const isSelected = config.memoryBackend === opt.id;
                            return (
                                <div 
                                    key={opt.id}
                                    onClick={() => update('memoryBackend', opt.id)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 min-h-[80px]
                                        ${isSelected 
                                            ? 'bg-indigo-50 border-indigo-500 shadow-sm ring-1 ring-indigo-500/20' 
                                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <opt.icon size={18} className={isSelected ? 'text-indigo-600' : 'text-slate-400'} />
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                    </div>
                                    <div>
                                        <div className={`text-xs font-bold ${isSelected ? 'text-indigo-800' : 'text-slate-700'}`}>
                                            {opt.label}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 space-y-4">
                            {['REDIS', 'POSTGRES', 'MYSQL'].includes(config.memoryBackend) && (
                            <div className="animate-in fade-in slide-in-from-top-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    {config.memoryBackend === 'REDIS' ? 'Redis URL' : 'Connection String'}
                                </label>
                                <input 
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono"
                                    placeholder={config.memoryBackend === 'REDIS' ? 'redis://localhost:6379' : 'postgresql://user:pass@localhost:5432/db'}
                                    value={config.memoryOptions?.connectionString || ''}
                                    onChange={e => update('memoryOptions', { ...config.memoryOptions, connectionString: e.target.value })}
                                />
                            </div>
                        )}

                        {config.memoryBackend !== 'NONE' && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Session Key</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono"
                                        value={config.sessionId}
                                        onChange={e => update('sessionId', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Window Size</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
                                        value={config.contextWindowLimit}
                                        onChange={e => update('contextWindowLimit', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

             {/* MCP Modal */}
             {isMcpModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Add MCP Server</h3>
                            <button onClick={() => setIsMcpModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Server Name</label>
                                <input 
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                    placeholder="My Filesystem Server"
                                    value={mcpName}
                                    onChange={e => setMcpName(e.target.value)}
                                />
                            </div>
                            <div className="h-[200px]">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Configuration (JSON)</label>
                                <div className="h-full border border-slate-300 rounded-lg overflow-hidden">
                                    <CodeEditor 
                                        language="json"
                                        value={mcpConfigJson}
                                        onChange={val => setMcpConfigJson(val || '')}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                            <button onClick={() => setIsMcpModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg text-sm font-medium">Cancel</button>
                            <button onClick={handleAddMcp} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium">Add Server</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
```

# AI Service
import { GoogleGenAI, Content } from "@google/genai";
import { UserFunction, AgentConfig } from "../types";
import { interpolateString } from "../utils";

export const runAgentSimulation = async (
    config: AgentConfig, 
    userMessage: string, 
    variables: any, 
    functions: UserFunction[]
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        // 1. Interpolate System Message
        let systemInstruction = "";
        try {
            systemInstruction = interpolateString(config.systemMessage, variables, functions);
        } catch (e) {
            systemInstruction = config.systemMessage; // Fallback
        }

        // 2. Prepare Tools (Function Declarations) - Only for connected tools
        // Note: MCP tools would be handled here in a real implementation
        const tools = config.connectedTools
            .map(id => functions.find(f => f.id === id))
            .filter(Boolean)
            .map(f => ({
                name: f!.name,
                description: `Custom function: ${f!.name}`,
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        // Simply map params to generic string inputs for simulation
                        ...f!.params.reduce((acc, p) => ({ ...acc, [p]: { type: 'STRING' } }), {})
                    },
                    required: f!.params
                }
            }));

        // 3. Inject Structured Output Instructions if enabled
        const isStructuredOutput = config.outputParser === 'JSON' || config.outputParser === 'AUTO_FIX';
        if (isStructuredOutput) {
            if (config.structuredOutputMethod === 'SCHEMA') {
                systemInstruction += `\n\nRESPONSE FORMAT INSTRUCTIONS:\nYou must output valid JSON that strictly adheres to the following schema:\n${config.jsonSchemaDefinition}`;
            } else {
                systemInstruction += `\n\nRESPONSE FORMAT INSTRUCTIONS:\nYou must output valid JSON that follows this example structure:\n${config.structuredOutputExample}`;
            }
            systemInstruction += `\n\nIMPORTANT: Do not include markdown formatting (like \`\`\`json) in your response. Output raw JSON only.`;
        }
            
        // 4. Construct the prompt with Few-Shot Examples
        let fullSystemPrompt = systemInstruction;
        if (config.fewShotExamples.length > 0) {
            fullSystemPrompt += "\n\nExamples:\n" + config.fewShotExamples.map(ex => `User: ${ex.input}\nAgent: ${ex.output}`).join("\n\n");
        }

        // 5. Execution Loop (Auto-Repair)
        let attempts = 0;
        const maxAttempts = (isStructuredOutput && config.autoRepair) ? 3 : 1;
        
        // Initial conversation history
        const contents: Content[] = [{ role: 'user', parts: [{ text: userMessage }] }];

        while (attempts < maxAttempts) {
            attempts++;

            const response = await ai.models.generateContent({
                model: config.modelId || 'gemini-2.5-flash',
                contents: contents,
                config: {
                    systemInstruction: fullSystemPrompt,
                    temperature: config.temperature,
                    maxOutputTokens: config.maxTokens,
                    topP: config.topP,
                    responseMimeType: (config.jsonMode || isStructuredOutput) ? "application/json" : "text/plain",
                }
            });

            const responseText = response.text || "No response generated.";

            // If not structured output, return immediately
            if (!isStructuredOutput) {
                return responseText;
            }

            // Validate JSON
            try {
                // Try parsing
                JSON.parse(responseText);
                // Valid JSON, return it
                return responseText;
            } catch (jsonError: any) {
                console.warn(`Attempt ${attempts} failed to parse JSON:`, jsonError.message);
                
                // If we reached max attempts, fail gracefully with error details
                if (attempts >= maxAttempts) {
                    return `Error: Failed to generate valid JSON after ${maxAttempts} attempts.\n\nLast Invalid Output:\n${responseText}\n\nParser Error: ${jsonError.message}`;
                }

                // Add failed exchange to history and retry with error feedback
                contents.push({ role: 'model', parts: [{ text: responseText }] });
                contents.push({ 
                    role: 'user', 
                    parts: [{ text: `SYSTEM ERROR: The previous output was not valid JSON. Parser Error: ${jsonError.message}.\n\nPlease fix the JSON syntax and output ONLY the valid JSON.` }] 
                });
                
                // Continue loop...
            }
        }

        return "Error: Unexpected execution state.";

    } catch (e: any) {
        console.error("Agent Simulation Error", e);
        return `Error executing agent: ${e.message}`;
    }
};