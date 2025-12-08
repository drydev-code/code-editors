import React, { useState, useEffect, useCallback, useRef } from 'react';
import { interpolateString } from '../../lib/utils';
import { UserFunction, EditorType, EmailSnippetGroup, HostImage } from '../../lib/types';
import { CodeEditor, CodeEditorRef } from '../shared-ui/CodeEditor';
import { ToolsPanel } from '../shared-ui/ToolsPanel';
import { PanelRightClose, PanelRightOpen, Wand2 } from 'lucide-react';
import { DEFAULT_EMAIL_SNIPPET_GROUPS } from '../../lib/constants';

interface HtmlEditorProps {
    content: string;
    onChange: (val: string) => void;
    
    // Store Props
    variables: Record<string, any>;
    variablesJson: string;
    onVariablesChange: (json: string) => void;
    variableError: string | null;
    functions: UserFunction[];
    onFunctionsChange: (funcs: UserFunction[]) => void;
    
    // Config
    emailBlockGroups?: EmailSnippetGroup[];
    hostImages?: HostImage[];
    onAddImage?: (img: HostImage) => void;
    onDeleteImage?: (id: string) => void;

    // AI Prop
    onAiAssist?: (prompt: string) => Promise<string>;
}

export const HtmlEditor: React.FC<HtmlEditorProps> = ({ 
    content = '', 
    onChange, 
    variables = {}, 
    variablesJson = '{}',
    onVariablesChange,
    variableError,
    functions = [],
    onFunctionsChange,
    emailBlockGroups = DEFAULT_EMAIL_SNIPPET_GROUPS,
    hostImages = [],
    onAddImage,
    onDeleteImage,
    onAiAssist
}) => {
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(true);
    const [missingFunctions, setMissingFunctions] = useState<string[]>([]);

    // Editor Ref
    const editorRef = useRef<CodeEditorRef>(null);

    // Resize & Layout State
    const [previewWidth, setPreviewWidth] = useState(600);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);

    // Layout Breakpoint
    const isStacked = containerWidth < 850; // Use a slightly larger breakpoint for HTML preview

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const newWidth = containerRect.right - e.clientX;
            
            if (newWidth > 300 && newWidth < containerRect.width - 200) {
                setPreviewWidth(newWidth);
            }
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', stopResizing);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, stopResizing]);

    // Check for missing functions
    useEffect(() => {
        const safeFunctions = Array.isArray(functions) ? functions : [];
        const regex = /{{#func:([a-zA-Z0-9_]+)\(/g;
        const missing: Set<string> = new Set();
        let match;
        while ((match = regex.exec(content)) !== null) {
            const funcName = match[1];
            if (!safeFunctions.some(f => f.name === funcName)) {
                missing.add(funcName);
            }
        }
        
        const legacyRegex = /{{\s*func\s+['"]([a-zA-Z0-9_]+)['"]/g;
        while ((match = legacyRegex.exec(content)) !== null) {
            const funcName = match[1];
            if (!safeFunctions.some(f => f.name === funcName)) {
                missing.add(funcName);
            }
        }
        setMissingFunctions(Array.from(missing));
    }, [content, functions]);

    useEffect(() => {
        try {
            const imagesContext = (hostImages || []).reduce((acc, img) => {
                acc[img.name] = img.url;
                return acc;
            }, {} as Record<string, string>);

            const combinedContext = {
                ...variables,
                images: imagesContext
            };

            const interpolated = interpolateString(content, combinedContext, functions || []);
            setPreviewHtml(interpolated);
            setError(null);
        } catch (e: any) {
            setError(e.message);
        }
    }, [content, variables, functions, hostImages]);

    const handleInsert = (text: string) => {
        if (editorRef.current) {
            editorRef.current.insertText(text);
        }
    };

    return (
        <div className="flex h-full w-full">
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden" ref={containerRef}>
                <div className={`flex-1 flex ${isStacked ? 'flex-col' : 'flex-row'} gap-0 h-full relative`}>
                     {/* Source Editor */}
                     <div className={`flex-1 flex flex-col min-h-0 p-4 min-w-0`}>
                        <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex justify-between items-center h-6">
                            <span>HTML Template</span>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => editorRef.current?.format()}
                                    className="text-slate-400 hover:text-teal-600 hover:bg-teal-50 p-0.5 rounded transition-colors"
                                    title="Format Code (Ctrl+F)"
                                >
                                    <Wand2 size={14} />
                                </button>
                                <span className="text-teal-600 font-mono text-[10px]">Handlebars</span>
                                <button 
                                    onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-0.5 rounded transition-colors"
                                    title={isPreviewOpen ? "Collapse Preview" : "Show Preview"}
                                >
                                    {isPreviewOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0 relative">
                             <CodeEditor 
                                ref={editorRef}
                                language="handlebars" 
                                value={content} 
                                onChange={(val) => onChange(val || '')} 
                            />
                        </div>
                    </div>

                    {/* Resizable Preview */}
                    {isPreviewOpen && (
                        <>
                             {/* Resize Handle - Only when not stacked */}
                             {!isStacked && (
                                <div 
                                    className="w-1 bg-slate-200 hover:bg-teal-400 cursor-col-resize z-10 hover:w-1.5 -ml-0.5 transition-all flex items-center justify-center group flex-shrink-0"
                                    onMouseDown={startResizing}
                                >
                                    <div className="h-8 w-1 bg-slate-400 rounded-full group-hover:bg-white/80 hidden group-hover:block" />
                                </div>
                             )}

                            <div 
                                className="flex flex-col min-h-0 bg-slate-50/50 p-4 overflow-hidden flex-shrink-0"
                                style={{ 
                                    width: isStacked ? '100%' : previewWidth,
                                    height: isStacked ? '50%' : '100%',
                                    borderTop: isStacked ? '1px solid #e2e8f0' : 'none',
                                    borderLeft: isStacked ? 'none' : undefined
                                }}
                            >
                                <div className="flex justify-between items-center mb-2 h-6">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Preview</div>
                                    {error && <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded truncate max-w-[300px]">{error}</span>}
                                </div>
                                <div className="flex-1 bg-white rounded-xl border border-slate-300 overflow-hidden relative shadow-sm">
                                    <iframe 
                                        title="email-preview"
                                        srcDoc={previewHtml}
                                        className="w-full h-full border-none"
                                        sandbox="allow-same-origin"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Tools Panel */}
            <ToolsPanel 
                variablesObj={variables}
                variablesJson={variablesJson}
                onVariablesChange={onVariablesChange}
                variableError={variableError}
                functions={functions}
                onFunctionsChange={onFunctionsChange}
                activeEditorType={EditorType.EMAIL_HTML}
                missingFunctions={missingFunctions}
                emailBlockGroups={emailBlockGroups}
                hostImages={hostImages}
                onAddImage={onAddImage}
                onDeleteImage={onDeleteImage}
                onInsert={handleInsert}
                onUpdateContent={(val) => onChange(val)}
                onAiAssist={onAiAssist}
            />
        </div>
    );
};