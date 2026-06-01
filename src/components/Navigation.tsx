import { Mail, Phone, Menu, X, MessageCircle, ExternalLink, ChevronDown, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { QUICK_ACTIONS, SITE_CONFIG } from '../config/siteConfig';

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
  const [isInteracting, setIsInteracting] = useState(false);
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
        id: 'eventi',
        label: 'Eventi',
        type: 'dropdown',
        items: [
          { id: 'prossimi-eventi', label: 'Estate 2026' },
          {
            id: 'wyd-submenu',
            label: 'WYD Seoul 2027',
            children: [
              { id: 'giorni-alla-partenza', label: 'Giorni alla partenza' },
              { id: 'wyd-seul', label: 'WYD Seoul 2027' },
              { id: 'sezione-video', label: 'Video promo JMJ 2027' },
              { id: 'gmg-2027-iscrizione', label: 'Iscrizione JMJ Seoul 2027' },
              {
                id: 'info-korea',
                label: 'Info Korea',
                href:
                  'https://ambseoul.esteri.it/it/servizi-consolari-e-visti/servizi-per-il-cittadino-italiano/informazioni-utili-allarrivo-in-corea/',
              },
            ],
          },
        ],
      },
      {
        id: 'comunicazioni',
        label: 'Comunicazioni',
        type: 'dropdown',
        items: [
          { id: 'comunicazioni', label: 'Comunicazioni' },
          { id: 'telegram', label: 'Ricevi comunicazioni su Telegram' },
        ],
      },
      {
        id: 'donazioni',
        label: 'Versamenti e donazioni',
        type: 'link',
        items: [{ id: 'donazioni', label: 'Versamenti e donazioni' }],
      },
    ],
    []
  );

  const navTargets = useMemo(() => {
    const out: NavItem[] = [];
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.children?.length) out.push(...item.children);
        else out.push(item);
      }
    }
    return out;
  }, [navGroups]);

  useEffect(() => {
    const handleScroll = () => {
      const sectionTargets = navTargets.filter((item) => !item.href);
      const sections = sectionTargets.map((item) => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 120;

      setIsTop(window.scrollY < 10);

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sectionTargets[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navTargets]);


  useEffect(() => {
    const updateViewport = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.offsetTop - 88, behavior: 'smooth' });
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    setOpenSubmenu(null);
  };

  const isGroupActive = (groupId: string) => {
    const group = navGroups.find((g) => g.id === groupId);
    if (!group) return false;
    return group.items.some((item) => item.id === activeSection || item.children?.some((child) => child.id === activeSection));
  };

  const headerIsWhite = !isTop || (!!openDropdown && !isMobileViewport) || mobileMenuOpen || (!isMobileViewport && isInteracting);
  const baseText = headerIsWhite ? 'text-black' : 'text-white';
  const quickActionIconClass = headerIsWhite ? 'text-black hover:text-amber-700' : 'text-white hover:text-amber-200';
  const quickActionLabelClass = headerIsWhite ? 'text-black/70' : 'text-white/80';

  const renderNavLabel = (label: string, id?: string) => (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="min-w-0">{label}</span>
      {id === 'donazioni' ? (
        <span className="animate-pulse rounded-full bg-emerald-600 px-1.5 py-0.5 text-[8px] font-bold leading-none tracking-wide text-white shadow-sm">
          ATTIVO
        </span>
      ) : null}
      {id === 'gmg-2027-iscrizione' ? (
        <span className="animate-pulse rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-bold leading-none tracking-wide text-white shadow-sm">
          APERTE
        </span>
      ) : null}
      {id === 'telegram' ? (
        <span className="animate-pulse rounded-full bg-sky-500 px-1.5 py-0.5 text-[8px] font-bold leading-none tracking-wide text-white shadow-sm">
          NUOVO
        </span>
      ) : null}
    </span>
  );

  const renderQuickAction = (action: (typeof QUICK_ACTIONS)[number], mobile = false) => {
    const wrapperClass = mobile
      ? 'flex w-full min-w-0 flex-col items-center justify-center gap-0.5 text-center px-0.5'
      : 'flex min-w-[68px] flex-col items-center justify-center gap-1 text-center';
    const labelClass = mobile ? 'text-[8px] leading-[1] font-medium tracking-tight' : 'text-[11px] leading-tight font-medium';
    const iconClass = `transition-colors ${mobile ? quickActionIconClass : quickActionIconClass}`;
    const captionClass = `${quickActionLabelClass} ${labelClass}`;

    if (action.type === 'reserved-area') {
      const content = (
        <>
          <img
            src="/images/login.png"
            alt={action.label}
            className={`${mobile ? 'w-[18px] h-[18px]' : 'w-5 h-5'} ${headerIsWhite ? 'brightness-0' : 'brightness-0 invert'}`}
          />
          <span className={captionClass}>{action.label}</span>
        </>
      );

      return (
        <a
          key={action.id}
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${wrapperClass} transition-opacity hover:opacity-80`}
          aria-label={`Apri ${action.label.toLowerCase()}`}
          title={action.label}
        >
          {content}
        </a>
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
          aria-label="Vai alla sezione Telegram"
          title={action.label}
        >
          <span className={`absolute animate-pulse rounded-full bg-sky-500 font-bold leading-none text-white shadow-md ${mobile ? '-right-0.5 -top-1 min-w-[13px] px-1 py-0.5 text-[8px]' : '-right-1 -top-2 px-1.5 py-0.5 text-[8px]'}`}>
            {mobile ? '!' : 'NUOVO'}
          </span>
          <Send size={mobile ? 18 : 20} className={iconClass} />
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${headerIsWhite ? 'bg-white shadow-md' : 'bg-transparent'}`}
      onMouseEnter={() => {
        if (!isMobileViewport) setIsInteracting(true);
      }}
      onMouseLeave={() => {
        if (!isMobileViewport) {
          setIsInteracting(false);
          setOpenDropdown(null);
          setOpenSubmenu(null);
        }
      }}
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

          <div className="hidden lg:flex flex-1 items-center justify-center gap-10">
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
                    <span className={active ? 'font-semibold' : ''}>{renderNavLabel(group.label, group.id)}</span>
                    <span
                      className={`absolute left-0 right-0 -bottom-1 h-[2px] transition-all duration-200 ${underline ? 'bg-blue-600 opacity-100' : 'bg-transparent opacity-0'}`}
                    />
                  </button>
                );
              }

              return (
                <div key={group.id} className="relative">
                  <button
                    onMouseEnter={() => setOpenDropdown(group.id)}
                    onFocus={() => setOpenDropdown(group.id)}
                    onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                    className={`relative px-2 py-2 text-sm font-serif tracking-wide transition-colors ${baseText} hover:opacity-80 flex items-center gap-2`}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                  >
                    <span className={active ? 'font-semibold' : ''}>{renderNavLabel(group.label, group.id)}</span>
                    <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    <span
                      className={`absolute left-0 right-0 -bottom-1 h-[2px] transition-all duration-200 ${underline ? 'bg-blue-600 opacity-100' : 'bg-transparent opacity-0'}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-[620px] max-w-[90vw] bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden">
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
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              {group.items.map((item) => {
                                const isTrigger = !!item.children?.length;
                                const isSelected = !item.href && !isTrigger && activeSection === item.id;
                                const cls = `w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center justify-between ${isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-black hover:bg-gray-50'}`;

                                if (isTrigger) {
                                  const open = openSubmenu === item.id;
                                  return (
                                    <button
                                      key={item.id}
                                      onMouseEnter={() => setOpenSubmenu(item.id)}
                                      onFocus={() => setOpenSubmenu(item.id)}
                                      onClick={() => setOpenSubmenu(open ? null : item.id)}
                                      className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center justify-between ${open ? 'bg-gray-50 font-semibold' : 'text-black hover:bg-gray-50'}`}
                                      aria-haspopup="menu"
                                      aria-expanded={open}
                                    >
                                      <span className="font-serif">{item.label}</span>
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
                                  <button key={item.id} onMouseEnter={() => setOpenSubmenu(null)} onClick={() => scrollToSection(item.id)} className={cls}>
                                    <span className="font-serif">{item.label}</span>
                                    <span className="text-gray-400">›</span>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="space-y-1">
                              {(() => {
                                const trigger = group.items.find((item) => item.id === openSubmenu && item.children?.length);
                                const children = trigger?.children ?? [];

                                if (!children.length) {
                                  return (
                                    <div className="h-full rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                                      Iscrizioni aperte
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
                                        <span className="font-serif">{renderNavLabel(child.label, child.id)}</span>
                                        <span className="text-gray-400">↗</span>
                                      </a>
                                    );
                                  }

                                  return (
                                    <button key={child.id} onClick={() => scrollToSection(child.id)} className={cls}>
                                      <span className="font-serif">{renderNavLabel(child.label, child.id)}</span>
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

          <div className="flex flex-1 min-w-0 items-center justify-end gap-1 lg:hidden">
            <div className="grid flex-1 min-w-0 grid-cols-4 gap-x-0.5 gap-y-0.5">
              {QUICK_ACTIONS.map((action) => renderQuickAction(action, true))}
            </div>
            <button
              className={`relative shrink-0 transition-colors ${baseText}`}
              onClick={() => setMobileMenuOpen((value) => !value)}
              aria-label={mobileMenuOpen ? 'Chiudi menu' : 'Apri menu'}
            >
              <span className="absolute -right-1.5 -top-1.5 h-3 w-3 animate-pulse rounded-full border border-white bg-emerald-500 shadow-md" aria-hidden="true" />
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t pt-4 bg-white">
            <div className="flex flex-col space-y-3">
              {navGroups.map((group) => (
                <div key={group.id} className="px-2">
                  <div className="text-xs uppercase tracking-wider text-gray-500 px-2 py-2">{group.label}</div>
                  <div className="flex flex-col gap-1">
                    {group.items.map((item) => {
                      const cls = `px-4 py-2 text-sm font-serif tracking-wider text-left transition-all rounded-full ${!item.href && activeSection === item.id ? 'bg-black text-white' : 'text-black hover:bg-gray-100'}`;

                      if (group.id === 'eventi' && item.children?.length) {
                        const open = openSubmenu === item.id;
                        return (
                          <div key={item.id} className="flex flex-col gap-1">
                            <button
                              onClick={() => setOpenSubmenu(open ? null : item.id)}
                              className={`px-4 py-2 text-sm font-serif tracking-wider text-left transition-all rounded-full flex items-center justify-between ${open ? 'bg-gray-100 text-black' : 'text-black hover:bg-gray-100'}`}
                            >
                              <span>{renderNavLabel(item.label, item.id)}</span>
                              <span className="text-gray-500">{open ? '˄' : '˅'}</span>
                            </button>
                            {open && (
                              <div className="pl-4 flex flex-col gap-1">
                                {item.children.map((child) => {
                                  const childClass = `px-4 py-2 text-sm font-serif tracking-wider text-left transition-all rounded-full ${!child.href && activeSection === child.id ? 'bg-black text-white' : 'text-black hover:bg-gray-100'}`;
                                  if (child.href) {
                                    return (
                                      <a
                                        key={child.id}
                                        href={child.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => {
                                          setMobileMenuOpen(false);
                                          setOpenDropdown(null);
                                          setOpenSubmenu(null);
                                        }}
                                        className={childClass}
                                      >
                                        {renderNavLabel(child.label, child.id)}
                                      </a>
                                    );
                                  }
                                  return (
                                    <button key={child.id} onClick={() => scrollToSection(child.id)} className={childClass}>
                                      {renderNavLabel(child.label, child.id)}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
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
                              setMobileMenuOpen(false);
                              setOpenDropdown(null);
                            }}
                            className={cls}
                          >
                            {renderNavLabel(item.label, item.id)}
                          </a>
                        );
                      }

                      return (
                        <button key={item.id} onClick={() => scrollToSection(item.id)} className={cls}>
                          {renderNavLabel(item.label, item.id)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
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
