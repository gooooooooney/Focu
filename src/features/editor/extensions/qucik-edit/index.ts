import { EditorState, StateEffect, StateField } from "@codemirror/state";
import {
    EditorView,
    Tooltip, ViewUpdate, keymap,
    showTooltip
} from "@codemirror/view";
import { fetcher } from "./fecther";

export const showQuickEditEffect = StateEffect.define<boolean>();

let editorView: EditorView | null = null;
let currentAbortController: AbortController | null = null;

export const quickEditState = StateField.define<boolean>({
    create() {
        return false
    },
    update(value, transaction) {

        for (const effect of transaction.effects) {
            if (effect.is(showQuickEditEffect)) {
                return effect.value
            }
        }
        if (transaction.selection) {
            const selection = transaction.state.selection.main;
            if (selection.empty) {
                return false
            }
        }
        return value
    },
});

const createQuickEditTooltipField = (state: EditorState): readonly Tooltip[] => {
    const selection = state.selection.main;
    if (selection.empty) {
        return [];
    }

    const isQuickEditActive = state.field(quickEditState);
    if (!isQuickEditActive) {
        return [];
    }
    return [
        {
            pos: selection.to,
            above: false,
            strictSide: false,
            create() {
                const dom = document.createElement("div");
                dom.className = "bg-popover text-popover-foreground rounded-md border border-input p-2 shadow-md flex flex-col gap-2 text-sm";

                const form = document.createElement("form");
                form.className = "flex flex-col gap-2";

                const input = document.createElement("input");
                input.type = "text";
                input.placeholder = "Edit selected code";
                input.className = "bg-transparent border-none outline-none px-2 py-1 font-sans w-100"
                input.autofocus = true;
                const buttonContainer = document.createElement("div");
                buttonContainer.className = "flex items-center justify-between gap-2";

                const cancelButton = document.createElement("button");
                cancelButton.textContent = "Cancel";
                cancelButton.type = "button";
                cancelButton.className = "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm";
                cancelButton.onclick = () => {
                    if (currentAbortController) {
                        currentAbortController.abort();
                        currentAbortController = null;
                    }
                    if (editorView) {
                        editorView.dispatch({ effects: showQuickEditEffect.of(false) });
                    }
                };

                const submitButton = document.createElement("button");
                submitButton.textContent = "Submit";
                submitButton.type = "submit";
                submitButton.className = "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm";

                // 将 onsubmit 绑定到 form 上，而不是 button 上
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!editorView) return;

                    const instruction = input.value.trim();
                    if (!instruction) return;

                    const selection = editorView.state.selection.main;
                    const selectedCode = editorView.state.doc.sliceString(selection.from, selection.to);
                    const fullCode = editorView.state.doc.toString();

                    submitButton.disabled = true;
                    submitButton.textContent = "Submitting...";

                    currentAbortController = new AbortController();

                    const editedCode = await fetcher({
                        instruction,
                        selectedCode,
                        fullCode,
                    }, currentAbortController.signal);

                    if (editedCode) {
                        editorView.dispatch({
                            changes: {
                                from: selection.from,
                                to: selection.to,
                                insert: editedCode,
                            },
                            selection: { anchor: selection.from + editedCode.length },

                            effects: showQuickEditEffect.of(false),
                        });
                    } else {
                        submitButton.disabled = false;
                        submitButton.textContent = "Submit";
                    }

                    currentAbortController = null;

                };

                buttonContainer.appendChild(cancelButton);
                buttonContainer.appendChild(submitButton);

                form.appendChild(input);
                form.appendChild(buttonContainer);
                dom.appendChild(form);

                setTimeout(() => {
                    input.focus();
                }, 100);

                return { dom };
            }
        }
    ]
};

const quickEditTooltipField = StateField.define<readonly Tooltip[]>({
    create(state) {
        return createQuickEditTooltipField(state)
    },
    update(tooltips, transaction) {
        if (transaction.docChanged || transaction.selection) {
            return createQuickEditTooltipField(transaction.state);
        }

        for (const effect of transaction.effects) {
            if (effect.is(showQuickEditEffect)) {
                return effect.value ? createQuickEditTooltipField(transaction.state) : [];
            }
        }

        return tooltips;
    },
    provide: (field) => showTooltip.computeN(
        [field],
        (state) => state.field(field)
    )
});

const qucikEditKeymap = keymap.of([
    {
        key: "Mod-k",
        run: (view) => {
            const selection = view.state.selection.main;
            if (selection.empty) {
                return false
            }
            view.dispatch({ effects: showQuickEditEffect.of(true) });
            return true;
        }
    }
])

const captureViewExtension = EditorView.updateListener.of((view: ViewUpdate) => {
    editorView = view.view;
});


export const quickEdit = (fileName: string) => {

    return [
        quickEditState, // Our state storage
        quickEditTooltipField,
        qucikEditKeymap,
        captureViewExtension,
    ]

};

