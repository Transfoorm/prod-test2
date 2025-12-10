// FUSE Constants - Core configuration values
// Following FUSE Doctrine: 2BA + Triple-T Ready

/**
 * Theme default values
 */
export const THEME_DEFAULTS = {
  DEFAULT_THEME: 'transtheme' as const,
  DEFAULT_MODE: 'light' as const,
};

/**
 * LocalStorage keys for client-side persistence
 */
export const STORAGE_KEYS = {
  THEME_MODE: 'fuse_theme_mode',
  THEME_NAME: 'fuse_theme_name',
  USER_PREFERENCES: 'fuse_user_prefs',
};

/**
 * DOM attributes for CSS theming
 */
export const DOM_ATTRIBUTES = {
  THEME_MODE: 'data-theme-mode',
  THEME_NAME: 'data-theme',
};

/**
 * Miror AI default values for new users
 *
 * Avatar options: f_1, f_2, f_3, m_1, m_2, m_3, i_1, i_2, i_3
 * (f=female, m=male, i=inclusive) × (1=caucasian, 2=dark, 3=oriental)
 * Enchantment timing options: 'subtle', 'magical', 'playful'
 */
export const MIROR_DEFAULTS = {
  DEFAULT_AVATAR: 'f_1' as const,              // Female caucasian
  DEFAULT_ENCHANTMENT: 'playful' as const,     // Options: 'subtle' | 'magical' | 'playful'
  DEFAULT_ENCHANTMENT_ENABLED: true,
};
