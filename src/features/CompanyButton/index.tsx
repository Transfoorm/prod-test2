/**──────────────────────────────────────────────────────────────────────┐
│  🏢 COMPANY BUTTON - Entity Details + Dropdown Menu                   │
│  /src/features/CompanyButton/index.tsx                                │
│                                                                        │
│  Company/Entity selector with brand logo, subscription status,        │
│  and quick access to entity settings.                                 │
│                                                                        │
│  ISVEA COMPLIANCE: ✅ 100% GOLD STANDARD                               │
│  - 0 ISV violations                                                    │
│  - 0 inline styles                                                     │
│  - 100% compliance (TRUE ZERO inline styles)                          │
└────────────────────────────────────────────────────────────────────────┘ */

"use client";

import { useState, useRef } from 'react';
import { ChevronsUpDown, Edit } from 'lucide-react';
import BrandLogoButton from '@/features/BrandLogoButton';
import CountrySelector from '@/features/CountrySelector';
import { useFuse } from '@/store/fuse';
import { Icon } from '@/prebuilts';
import { formatSubscriptionStatus, type SubscriptionStatus } from '@/fuse/constants/ranks';

export default function CompanyButton() {
  const user = useFuse((s) => s.user);
  const navigate = useFuse((s) => s.navigate);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const businessLocationButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleButtonClick = () => {
    // Ignore clicks if BrandLogoButton modal is open
    const brandLogoModal = document.querySelector('.ft-brandlogo-button-modal');
    if (brandLogoModal) {
      return;
    }

    // Close UserButton menu if open
    const userButtonAvatar = document.querySelector('.ft-userbutton-avatar--active');
    if (userButtonAvatar) {
      (userButtonAvatar as HTMLElement).click();
    }
    setIsMenuOpen(!isMenuOpen);
  };

  if (!user) {
    return <div className="ft-company-button-loading" />;
  }

  return (
    <div className="ft-company-button-container">
      <button
        className={`ft-company-button ${isMenuOpen ? 'ft-company-button--active' : ''}`}
        onMouseDown={handleButtonClick}
      >
        <BrandLogoButton />
        <div className="ft-company-button-text">
          <div className="ft-company-button-title">
            {(user as Record<string, unknown>)?.entityName as string || 'Your Company'}
          </div>
          <div className="ft-company-button-subtitle">
            {user?.subscriptionStatus ? formatSubscriptionStatus(user.subscriptionStatus as SubscriptionStatus) : 'Trial'}
          </div>
        </div>
        <ChevronsUpDown className="ft-company-button-chevron" />
      </button>

      {isMenuOpen && (
        <>
          <div className="ft-company-button-menu">
            <button
              className="ft-company-button-menu-close"
              onClick={closeMenu}
            >
              ×
            </button>

            <div className="ft-company-button-menu-header">
              <Icon variant="briefcase-business" size="sm" className="ft-company-button-menu-header-icon" />
              <div className="ft-company-button-menu-header-text">
              Your Business Info
                
              </div>
            </div>

            <div className="ft-company-button-menu-content">
              <div className="ft-company-button-menu-item-wrapper">
                <button
                  className="ft-company-button-menu-item"
                  onClick={() => {
                    navigate('settings/account');
                    closeMenu();
                    // Focus First Name field after navigation renders
                    setTimeout(() => {
                      const input = document.querySelector('[data-field="first-name"]') as HTMLInputElement;
                      input?.focus();
                    }, 100);
                  }}
                >
                  <Icon variant="user-pen" size="sm" className="ft-company-button-menu-icon" />
                  <div className="ft-company-button-menu-value">
                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '*Complete Your Setup'}
                  </div>
                </button>
              </div>

              <div className="ft-company-button-menu-item-wrapper">
                <button
                  className="ft-company-button-menu-item"
                  onClick={() => {
                    navigate('settings/account');
                    closeMenu();
                    // Set hash after navigate so Tabs.panels can read it
                    setTimeout(() => {
                      window.location.hash = 'genome';
                    }, 50);
                  }}
                >
                  <Icon variant="dna" size="sm" className="ft-company-button-menu-icon" />
                  <div className="ft-company-button-menu-value">Professional Genome</div>
                </button>
              </div>

              <div className="ft-company-button-menu-item-wrapper">
                <button
                  ref={businessLocationButtonRef}
                  className="ft-company-button-menu-item"
                  onClick={() => {
                    setShowCountrySelector(true);
                  }}
                >
                  <span className="ft-company-button-menu-icon ft-company-button-menu-flag">
                    {user?.businessCountry === 'AU' ? '🇦🇺' : user?.businessCountry === 'US' ? '🇺🇸' : user?.businessCountry === 'GB' ? '🇬🇧' : '🌍'}
                  </span>
                  <div className="ft-company-button-menu-value">Business Location</div>
                </button>
              </div>

              <div className="ft-company-button-menu-item-wrapper">
                <button
                  className="ft-company-button-menu-item"
                  onClick={() => {
                    // Trigger BrandLogoButton file picker
                    const fileInput = document.querySelector('.ft-brandlogo-button-file-input') as HTMLInputElement;
                    if (fileInput) {
                      fileInput.click();
                    }
                    closeMenu();
                  }}
                >
                  <Icon variant="image-plus" size="sm" className="ft-company-button-menu-icon" />
                  <div className="ft-company-button-menu-value">
                    {user?.brandLogoUrl ? 'Change Your Logo' : 'Add Your Logo'}
                  </div>
                </button>
              </div>
            </div>

            <div className="ft-company-button-menu-footer">
              <div className="ft-company-button-menu-link-wrapper">
                <button
                  className="ft-company-button-menu-link"
                  onClick={() => {
                    navigate('settings/account');
                    closeMenu();
                  }}
                >
                  <Edit className="ft-company-button-menu-link-icon" />
                  Update Details
                </button>
              </div>
            </div>
          </div>

          <div
            className="ft-company-button-backdrop"
            onClick={() => {
              closeMenu();
              // Also close UserButton menu if open
              const userButtonAvatar = document.querySelector('.ft-userbutton-avatar--active');
              if (userButtonAvatar) {
                (userButtonAvatar as HTMLElement).click();
              }
            }}
          />
        </>
      )}

      {showCountrySelector && (
        <CountrySelector
          align="left"
          triggerRef={businessLocationButtonRef}
          onClose={() => setShowCountrySelector(false)}
        />
      )}
    </div>
  );
}
