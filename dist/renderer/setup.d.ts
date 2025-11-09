import { LogicGroup, SetupOptions } from '../types';

declare global {
    interface Window {
        fbLogicGroups?: Record<string, LogicGroup>;
        __FB_LOGIC_DEBUG__?: boolean;
        FB_GET_WRAPPER?: (el: HTMLElement) => HTMLElement;
        _fbLogic?: {
            refresh: () => void;
        };
    }
}
export declare function setup(formEl: HTMLElement | Element, _formData?: any, options?: SetupOptions): void;
export declare function refresh(formEl: HTMLElement | Element): void;
export declare function evaluateField(formEl: HTMLElement | Element, _name: string): void;
