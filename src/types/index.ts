export type Tactic = { id: string; title: string; budget: number; content?: string };
export type Lane = { id: string; title: string; items: Tactic[] };
export type LibraryTactic = { id: string; title: string; description: string; default_budget: number; category: string };
export type Tool = { id: string; name: string; description: string; logo_url: string; affiliate_link: string; tags: string[]; pricing?: string; value_prop?: string; };
export type Agency = { id: string; name: string; description: string; website_link: string; tags: string[]; location: string; pricing_model: string; verified: boolean; };