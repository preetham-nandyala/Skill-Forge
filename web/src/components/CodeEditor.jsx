"use client";
import Editor from "@monaco-editor/react";
import { useState } from "react";
import styles from './CodeEditor.module.css';

export default function CodeEditor({ language = "javascript", value, onChange }) {
    const [editorValue, setEditorValue] = useState(value || "// Start coding here...");

    const handleEditorChange = (value) => {
        setEditorValue(value);
        if (onChange) onChange(value);
    };

    return (
        <div className={styles.editorContainer}>
            <Editor
                height="100%"
                defaultLanguage={language}
                defaultValue={editorValue}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    fontFamily: "var(--font-mono)",
                    roundedSelection: false,
                    padding: { top: 16 },
                }}
                onChange={handleEditorChange}
            />
        </div>
    );
}
