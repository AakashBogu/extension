export interface BraveResponsePayload {
  web?: {
    results?: Array<{
      title: string;
      url: string;
      description: string;
      page_age?: string;
    }>;
  };
}

export interface BingResponsePayload {
  webPages?: {
    value?: Array<{
      id?: string;
      name: string;
      url: string;
      snippet: string;
      datePublished?: string;
    }>;
  };
}
