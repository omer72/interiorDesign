import { DESIGN_STYLES } from './constants';

export type DesignStyle = typeof DESIGN_STYLES[number];

export interface User {
  name: string;
  email: string;
  picture: string;
}

// FIX: Centralize AIStudio type definition to resolve declaration conflicts.
// By moving the AIStudio interface into `declare global`, it becomes a globally available type,
// preventing module-scoping issues that can cause declaration conflicts.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }

    interface Window {
        // FIX: Made the 'aistudio' property optional to resolve a declaration conflict. This aligns with runtime checks for its existence.
        aistudio?: AIStudio;
        google: any;
    }
}