/// <reference types="vite/client" />
/// <reference types="chrome" />

declare module '*.css' {
  const content: string;
  export default content;
}
