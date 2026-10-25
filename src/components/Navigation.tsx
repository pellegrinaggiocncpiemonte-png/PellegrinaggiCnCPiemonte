import { Mail, Phone, Menu, X, MessageCircle, ExternalLink, ChevronDown, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { QUICK_ACTIONS, SITE_CONFIG } from '../config/siteConfig';
import { getSitePageFromPath, navigateToSection, SECTION_PAGE } from '../config/sitePages';

type NavItem = { id: string; label: string; href?: string; children?: NavItem[] };
type NavGroup = {
  id: string;
  label: string;
  type: 'link' | 'dropdown';
  items: NavItem[];
};

const Navigation = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [reservedChoiceOpen, setReservedChoiceOpen] = useState(false);
  const [isTop, setIsTop] = useState(true);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const navGroups: NavGroup[] = useMemo(
    () => [
      {
        id: 'home',
        label: 'Home',
        type: 'link',
        items: [{ id: 'home', label: 'Home' }],
      },
      {
        id: 'pellegrinaggio',
        label: 'Pellegrinaggio',
        type: 'dropdown',
        items: [
          { id: 'gmg-2027-iscrizione', label: 'Iscrizione gruppo Piemonte e Svizzera' },
          { id: 'wyd-seul', label: 'GMG Seoul 2027' },
          { id: 'incontro-vocazionale', label: 'Incontro vocazionale · 9 agosto' },
        ],
      },
      {
        id: 'documenti',
        label: 'Passaporti e visti',
        type: 'dropdown',
        items: [
          { id: 'passaporti', label: 'Avvisi passaporto' },
          { id: 'visti-passaporti', label: 'Visti e richiesta passaporto' },
        ],
      },
      {
        id: 'media',
        label: 'Contenuti',
        type: 'dropdown',
        items: [
          { id: 'sezione-video', label: 'Video' },
          { id: 'canti-in-coreano', label: 'Canti pellegrinaggio 2027' },
        ],
      },
      {
        id: 'donazioni',
        label: 'Versamenti',
        type: 'link',
        items: [{ id: 'donazioni', label: 'Versamenti e donazioni' }],
      },
    ],
    []
  );


  useEffect(() => {
    const syncLocation = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveSection(hash);
        return;
      }
      const page = getSitePageFromPath();
      const defaultSection = Object.entries(SECTION_PAGE).find(([, value]) => value === page)?.[0] ?? 'home';
      setActiveSection(defaultSection);
    };

    syncLocation();
    window.addEventListener('popstate', syncLocation);
    window.addEventListener('site-route-change', syncLocation as EventListener);
    return () => {
      window.removeEventListener('popstate', syncLocation);
      window.removeEventListener('site-route-change', syncLocation as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsTop(window.scrollY < 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  useEffect(() => {
    const updateViewport = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobileViewport(mobile);

      // Evita che un menu rimanga aperto nella modalità sbagliata durante il ridimensionamento.
      if (mobile) {
        setOpenDropdown(null);
      } else {
        setMobileMenuOpen(false);
        setOpenSubmenu(null);
        setOpenMobileGroup(null);
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!reservedChoiceOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [reservedChoiceOpen]);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileMenuOpen(false);
      setOpenDropdown(null);
      setOpenSubmenu(null);
      setOpenMobileGroup(null);
      setPhoneModalOpen(false);
      setReservedChoiceOpen(false);
    };

    window.addEventListener('keydown', closeWithEscape);
    return () => window.removeEventListener('keydown', closeWithEscape);
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-site-nav]')) return;
      setOpenDropdown(null);
      setOpenSubmenu(null);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  const openReservedChoice = () => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    setOpenSubmenu(null);
    setOpenMobileGroup(null);
    setReservedChoiceOpen(true);
  };

  useEffect(() => {
    const handleOpenReservedChoice = () => openReservedChoice();
    window.addEventListener('reserved-area-choice:open', handleOpenReservedChoice);
    return () => window.removeEventListener('reserved-area-choice:open', handleOpenReservedChoice);
  }, []);

  const scrollToSection = (id: string) => {
    navigateToSection(id);
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    setOpenSubmenu(null);

    if (id === 'donazioni') {
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('payment-instructions:open'));
      }, 420);
    }
  };


  const isGroupActive = (groupId: string) => {
    const group = navGroups.find((g) => g.id === groupId);
    if (!group) return false;
    return group.items.some((item) => item.id === activeSection || item.children?.some((child) => child.id === activeSection));
  };

  const headerIsWhite = getSitePageFromPath() !== 'home' || !isTop || (!!openDropdown && !isMobileViewport) || mobileMenuOpen;
  const baseText = headerIsWhite ? 'text-black' : 'text-white';
  const quickActionIconClass = headerIsWhite ? 'text-black hover:text-amber-700' : 'text-white hover:text-amber-200';
  const quickActionLabelClass = headerIsWhite ? 'text-black/70' : 'text-white/80';

  const renderNavLabel = (label: string) => (
    <span className="min-w-0 break-words whitespace-normal leading-snug">{label}</span>
  );


  const renderQuickAction = (action: (typeof QUICK_ACTIONS)[number], mobile = false) => {
    const wrapperClass = mobile
      ? 'flex w-full min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-3 text-center text-slate-900 transition hover:bg-slate-100'
      : 'flex min-w-[68px] flex-col items-center justify-center gap-1 text-center';
    const labelClass = mobile ? 'text-[11px] leading-tight font-semibold tracking-normal' : 'text-[11px] leading-tight font-medium';
    const iconClass = `transition-colors ${mobile ? quickActionIconClass : quickActionIconClass}`;
    const captionClass = `${quickActionLabelClass} ${labelClass}`;

    if (action.type === 'reserved-area') {
      const content = (
        <>
          <img
            src="/images/login.png"
            alt=""
            aria-hidden="true"
            className={`${mobile ? 'w-[18px] h-[18px]' : 'w-5 h-5'} ${headerIsWhite ? 'brightness-0' : 'brightness-0 invert'}`}
          />
          <span className={captionClass}>{action.label}</span>
        </>
      );

      return (
        <button
          key={action.id}
          type="button"
          onClick={openReservedChoice}
          className={`relative ${wrapperClass} transition-all hover:scale-105`}
          aria-label="Vai all'Area riservata"
          title="Area riservata"
        >
          {content}
        </button>
      );
    }

    if (action.type === 'modal') {
      return (
        <button
          key={action.id}
          onClick={() => setPhoneModalOpen(true)}
          className={wrapperClass}
          aria-label="Apri contatto telefonico"
          title={action.label}
        >
          <Phone size={mobile ? 18 : 20} className={iconClass} />
          <span className={captionClass}>{action.label}</span>
        </button>
      );
    }

    if (action.type === 'section') {
      return (
        <button
          key={action.id}
          onClick={() => scrollToSection(action.targetId)}
          className={`relative ${wrapperClass}`}
          aria-label="Vai alle istruzioni per installare la web app"
          title={action.label}
        >
          <Smartphone size={mobile ? 18 : 20} className={iconClass} />
          <span className={captionClass}>{action.label}</span>
        </button>
      );
    }

    const icon = <Mail size={mobile ? 18 : 20} className={iconClass} />;

    return (
      <a
        key={action.id}
        href={action.href}
        className={wrapperClass}
        aria-label={action.id === 'email' ? 'Invia una email' : 'Apri assistenza online'}
        title={action.label}
      >
        {icon}
        <span className={captionClass}>{action.label}</span>
      </a>
    );
  };

  return (
    <header
      data-site-nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${headerIsWhite ? 'bg-white shadow-md' : 'bg-transparent'}`}
    >
      <nav className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center shrink-0">
            <a
              href="https://neocatechumenaleiter.org/it/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center"
              title="Apri neocatechumenaleiter.org"
              aria-label="Apri il sito neocatechumenaleiter.org (si apre in una nuova scheda)"
            >
              <div
                className={`relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl cursor-pointer transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-amber-400 group-hover:ring-offset-2 ${headerIsWhite ? 'ring-offset-white' : 'ring-offset-transparent'}`}
              >
                CnC
                <span className="absolute -right-1 -bottom-1 opacity-0 scale-90 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100">
                  <span className="bg-white text-black rounded-full p-1 shadow-md inline-flex">
                    <ExternalLink size={12} />
                  </span>
                </span>
              </div>
            </a>
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-center gap-5 xl:gap-7">
            {navGroups.map((group) => {
              const active = isGroupActive(group.id);
              const isOpen = openDropdown === group.id;
              const underline = active || isOpen;

              if (group.type === 'link') {
                return (
                  <button
                    key={group.id}
                    onClick={() => scrollToSection(group.items[0].id)}
                    className={`relative px-2 py-2 text-sm font-serif tracking-wide transition-colors ${baseText} hover:opacity-80`}
                    aria-label={group.label}
                  >
                    <span className={active ? 'font-semibold' : ''}>{renderNavLabel(group.label)}</span>
                    <span
                      className={`absolute left-0 right-0 -bottom-1 h-[2px] transition-all duration-200 ${underline ? 'bg-blue-600 opacity-100' : 'bg-transparent opacity-0'}`}
                    />
                  </button>
                );
              }

              return (
                <div key={group.id} className="relative">
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                    className={`relative px-2 py-2 text-sm font-serif tracking-wide transition-colors ${baseText} hover:opacity-80 flex items-center gap-2`}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                  >
                    <span className={active ? 'font-semibold' : ''}>{renderNavLabel(group.label)}</span>
                    <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    <span
                      className={`absolute left-0 right-0 -bottom-1 h-[2px] transition-all duration-200 ${underline ? 'bg-blue-600 opacity-100' : 'bg-transparent opacity-0'}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="desktop-nav-popover fixed left-1/2 -translate-x-1/2 w-[min(620px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] bg-white shadow-2xl rounded-xl border border-gray-200 overflow-x-hidden overflow-y-auto">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-serif font-bold text-black">{group.label}</h3>
                          <button
                            className="text-gray-400 hover:text-black transition-colors"
                            onClick={() => {
                              setOpenDropdown(null);
                              setOpenSubmenu(null);
                            }}
                            aria-label="Chiudi"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {group.id === 'eventi' ? (
                          <div className="grid min-w-0 grid-cols-2 gap-3">
                            <div className="min-w-0 space-y-1">
                              {group.items.map((item) => {
                                const isTrigger = !!item.children?.length;
                                const isSelected = !item.href && !isTrigger && activeSection === item.id;
                                const cls = `w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center justify-between ${isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-black hover:bg-gray-50'}`;

                                if (isTrigger) {
                                  const open = openSubmenu === item.id;
                                  return (
                                    <button
                                      key={item.id}
                                      onClick={() => setOpenSubmenu(open ? null : item.id)}
                                      className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center justify-between ${open ? 'bg-gray-50 font-semibold' : 'text-black hover:bg-gray-50'}`}
                                      aria-haspopup="menu"
                                      aria-expanded={open}
                                    >
                                      <span className="font-serif">{renderNavLabel(item.label)}</span>
                                      <span className="text-gray-400">›</span>
                                    </button>
                                  );
                                }

                                if (item.href) {
                                  return (
                                    <a
                                      key={item.id}
                                      href={item.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => {
                                        setOpenDropdown(null);
                                        setOpenSubmenu(null);
                                      }}
                                      className={cls}
                                    >
                                      <span className="font-serif">{item.label}</span>
                                      <span className="text-gray-400">↗</span>
                                    </a>
                                  );
                                }

                                return (
                                  <button key={item.id} onClick={() => scrollToSection(item.id)} className={cls}>
                                    <span className="font-serif">{item.label}</span>
                                    <span className="text-gray-400">›</span>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="min-w-0 space-y-1">
                              {(() => {
                                const trigger = group.items.find((item) => item.id === openSubmenu && item.children?.length);
                                const children = trigger?.children ?? [];

                                if (!children.length) {
                                  return (
                                    <div className="h-full rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                                      Seleziona una voce
                                    </div>
                                  );
                                }

                                return children.map((child) => {
                                  const isSelected = !child.href && activeSection === child.id;
                                  const cls = `w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center justify-between ${isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-black hover:bg-gray-50'}`;

                                  if (child.href) {
                                    return (
                                      <a
                                        key={child.id}
                                        href={child.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => {
                                          setOpenDropdown(null);
                                          setOpenSubmenu(null);
                                        }}
                                        className={cls}
                                      >
                                        <span className="font-serif">{renderNavLabel(child.label)}</span>
                                        <span className="text-gray-400">↗</span>
                                      </a>
                                    );
                                  }

                                  return (
                                    <button key={child.id} onClick={() => scrollToSection(child.id)} className={cls}>
                                      <span className="font-serif">{renderNavLabel(child.label)}</span>
                                      <span className="text-gray-400">›</span>
                                    </button>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {group.items.map((item) => {
                              const cls = `w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center justify-between ${!item.href && activeSection === item.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-black hover:bg-gray-50'}`;

                              if (item.href) {
                                return (
                                  <a
                                    key={item.id}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpenDropdown(null)}
                                    className={cls}
                                  >
                                    <span className="font-serif">{item.label}</span>
                                    <span className="text-gray-400">↗</span>
                                  </a>
                                );
                              }

                              return (
                                <button key={item.id} onClick={() => scrollToSection(item.id)} className={cls}>
                                  <span className="font-serif">{item.label}</span>
                                  <span className="text-gray-400">›</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-4 shrink-0">
            {QUICK_ACTIONS.map((action) => renderQuickAction(action))}
          </div>

          <div className="flex flex-1 min-w-0 items-center justify-end gap-3 lg:hidden">
            <button
              type="button"
              onClick={openReservedChoice}
              className={`mobile-reserved-shortcut inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${headerIsWhite ? 'bg-slate-100 text-slate-950 hover:bg-slate-200' : 'bg-white/12 text-white hover:bg-white/20'}`}
              aria-label="Area Riservata"
            >
              <img
                src="/images/login.png"
                alt=""
                aria-hidden="true"
                className={`h-5 w-5 ${headerIsWhite ? 'brightness-0' : 'brightness-0 invert'}`}
              />
              <span>Area Riservata</span>
            </button>
            <button
              className={`shrink-0 rounded-full p-2 transition-colors ${headerIsWhite ? 'text-black hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
              onClick={() => setMobileMenuOpen((value) => !value)}
              aria-label={mobileMenuOpen ? 'Chiudi menu' : 'Apri menu'}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-nav-panel lg:hidden border-t border-slate-200 bg-white shadow-2xl">
            <div className="mx-auto w-full max-w-screen-lg px-4 pb-7 pt-4">
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Navigazione</p>
              </div>

              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {navGroups.map((group) => {
                  const isLink = group.type === 'link';
                  const open = openMobileGroup === group.id;
                  const active = isGroupActive(group.id);

                  if (isLink) {
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => scrollToSection(group.items[0].id)}
                        className={`flex w-full items-center justify-between gap-3 py-4 text-left text-[15px] font-semibold transition-colors ${active ? 'text-blue-700' : 'text-slate-950'}`}
                      >
                        <span>{group.label}</span>
                        <span className="text-slate-400">→</span>
                      </button>
                    );
                  }

                  return (
                    <div key={group.id}>
                      <button
                        type="button"
                        onClick={() => setOpenMobileGroup(open ? null : group.id)}
                        className={`flex w-full items-center justify-between gap-3 py-4 text-left text-[15px] font-semibold transition-colors ${active ? 'text-blue-700' : 'text-slate-950'}`}
                        aria-expanded={open}
                      >
                        <span>{group.label}</span>
                        <ChevronDown size={18} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                      </button>
                      {open && (
                        <div className="pb-3 pl-3">
                          {group.items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => scrollToSection(item.id)}
                              className={`block w-full border-l-2 px-4 py-3 text-left text-sm leading-snug transition-colors ${activeSection === item.id ? 'border-blue-600 bg-blue-50 text-blue-800 font-semibold' : 'border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'}`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Azioni rapide</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_ACTIONS.filter((action) => action.type !== 'reserved-area').map((action) => renderQuickAction(action, true))}
                </div>
              </div>
            </div>
          </div>
        )}


        {reservedChoiceOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 px-4 py-6" onClick={() => setReservedChoiceOpen(false)}>
            <div className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-7">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Area Riservata</p>
                  <h2 className="mt-1 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">Come vuoi procedere?</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setReservedChoiceOpen(false)}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                  aria-label="Chiudi"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
                <button
                  type="button"
                  onClick={() => {
                    setReservedChoiceOpen(false);
                    scrollToSection('area-riservata');
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Prima iscrizione</span>
                  <strong className="mt-2 block text-xl text-slate-950">Devo iscrivermi</strong>
                  <span className="mt-2 block text-sm leading-relaxed text-slate-600">Vai alla pagina con tutte le istruzioni per creare il profilo, completare l’iscrizione al pellegrinaggio, i documenti e i versamenti.</span>
                  <span className="mt-4 inline-flex items-center font-semibold text-blue-700">Leggi come iscriversi →</span>
                </button>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Accesso personale</span>
                  <strong className="mt-2 block text-xl text-slate-950">Sono già iscritto</strong>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">Se hai installato l’Area Riservata sul cellulare, aprila direttamente dalla sua icona: è il modo consigliato per utilizzare anche le notifiche push.</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">Puoi comunque entrare dal sito con il browser, ma le funzionalità delle notifiche non sono complete come nella web app installata.</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <a
                      href={SITE_CONFIG.reservedAreaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setReservedChoiceOpen(false)}
                      className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      Accedi / Login
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setReservedChoiceOpen(false);
                        scrollToSection('installa-app');
                      }}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                      Come installare l’app
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {phoneModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setPhoneModalOpen(false)}>
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full mx-auto flex items-center justify-center text-white">
                  <Phone size={32} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-black">Contattaci</h2>
                <p className="text-gray-600 text-sm">Contatti rapidi disponibili via WhatsApp</p>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {SITE_CONFIG.contactPeople.map((contact) => (
                    <div key={contact.phonePlain} className="bg-gray-50 rounded-lg p-4 text-left space-y-3">
                      <div>
                        <p className="text-lg font-bold text-black">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.role}</p>
                      </div>
                      <p className="text-xl font-bold text-black">{contact.phoneDisplay}</p>
                      <a
                        href={`https://wa.me/${contact.phonePlain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 w-full justify-center bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                      >
                        <MessageCircle size={20} />
                        Apri WhatsApp
                      </a>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setPhoneModalOpen(false)}
                  className="w-full text-black px-6 py-2 rounded-lg border-2 border-gray-300 hover:border-black transition-colors"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navigation;
