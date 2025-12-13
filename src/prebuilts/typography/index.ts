/**──────────────────────────────────────────────────────────────────────┐
│  🤖 TYPOGRAPHY VR COMPONENTS - Export Hub                             │
│  /src/components/prebuilts/typography/index.ts                         │
│                                                                        │
│  Central export for all Typography VR components.                     │
└────────────────────────────────────────────────────────────────────────┘ */


export { default as TypographyTitle } from './TypographyTitle';
export { default as TypographyHeading } from './TypographyHeading';
export { default as TypographyBody } from './TypographyBody';
export { default as TypographyCaption } from './TypographyCaption';

// Re-export types
export type { TypographyTitleProps } from './TypographyTitle';
export type { TypographyHeadingProps } from './TypographyHeading';
export type { TypographyBodyProps } from './TypographyBody';
export type { TypographyCaptionProps } from './TypographyCaption';
