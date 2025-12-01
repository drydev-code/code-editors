import React from 'react';

// Export all types from the original types file
export * from './types';

// Main component type
export declare const CodeEditors: React.FC;

// Individual editor components
export declare const JsonEditor: React.FC<any>;
export declare const HtmlEditor: React.FC<any>;
export declare const ScriptEditor: React.FC<any>;
export declare const DbQueryEditor: React.FC<any>;
export declare const XmlEditor: React.FC<any>;

// Utility components
export declare const CodeEditor: React.FC<any>;
export declare const TreeView: React.FC<any>;
export declare const VariableTree: React.FC<any>;

// Constants and defaults
export { DEFAULT_EMAIL_SNIPPET_GROUPS, DEFAULT_SQL_DIALECT_DATA, DEFAULT_XML_SNIPPET_GROUPS } from './constants';
export * from './defaults';