export interface CrossrefAuthor {
  given?: string;
  family?: string;
  ORCID?: string;
}

export interface CrossrefDate {
  'date-parts': number[][];
}

export interface CrossrefWork {
  DOI: string;
  title: string[];
  type: string;
  author?: CrossrefAuthor[];
  'published-print'?: CrossrefDate;
  'published-online'?: CrossrefDate;
  published?: CrossrefDate;
  'container-title'?: string[];
  abstract?: string;
  URL?: string;
  'is-referenced-by-count'?: number;
  score?: number;
}

export interface CrossrefFacets {
  'type-name': {
    'value-count': number;
    values: Record<string, number>;
  };
  published: {
    'value-count': number;
    values: Record<string, number>;
  };
}

export interface CrossrefResponse {
  status: string;
  'message-type': string;
  'message-version': string;
  message: {
    facets: CrossrefFacets;
    'total-results': number;
    items: CrossrefWork[];
    query: {
      'start-index': number;
      'search-terms': string;
    };
  };
}

export interface SearchFilters {
  'type-name': string[];
  'published-year': string[];
}

export interface SearchState {
  query: string;
  filters: SearchFilters;
  results: CrossrefWork[];
  facets: CrossrefFacets | null;
  totalResults: number;
  loading: boolean;
  error: string | null;
}