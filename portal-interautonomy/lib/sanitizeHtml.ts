import sanitizeHtml, { type IOptions } from 'sanitize-html';

type IOptionsWithAllowedStyles = IOptions & {
  allowedStyles?: Record<string, Record<string, Array<RegExp | string>>>;
};

const DEFAULT_OPTIONS: IOptionsWithAllowedStyles = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
    'span',
    'h2',
    'h3',
    'h4',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    span: ['style'],
  },
  allowedStyles: {
    span: {
      color: [
        /^#[0-9a-f]{3}([0-9a-f]{3})?$/i,
        /^rgb\(\s*(?:[01]?\d?\d|2[0-4]\d|25[0-5])\s*,\s*(?:[01]?\d?\d|2[0-4]\d|25[0-5])\s*,\s*(?:[01]?\d?\d|2[0-4]\d|25[0-5])\s*\)$/i,
        /^rgba\(\s*(?:[01]?\d?\d|2[0-4]\d|25[0-5])\s*,\s*(?:[01]?\d?\d|2[0-4]\d|25[0-5])\s*,\s*(?:[01]?\d?\d|2[0-4]\d|25[0-5])\s*,\s*(?:0|1|0?\.\d+)\s*\)$/i,
      ],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  // Keep it strict: no inline JS URLs, no iframes, no scripts.
  allowedSchemesAppliedToAttributes: ['href'],
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href || '';
      const isHttp = /^https?:/i.test(href);
      const isMailTel = /^(mailto:|tel:)/i.test(href);

      return {
        tagName,
        attribs: {
          ...attribs,
          ...(isHttp ? { target: '_blank' } : {}),
          ...(isHttp || isMailTel ? { rel: 'noopener noreferrer nofollow' } : {}),
        },
      };
    },
  },
};

export function sanitizeHtmlFragment(dirty: string, options?: IOptions): string {
  if (!dirty) return '';
  return sanitizeHtml(dirty, options ?? DEFAULT_OPTIONS);
}
