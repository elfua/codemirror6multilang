import './styles/editor.css';

import {
    EditorView,
    lineNumbers,
    highlightActiveLineGutter,
    highlightSpecialChars,
    drawSelection,
    rectangularSelection,
    crosshairCursor,
    highlightActiveLine,
    keymap
} from '@codemirror/view';
import { EditorState, StateField, StateEffect } from '@codemirror/state';
import { Compartment } from '@codemirror/state'

import { oneDark } from '@codemirror/theme-one-dark'

import {
    foldCode,
    unfoldCode,
    foldGutter,
    indentOnInput,
    indentUnit,
    bracketMatching,
    foldKeymap,
    syntaxHighlighting,
    defaultHighlightStyle
} from '@codemirror/language';
import {
    indentWithTab,
    history,
    defaultKeymap,
    historyKeymap,
    baseKeymap,
    indentSelection,
    redo,
    redoSelection,
    undo,
    undoSelection
} from '@codemirror/commands';
import { highlightSelectionMatches } from '@codemirror/search';

import {
    closeBrackets,
    autocompletion,
    closeBracketsKeymap,
    completionKeymap
} from '@codemirror/autocomplete';

import { linter, openLintPanel } from "@codemirror/lint";

import { javascript } from "@codemirror/lang-javascript"

const languageModes = {
    javascript: () => import("@codemirror/lang-javascript").then(module => module.javascript()),
    python: () => import("@codemirror/lang-python").then(module => module.python()),
    css: () => import("@codemirror/lang-css").then(module => module.css()),
    html: () => import("@codemirror/lang-html").then(module => module.html()),
    cpp: () => import("@codemirror/lang-cpp").then(module => module.cpp()),
    java: () => import("@codemirror/lang-java").then(module => module.java()),
    xml: () => import("@codemirror/lang-xml").then(module => module.xml()),
    sql: () => import("@codemirror/lang-sql").then(module => module.sql()),
    yaml: () => import("@codemirror/lang-yaml").then(module => module.yaml()),
    markdown: () => import("@codemirror/lang-markdown").then(module => module.markdown()),
    rust: () => import("@codemirror/lang-rust").then(module => module.rust()),
    php: () => import("@codemirror/lang-php").then(module => module.php()),
    json: () => import("@codemirror/lang-json").then(module => module.json())
};


import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { cpp } from '@codemirror/lang-cpp';
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { xml } from "@codemirror/lang-xml"
import { sql } from "@codemirror/lang-sql"
import { yaml } from "@codemirror/lang-yaml"
import { markdown } from "@codemirror/lang-markdown"
import { rust } from '@codemirror/lang-rust';
import { php } from '@codemirror/lang-php';
import { json } from '@codemirror/lang-json';

let editor;
let isMac = /Mac/.test(navigator.platform);

const languages = {
    javascript: javascript(),
    python: python(),
    java: java(),
    cpp: cpp(),
    rust: rust(),
    php: php(),
    sql: sql(),
    html: html(),
    css: css(),
    json: yaml(),
    rust: rust(),
    yaml: json(),
    xml: xml(),
    markdown: markdown()
};


class CodeMirrorEditor {
    constructor() {
        this.languageSelect = document.getElementById('language-select');
        this.themeToggle = document.getElementById('theme-toggle');
        this.currentLanguage = 'javascript';
        this.currentTheme = [];

        this.themeConf = new Compartment();
        this.languageConf = new Compartment();

        this.initializeEditor();
        this.setupEventListeners();
    }

    async initializeEditor() {
        const startState = EditorState.create({
            doc: 'console.log(42);\n',
            extensions: [
                ...this.getBaseExtensions(),
                this.languageConf.of(languages[this.currentLanguage])
                ,
                this.themeConf.of(this.currentTheme)
            ]
        });

        this.editorView = new EditorView({
            state: startState,
            parent: document.getElementById('editor')
        });
    }

    getBaseExtensions() {
        return [
            // languageExtensions[language],
            // javascript(),
            // theme === 'dark' ? oneDark : defaultHighlightStyle,
            // autoLanguage,
            // defaultHighlightStyle(),
            autocompletion(),
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            history(),
            foldGutter(),
            drawSelection(),
            indentUnit.of("    "),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            EditorState.allowMultipleSelections.of(true),
            indentOnInput(),
            bracketMatching(),
            closeBrackets(),
            autocompletion(),
            rectangularSelection(),
            crosshairCursor(),
            highlightActiveLine(),
            highlightSelectionMatches(),
            keymap.of({
                "Mod-z": undo,
                "Mod-Shift-z": redo,
                "Mod-u": view => undoSelection(view) || true,
                [isMac ? "Mod-Shift-u" : "Alt-u"]: redoSelection,
                "Ctrl-y": isMac ? undefined : redo,
                "Shift-Tab": indentSelection,
                "Mod-Alt-[": foldCode,
                "Mod-Alt-]": unfoldCode,
                "Shift-Mod-m": openLintPanel
            }),
            keymap.of([
                indentWithTab,
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...historyKeymap,
                ...foldKeymap,
                ...completionKeymap,
            ]),
        ]
    }

    setupEventListeners() {
        this.languageSelect.addEventListener('change', async (e) => {
            this.currentLanguage = e.target.value;
            this.updateLanguage();
        });

        this.themeToggle.addEventListener('change', (e) => {
            this.currentTheme = e.target.checked ? [oneDark] : [];
            this.updateTheme();
        });
    }

    updateLanguage() {
        this.editorView.dispatch({
            effects: this.languageConf.reconfigure(languages[this.currentLanguage])
        });
    }

    updateTheme() {
        this.editorView.dispatch({
            effects: this.themeConf.reconfigure(this.currentTheme)
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CodeMirrorEditor();
});