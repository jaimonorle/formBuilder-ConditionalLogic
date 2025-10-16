
export interface BuilderInitOptions {
  panelTitle?: string;
}

export function initBuilderPlugin(options: BuilderInitOptions = {}) {
  const title = options.panelTitle || 'Conditional Logic';
  if ((window as any).__FB_LOGIC_DEBUG__) {
    console.log(`[fb-logic] Builder plugin initialized: ${title}`);
  }
}
