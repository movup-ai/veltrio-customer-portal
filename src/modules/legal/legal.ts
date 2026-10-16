/** Where Veltrio's own legal pages live. A rental's terms are each company's, on its agreement. */
export const TERMS_PATH = "/terms";
export const PRIVACY_PATH = "/privacy";

export type LegalDocumentName = "terms" | "privacy";

/** One numbered section of a legal page, as messages/<locale>/legal.json holds it. */
export interface LegalSection {
  title: string;
  paragraphs?: string[];
  /** A bulleted list after the paragraphs. */
  items?: string[];
}
