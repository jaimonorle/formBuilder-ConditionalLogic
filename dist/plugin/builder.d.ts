/**
 * Builder plugin for formBuilder: adds Conditional Logic panel and Groups modal.
 * Exports:
 *  - withConditionalLogic(opts) → formBuilder options extension
 *  - attachLogicGroupsManager(toolbarEl, hooks)
 */
type UserAttrs = Record<string, any>;
export interface FieldMeta {
    name: string;
    type: string;
    label?: string;
    values?: Array<{
        label: string;
        value: string;
    }>;
}
export interface BuilderInitOptions {
    panelTitle?: string;
    types?: string[];
    getAvailableFields?: () => FieldMeta[];
    getFieldValues?: (fieldName: string) => Array<{
        label: string;
        value: string;
    }> | null;
    enableVisualEditor?: boolean;
}
/** Build the options object to pass into $('.build-wrap').formBuilder(...) */
export declare function withConditionalLogic(opts?: BuilderInitOptions): {
    typeUserAttrs: Record<string, UserAttrs>;
    onOpenFieldEdit: (editPanel: HTMLElement) => void;
};
/** Minimal Groups GUI living in a modal attached to a toolbar element */
export declare function attachLogicGroupsManager(targetContainer: HTMLElement, initialOrOpts?: string | {
    initialJson?: string;
    getAvailableFields?: () => FieldMeta[];
    getFieldValues?: (fieldName: string) => Array<{
        label: string;
        value: string;
    }> | null;
}): {
    getJson: () => string;
    setJson: (j: string) => void;
    getGroups: () => any;
};
export {};
