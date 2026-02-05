declare module 'sanitize-html' {
  export type Attributes = Record<string, string>;

  export type TransformTagResult = {
    tagName: string;
    attribs?: Attributes;
    text?: string;
  };

  export type TransformTagFn = (
    tagName: string,
    attribs: Attributes
  ) => TransformTagResult;

  export interface IOptions {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    allowedStyles?: Record<string, Record<string, Array<RegExp | string>>>;
    allowedSchemes?: string[];
    allowedSchemesAppliedToAttributes?: string[];
    transformTags?: Record<string, TransformTagFn>;
  }

  export default function sanitizeHtml(dirty: string, options?: IOptions): string;
}
