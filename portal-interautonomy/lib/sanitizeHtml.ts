import sanitizeHtml, { type IOptions } from 'sanitize-html';

const DEFAULT_OPTIONS: IOptions = {
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
