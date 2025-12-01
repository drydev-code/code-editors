# Code Editors Library - CDN Usage

This library is built as an ESM module and can be used with import maps via CDN.

## Quick Start with CDN

### HTML Import Map Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Editors Example</title>

    <!-- Import Map -->
    <script type="importmap">
    {
        "imports": {
            "react": "https://esm.sh/react@19.2.0",
            "react-dom": "https://esm.sh/react-dom@19.2.0",
            "react-dom/client": "https://esm.sh/react-dom@19.2.0/client",
            "@drydev-code/code-editors": "https://cdn.jsdelivr.net/npm/@drydev-code/code-editors@latest/dist/index.js",
            "@drydev-code/code-editors/style.css": "https://cdn.jsdelivr.net/npm/@drydev-code/code-editors@latest/dist/index.css"
        }
    }
    </script>

    <!-- Import the CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@drydev-code/code-editors@latest/dist/index.css">
</head>
<body>
    <div id="root"></div>

    <script type="module">
        import React, { StrictMode } from 'react';
        import { createRoot } from 'react-dom/client';
        import { CodeEditors } from '@drydev-code/code-editors';

        const rootElement = document.getElementById('root');
        const root = createRoot(rootElement);

        root.render(
            React.createElement(StrictMode, null,
                React.createElement(CodeEditors)
            )
        );
    </script>
</body>
</html>
```

### Module Usage Example

```javascript
// Import individual components
import {
    CodeEditors,
    JsonEditor,
    HtmlEditor,
    ScriptEditor,
    DbQueryEditor,
    XmlEditor,
    EditorType
} from '@drydev-code/code-editors';

// Use the main CodeEditors component
function App() {
    return React.createElement(CodeEditors);
}

// Or use individual editors
function JsonEditorExample() {
    const [content, setContent] = React.useState('{}');
    const [variables, setVariables] = React.useState('{}');

    return React.createElement(JsonEditor, {
        content: content,
        onChange: setContent,
        variablesJson: variables,
        onVariablesChange: setVariables
    });
}
```

## Available Exports

### Components
- `CodeEditors` - Main application with all editors
- `JsonEditor` - JSON/REST API editor
- `HtmlEditor` - HTML Email editor
- `ScriptEditor` - JavaScript/Script editor
- `DbQueryEditor` - Database query editor
- `XmlEditor` - XML template editor

### Utilities
- `CodeEditor` - Base Monaco editor component
- `TreeView` - Tree view component
- `VariableTree` - Variable tree component

### Types and Constants
- `EditorType` - Editor type enum
- All TypeScript interfaces and types from `types.ts`
- Default constants and configurations

## CDN URLs

The library is available via CDN at:
- **JavaScript**: `https://cdn.jsdelivr.net/npm/@drydev-code/code-editors@latest/dist/index.js`
- **CSS**: `https://cdn.jsdelivr.net/npm/@drydev-code/code-editors@latest/dist/index.css`
- **Types**: `https://cdn.jsdelivr.net/npm/@drydev-code/code-editors@latest/dist/index.d.ts`

## Version Pinning

For production use, pin to a specific version:

```javascript
{
    "imports": {
        "@drydev-code/code-editors": "https://cdn.jsdelivr.net/npm/@drydev-code/code-editors@0.0.2/dist/index.js",
        "@drydev-code/code-editors/style.css": "https://cdn.jsdelivr.net/npm/@drydev-code/code-editors@0.0.2/dist/index.css"
    }
}
```

## Dependencies

The library has these peer dependencies that you need to provide:
- `react` (>=18.0.0)
- `react-dom` (>=18.0.0)

Internal dependencies are bundled:
- `lucide-react` - Icons
- `@monaco-editor/react` - Monaco editor
- `handlebars` - Template engine

## File Size

- **JavaScript**: ~498KB (gzipped: ~98KB)
- **CSS**: ~1.8KB (gzipped: ~0.7KB)

The JavaScript bundle includes all components and dependencies, making it a single file solution for CDN usage.