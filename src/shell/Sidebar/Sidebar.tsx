/**──────────────────────────────────────────────────────────────────────┐
│  📍 SIDEBAR - Navigation Panel (WCCC ly-* Compliant)                  │
│  /src/shell/Sidebar/Sidebar.tsx                                       │
│                                                                        │
│  Building from scratch - iterative, user-directed.                    │
│  Old sidebar preserved in /src/appshell/ as reference.                │
└────────────────────────────────────────────────────────────────────────┘ */

"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight, ChevronsUpDown } from 'lucide-react';
import UserButton from '@/features/UserButton';
import CompanyButton from '@/features/CompanyButton';
import { useFuse } from '@/store/fuse';
import { Icon } from '@/prebuilts';
import { getNavForRank } from './navigation';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useFuse((s) => s.user);
  const rank = useFuse ((s) => s.rank);
  const expandedSections = useFuse((s) => s.navigation.expandedSections);
  const toggleSection = useFuse((s) => s.toggleSection);
  const collapseAllSections = useFuse((s) => s.collapseAllSections);
  const [isFooterMenuOpen, setIsFooterMenuOpen] = useState(false);

  const navItems = getNavForRank(rank);
  const hydrateExpandedSections = useFuse((s) => s.hydrateExpandedSections);

  // Hydrate expanded sections from localStorage on mount
  useEffect(() => {
    hydrateExpandedSections();
  }, [hydrateExpandedSections]);

  // Watch for UserButton menu open/close state
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const menu = document.querySelector('.ft-userbutton-menu');
      setIsFooterMenuOpen(!!menu);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const hasOpenSections = expandedSections.length > 0;

  return (
    <aside className="ly-sidebar-container">
      {/* Header - Company/Org selector */}
      <CompanyButton />

      {/* Navigation Content */}
      <div className="ly-sidebar-content">
        {hasOpenSections && (
          <button
            className="ly-sidebar-collapse-all"
            onClick={collapseAllSections}
            title="Collapse all sections"
          >
            <Icon variant="chevrons-up" size="sm" className="ly-sidebar-collapse-all-icon" />
          </button>
        )}
        {navItems.map((item) => {
          if (item.path && !item.children) {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                className={`ly-sidebar-button ${active ? 'ly-sidebar-button--active' : ''}`}
                onClick={() => router.push(item.path!)}
              >
                <Icon variant={item.icon} size="sm" className="ly-sidebar-icon" />
                <span>{item.label}</span>
              </button>
            );
          }

          if (item.children) {
            const open = expandedSections.includes(item.label.toLowerCase());
            const hasActiveChild = item.children.some((child) => isActive(child.path));
            return (
              <div key={item.label} className="ly-sidebar-section">
                <button
                  className={`ly-sidebar-button ${hasActiveChild ? 'ly-sidebar-button--active' : ''}`}
                  onClick={() => toggleSection(item.label.toLowerCase())}
                >
                  <Icon variant={item.icon} size="sm" className="ly-sidebar-icon" />
                  <span>{item.label}</span>
                  <ChevronRight
                    className={`ly-sidebar-chevron ${open ? 'ly-sidebar-chevron--open' : ''}`}
                  />
                </button>

                {open && (
                  <div className="ly-sidebar-sublinks">
                    {item.children.map((child) => {
                      const childActive = isActive(child.path);
                      return (
                        <button
                          key={child.path}
                          className={`ly-sidebar-sublink ${childActive ? 'ly-sidebar-sublink--active' : ''}`}
                          onClick={() => router.push(child.path)}
                        >
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Footer - User profile */}
      <div
        className={`ly-sidebar-footer ${isFooterMenuOpen ? 'ly-sidebar-footer--active' : ''}`}
        onMouseDown={(e) => {
          // Don't trigger if clicking inside the UserButton itself (let it handle its own clicks)
          if ((e.target as HTMLElement).closest('.ft-userbutton-container')) {
            return;
          }
          // Don't trigger if the menu is currently open (prevents reopening during close animation)
          const menu = document.querySelector('.ft-userbutton-menu');
          if (menu) {
            return;
          }
          // Close CompanyButton menu if open
          const companyMenu = document.querySelector('.ft-company-button-menu');
          if (companyMenu) {
            const backdrop = document.querySelector('.ft-company-button-backdrop') as HTMLElement;
            backdrop?.click();
          }
          // Trigger the UserButton avatar click
          const avatarWrapper = document.querySelector('.ly-sidebar-footer .ft-userbutton-avatar-wrapper') as HTMLElement;
          avatarWrapper?.click();
        }}
      >
        <div className="ly-sidebar-footer-userbutton" onClick={(e) => e.stopPropagation()}>
          <UserButton />
        </div>
        <div className="ly-sidebar-footer-text">
          <div className="ly-sidebar-footer-name">
            {(user as Record<string, unknown>)?.socialName as string || user?.email?.split('@')[0] || 'Call Sign'}
          </div>
          <div className="ly-sidebar-footer-email">{user?.email || 'user@email.com'}</div>
        </div>
        <ChevronsUpDown
          className={`ly-sidebar-footer-chevron ${
            ((user as Record<string, unknown>)?.socialName as string || user?.email?.split('@')[0] || 'Call Sign').length > 12 ||
            (user?.email || 'user@email.com').length > 14
              ? 'ly-sidebar-footer-chevron--hidden'
              : ''
          }`}
        />
      </div>
    </aside>
  );
}
