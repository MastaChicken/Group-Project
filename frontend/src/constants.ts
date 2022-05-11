export const $ = (id: string) => document.getElementById(id);
export const API = process.env.API_URL;
// NOTE: Used to get highlight
export const html = (html: TemplateStringsArray): string => html.toString();
export const style = getComputedStyle(document.body)
