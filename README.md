# Drydev Code Editors

A modular, high-performance suite of developer tools designed for template editing, data transformation, and SQL generation. Built with React, TypeScript, and Monaco Editor.

## 🚀 Overview

Drydev Code Editors provides a unified interface for working with varying data formats while maintaining a shared context state. It allows developers to:

1.  **Define Data**: Set up a global JSON context (Variables).
2.  **Define Logic**: Create reusable JavaScript functions.
3.  **Apply Templates**: Use Handlebars syntax to inject data into JSON, HTML, SQL, and XML.
4.  **Script Logic**: Write ad-hoc JavaScript to manipulate the data context.

## 🛠 Features

### 1. Shared Context (Variables)
All editors share a common `Variables` store. This simulates a payload or database record state.
- **Access**: `{{ variable.path }}` in templates or `ctx.variable.path` in scripts.
- **Tree View**: The left-hand panel provides a drag-and-drop tree view of all available variables.

### 2. User Functions
Define custom JavaScript functions that act as both:
- **Handlebars Helpers**: `{{#func:myFunctionName(arg1, arg2)}}`
- **Script Functions**: `myFunctionName(arg1, arg2)` inside the Script Editor.

### 3. Editors

#### 📄 JSON REST Editor
- **Usage**: Designing API payloads or config files.
- **Features**: Real-time Handlebars interpolation, syntax validation, and split-pane preview.

#### 📧 HTML Email Editor
- **Usage**: Building responsive, client-compatible HTML emails.
- **Features**:
    - **Snippet Toolbox**: Drag-and-drop "table-based" layout blocks compatible with Outlook/Gmail.
    - **Image Gallery**: Manage hosted images and insert them using dynamic Handlebars references.
    - **Real-time Preview**: Renders HTML safely in a sandboxed iframe.

#### 📜 Script Node Editor
- **Usage**: prototyping logic or transforming data before it hits a template.
- **Features**:
    - **Console**: Captures `log()` output.
    - **Context Inspection**: View the `finalContext` state after script execution to see how variables were modified.

#### 🗄️ DB Query Editor
- **Usage**: Prototyping SQL queries with dynamic variable injection.
- **Features**:
    - **Connection Manager**: Define connections with specific SQL dialects (Postgres, MySQL, DuckDB, etc.).
    - **Dialect Library**: specialized snippet library based on the selected connection's dialect.
    - **Execution Simulation**: Simulates query latency and JSON result sets.

#### 📝 XML Template Editor
- **Usage**: SOAP envelopes or legacy configuration formats.
- **Features**: XML syntax highlighting and interpolation preview.

### 4. AI Assistant 🤖
Integrated with Google Gemini models to assist with:
- Generating code snippets.
- Debugging templates.
- Writing SQL queries based on natural language.
- **Usage**: Open the "AI Assistant" tab in the right panel and chat.

---

## 📖 Extension Documentation

The application is designed to be extensible. Here is how to add new capabilities:

### Adding Email Snippets
Modify `constants.tsx` to add new groups or snippets to `DEFAULT_EMAIL_SNIPPET_GROUPS`.

```typescript
// constants.tsx
export const DEFAULT_EMAIL_SNIPPET_GROUPS = [
  {
    id: 'my-group',
    title: 'My Custom Blocks',
    snippets: [
      {
        name: 'Header',
        description: 'My custom header',
        icon: <MyIcon />,
        content: `<table>...</table>`
      }
    ]
  }
];
```

### Adding SQL Dialects & Functions
1.  **Add Type**: Update `SqlDialect` type in `types.ts`.
2.  **Update Library**: Add the dialect specific functions to `DEFAULT_SQL_DIALECT_DATA` in `constants.tsx`.

```typescript
// types.ts
export type SqlDialect = 'postgres' | ... | 'new-dialect';

// constants.tsx
export const DEFAULT_SQL_DIALECT_DATA = {
  'new-dialect': [
     {
        id: 'basics',
        title: 'Basic Functions',
        items: [{ name: 'MY_FUNC()', desc: 'Does something' }]
     }
  ]
}
```

### Adding Default Variables or Functions
Modify `defaults.tsx` to change the initial state of the application.

- `DEFAULT_VARIABLES_JSON`: Initial JSON context.
- `DEFAULT_FUNCTIONS`: Array of `UserFunction` objects.
- `DEFAULT_DB_CONNECTIONS`: Pre-configured database connections.

## ⌨️ Shortcuts

- **Ctrl + F / Cmd + F**: Format code in the active editor.
- **Drag & Drop**:
    - Drag variables from the Tree View into any editor.
    - Drag functions from the Function Panel into any editor.
    - Drag snippets from the Toolbox into HTML/SQL editors.

## 📦 Tech Stack

- **Framework**: React 19
- **Styling**: Tailwind CSS
- **Editor Core**: Monaco Editor (`@monaco-editor/react`)
- **Templating**: Handlebars
- **Icons**: Lucide React
- **AI**: @google/genai SDK
