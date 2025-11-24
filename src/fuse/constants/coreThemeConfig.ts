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
 * Avatar options: 'male', 'female', 'inclusive'
 * Enchantment timing options: 'subtle', 'magical', 'playful'
 */
export const MIROR_DEFAULTS = {
  DEFAULT_AVATAR: 'inclusive' as const,        // Options: 'male' | 'female' | 'inclusive'
  DEFAULT_ENCHANTMENT: 'playful' as const,     // Options: 'subtle' | 'magical' | 'playful'
  DEFAULT_ENCHANTMENT_ENABLED: true,
};
