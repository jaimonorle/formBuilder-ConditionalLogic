export type Action = 'show' | 'hide' | 'enable' | 'disable' | 'require';

export type Op =
  | 'equals' | 'notEquals'
  | 'contains' | 'startsWith' | 'endsWith'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'isEmpty' | 'notEmpty';

export interface Rule {
  field: string;
  op: Op;
  value?: any;
}

export interface LogicGroup {
    mode: 'any' | 'all';
    rules: Rule[];
    actions: Action[];
}

export interface LogicConfig {
    groups: LogicGroup[];
    actions?: Action[];
    applyTo?: 'self' | 'container' | 'group';
    logicGroup?: string;
}

export interface SetupOptions {
  getValue?: (el: HTMLElement) => any;
  getWrapper?: (el: HTMLElement) => HTMLElement;
  onState?: (el: HTMLElement, visible: boolean) => void;
}
