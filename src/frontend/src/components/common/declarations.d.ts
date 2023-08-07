/*
 * This file is used to declare types for modules that don't have types
 * available. This is a temporary solution until the types are available.
 */
declare module "@chad.b.morrow/sparkles" {
  export default React.FC<{
    colors?: rainbow | string[];
    children: React.ReactNode;
    rate?: number;
    variance?: number;
    minSize?: number;
    maxSize?: number;
    isToggleable?: boolean;
    style?: React.CSSProperties;
  }>;
}
