// Portfolio sections, in order. Used by the in-game Sections menu, and by App for each page's accent colour.
// `accent` gives a section its own colour (a [data-accent] block in index.css);
// sections without one use the default amber.
export const SECTIONS = [
  { path: '/about',      label: 'About',      index: '01', codename: 'BIO', accent: 'teal' },
  { path: '/projects',   label: 'Projects',   index: '02', codename: 'LAB' },
  { path: '/experience', label: 'Experience', index: '03', codename: 'LOG', accent: 'lime' },
  { path: '/resume',     label: 'Resume',     index: '04', codename: 'FILE', accent: 'rose' },
  { path: '/contact',    label: 'Contact',    index: '05', codename: 'COMM', accent: 'moon' },
];
