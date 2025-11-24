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
import { useRouter } from 'next/navigation';
import { Building2, ChevronsUpDown, Edit, PackageOpen, ImageUp } from 'lucide-react';
import BrandLogoButton from '@/features/BrandLogoButton';
import CountrySelector from '@/features/CountrySelector';
import { useFuse } from '@/store/fuse';
import { Icon } from '@/prebuilts';
import { formatSubscriptionStatus, type SubscriptionStatus } from '@/fuse/constants/ranks';

export default function CompanyButton() {
  const router = useRouter();
  const user = useFuse((s) => s.user);
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
              <PackageOpen className="ft-company-button-menu-header-icon" />
              <div className="ft-company-button-menu-header-text">
                Your Entity Details
              </div>
            </div>

            <div className="ft-company-button-menu-content">
              <div className="ft-company-button-menu-item-wrapper">
                <button
                  className="ft-company-button-menu-item"
                  onClick={() => {
                    router.push('/settings/account');
                    closeMenu();
                  }}
                >
                  <Building2 className="ft-company-button-menu-icon" />
                  <div className="ft-company-button-menu-value">
                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '*Setup Is Incomplete'}
                  </div>
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
                  <ImageUp className="ft-company-button-menu-icon" />
                  <div className="ft-company-button-menu-value">
                    {user?.brandLogoUrl ? 'Change Brand Logo' : 'Add Brand Logo'}
                  </div>
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
                    router.push('/settings/plan');
                    closeMenu();
                  }}
                >
                  <Icon variant="gem" size="sm" className="ft-company-button-menu-icon" />
                  <div className="ft-company-button-menu-value">Upgrade Plan</div>
                </button>
              </div>
            </div>

            <div className="ft-company-button-menu-footer">
              <div className="ft-company-button-menu-link-wrapper">
                <button
                  className="ft-company-button-menu-link"
                  onClick={() => {
                    router.push('/settings/account');
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
