import React, { useState } from 'react';
import { AgentConfig, UserFunction } from '../../../lib/types';
import { CodeEditor } from '../../shared-ui/CodeEditor';
import { Bot, Eye, EyeOff } from 'lucide-react';
import { interpolateString } from '../../../lib/utils';

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
                                language="text" // Using text to avoid markdown parsing issues in preview for now
                                value={getPreview(config.systemMessage)}
                                onChange={() => {}}
                                readOnly={true}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 border border-slate-300 rounded-xl overflow-hidden shadow-sm hover:border-slate-400 transition-colors">
                            <CodeEditor 
                                language="text" 
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
                                language="text"
                                value={getPreview(config.userMessageInput)}
                                onChange={() => {}}
                                readOnly={true}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 border border-slate-300 rounded-xl overflow-hidden shadow-sm hover:border-slate-400 transition-colors">
                            <CodeEditor 
                                language="handlebars" 
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