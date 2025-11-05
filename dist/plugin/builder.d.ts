/**
 * Builder-side plugin helpers for formBuilder.
 * Adds:
 *  - typeUserAttrs for logic JSON, applyTo, logicGroup
 *  - onOpenFieldEdit panel that groups these controls
 *  - Visual Rules Editor (optional) that populates the logic JSON without typing
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
export declare function withConditionalLogic(opts?: BuilderInitOptions): {
    typeUserAttrs: Record<string, UserAttrs>;
    onOpenFieldEdit: (editPanel: HTMLElement) => void;
};
/**
 * Form-level groups JSON manager (as before)
 */
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
