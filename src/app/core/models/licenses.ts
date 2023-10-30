interface License {
  name: string;
  url: string;
}

export const LICENSES: Map<string, License> = new Map<string, License>([
  [
    'CC0-1.0',
    {
      name: 'CC0 1.0',
      url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
  ],
  [
    'CC-BY-4.0',
    { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  ],
  [
    'CC-BY-SA-4.0',
    {
      name: 'CC BY-SA 4.0',
      url: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
  ],
  [
    'CC-BY-NC-4.0',
    {
      name: 'CC BY-NC 4.0',
      url: 'https://creativecommons.org/licenses/by-nc/4.0/',
    },
  ],
  [
    'CC-BY-NC-SA-4.0',
    {
      name: 'CC BY-NC-SA 4.0',
      url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    },
  ],
]);
