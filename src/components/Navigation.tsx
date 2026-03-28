import { Mail, Phone, Menu, X, MessageCircle, ExternalLink, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type NavItem = { id: string; label: string; href?: string; children?: NavItem[] };
type NavGroup = {
  id: string;
  label: string;
  type: 'link' | 'dropdown';
  items: NavItem[];
};

// 🔗 In futuro incolla qui il link (script esterno) dell’Area Riservata.
// Lasciando vuoto, l’icona resta visibile ma non cliccabile.
const RESERVED_AREA_URL = 'https://script.google.com/macros/s/AKfycbwPOc4xdrCreKDBfdnNPVXw0mS-GfGS3RcrFpBVSSc-5Rpi5eq55FJkXcoYaWn-u2XV/exec';

const Navigation = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isTop, setIsTop] = useState(true);

  // ✅ Menu raggruppato (stile “mega menu” come screenshot)
  const navGroups: NavGroup[] = useMemo(
    () => [
      // ✅ Home (da sola)
      {
        id: 'home',
        label: 'Home',
        type: 'link',
        items: [{ id: 'home', label: 'Home' }],
      },
      // ✅ Eventi (dropdown con sottomenu su WYD)
      {
        id: 'eventi',
        label: 'Eventi',
        type: 'dropdown',
        items: [
          { id: 'prossimi-eventi', label: 'Estate 2026' },
          {
            id: 'wyd-submenu',
            label: 'WYD Seul 2027',
            children: [
              { id: 'giorni-alla-partenza', label: 'Giorni alla partenza' },
              { id: 'wyd-seul', label: 'WYD Seul 2027' },
              { id: 'sezione-video', label: 'Video promo GMG 2027' },
              { id: 'gmg-2027-iscrizione', label: 'Iscrizione GMG 2027' },
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
      // ✅ Comunicazioni (sezione da sola)
      {
        id: 'comunicazioni',
        label: 'Comunicazioni',
        type: 'link',
        items: [{ id: 'comunicazioni', label: 'Comunicazioni' }],
      },
      // ✅ Versamenti e donazioni (sezione da sola)
      {
        id: 'donazioni',
        label: 'Versamenti e donazioni',
        type: 'link',
        items: [{ id: 'donazioni', label: 'Versamenti e donazioni' }],
      },
    ],
    []
  );

  // ✅ Target reali (sezioni + link esterni) escludendo i “trigger” del sottomenu
  const navTargets = useMemo(() => {
    const out: NavItem[] = [];
    for (const g of navGroups) {
      for (const it of g.items) {
        if (it.children?.length) {
          out.push(...it.children);
        } else {
          out.push(it);
        }
      }
    }
    return out;
  }, [navGroups]);

  useEffect(() => {
    const handleScroll = () => {
      const sectionTargets = navTargets.filter((i) => !i.href);
      const sections = sectionTargets.map((item) => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 120;

      // ✅ In cima (hero): menu trasparente. Appena scorri: menu bianco così le scritte restano leggibili
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 88;
    window.scrollTo({ top: el.offsetTop - offset, behavior: 'smooth' });
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const isGroupActive = (groupId: string) => {
    const group = navGroups.find((g) => g.id === groupId);
    if (!group) return false;
    return group.items.some((i) => i.id === activeSection || i.children?.some((c) => c.id === activeSection));
  };

  // ✅ Trasparente solo in cima; bianco quando scorri o interagisci
  const headerIsWhite = !isTop || isInteracting || !!openDropdown || mobileMenuOpen;
  const baseText = headerIsWhite ? 'text-black' : 'text-white';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        headerIsWhite ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => {
        setIsInteracting(false);
        setOpenDropdown(null);
        setOpenSubmenu(null);
      }}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* ✅ Logo CnC (hover + link esterno) */}
          <div className="flex items-center">
            <a
              href="https://neocatechumenaleiter.org/it/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center"
              title="Apri neocatechumenaleiter.org"
              aria-label="Apri il sito neocatechumenaleiter.org (si apre in una nuova scheda)"
            >
              <div
                className={`relative w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center text-white font-bold text-xl cursor-pointer transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-amber-400 group-hover:ring-offset-2 ${
                  headerIsWhite ? 'ring-offset-white' : 'ring-offset-transparent'
                }`}
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

          {/* Mobile toggle */}
          <button
            className={`lg:hidden transition-colors ${baseText}`}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? 'Chiudi menu' : 'Apri menu'}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* ✅ Desktop: menu raggruppato */}
          <div className="hidden lg:flex items-center gap-10">
            {navGroups.map((group) => {
              const active = isGroupActive(group.id);
              const isOpen = openDropdown === group.id;
              const underline = active || isOpen;

              // ✅ LINK: nessuna tendina, click va alla sezione
              if (group.type === 'link') {
                return (
                  <button
                    key={group.id}
                    onClick={() => scrollToSection(group.items[0].id)}
                    className={`relative px-2 py-2 text-sm font-serif tracking-wide transition-colors ${baseText} hover:opacity-80`}
                    aria-label={group.label}
                  >
                    <span className={active ? 'font-semibold' : ''}>{group.label}</span>
                    <span
                      className={`absolute left-0 right-0 -bottom-1 h-[2px] transition-all duration-200 ${
                        underline ? 'bg-blue-600 opacity-100' : 'bg-transparent opacity-0'
                      }`}
                    />
                  </button>
                );
              }

              // ✅ DROPDOWN
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
                    <span className={active ? 'font-semibold' : ''}>{group.label}</span>
                    <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    <span
                      className={`absolute left-0 right-0 -bottom-1 h-[2px] transition-all duration-200 ${
                        underline ? 'bg-blue-600 opacity-100' : 'bg-transparent opacity-0'
                      }`}
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

                        {/* ✅ Layout speciale per Eventi: sottomenu a destra su WYD */}
                        {group.id === 'eventi' ? (
                          <div className="grid grid-cols-2 gap-3">
                            {/* Colonna sinistra */}
                            <div className="space-y-1">
                              {group.items.map((item) => {
                                const isTrigger = !!item.children?.length;
                                const isSelected = !item.href && !isTrigger && activeSection === item.id;
                                const cls = `w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center justify-between ${
                                  isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-black hover:bg-gray-50'
                                }`;

                                if (isTrigger) {
                                  const open = openSubmenu === item.id;
                                  return (
                                    <button
                                      key={item.id}
                                      onMouseEnter={() => setOpenSubmenu(item.id)}
                                      onFocus={() => setOpenSubmenu(item.id)}
                                      onClick={() => setOpenSubmenu(open ? null : item.id)}
                                      className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center justify-between ${
                                        open ? 'bg-gray-50 font-semibold' : 'text-black hover:bg-gray-50'
                                      }`}
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
                                  <button
                                    key={item.id}
                                    onMouseEnter={() => setOpenSubmenu(null)}
                                    onClick={() => scrollToSection(item.id)}
                                    className={cls}
                                  >
                                    <span className="font-serif">{item.label}</span>
                                    <span className="text-gray-400">›</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Colonna destra: sottomenu */}
                            <div className="space-y-1">
                              {(() => {
                                const trigger = group.items.find((it) => it.id === openSubmenu && it.children?.length);
                                const children = trigger?.children ?? [];
                                if (!children.length) {
                                  return (
                                    <div className="h-full rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                                      Seleziona “WYD Seul 2027”
                                    </div>
                                  );
                                }

                                return children.map((child) => {
                                  const isSelected = !child.href && activeSection === child.id;
                                  const cls = `w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center justify-between ${
                                    isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-black hover:bg-gray-50'
                                  }`;

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
                                        <span className="font-serif">{child.label}</span>
                                        <span className="text-gray-400">↗</span>
                                      </a>
                                    );
                                  }

                                  return (
                                    <button
                                      key={child.id}
                                      onClick={() => scrollToSection(child.id)}
                                      className={cls}
                                    >
                                      <span className="font-serif">{child.label}</span>
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
                              const cls = `w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center justify-between ${
                                !item.href && activeSection === item.id
                                  ? 'bg-blue-50 text-blue-700 font-semibold'
                                  : 'text-black hover:bg-gray-50'
                              }`;

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
                                <button
                                  key={item.id}
                                  onClick={() => scrollToSection(item.id)}
                                  className={cls}
                                >
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

          {/* Icone a destra (mail + login + telefono) */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="mailto:pellegrinaggio.cnc.piemonte@gmail.com"
              className={`transition-colors ${headerIsWhite ? 'text-black hover:text-amber-700' : 'text-white hover:text-amber-200'}`}
              aria-label="Invia una email"
              title="Email"
            >
              <Mail size={20} />
            </a>

            {/* ✅ Icona Area riservata (sempre visibile; link pronto ma non attivo se URL vuoto) */}
            {RESERVED_AREA_URL ? (
              <a
                href={RESERVED_AREA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
                aria-label="Apri area riservata"
                title="Area riservata"
              >
                <img
                  src="/images/login.png"
                  alt="Area riservata"
                  className={`w-5 h-5 ${headerIsWhite ? 'brightness-0' : 'brightness-0 invert'}`}
                />
              </a>
            ) : (
              <span className="opacity-80" title="Area riservata (prossimamente)">
                <img
                  src="/images/login.png"
                  alt="Area riservata"
                  className={`w-5 h-5 ${headerIsWhite ? 'brightness-0' : 'brightness-0 invert'}`}
                />
              </span>
            )}

            {/* ✅ Assistenza (apre link chat esterno) */}
            <a
              href="https://tawk.to/chat/65fdae1ba0c6737bd123b4bd/1hpjf07eo"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${headerIsWhite ? 'text-black hover:text-amber-700' : 'text-white hover:text-amber-200'}`}
              aria-label="Apri assistenza online"
              title="Assistenza online"
            >
              <MessageCircle size={20} />
            </a>

            <button
              onClick={() => setPhoneModalOpen(true)}
              className={`transition-colors ${headerIsWhite ? 'text-black hover:text-amber-700' : 'text-white hover:text-amber-200'}`}
              aria-label="Apri contatto telefonico"
              title="Telefono / WhatsApp"
            >
              <Phone size={20} />
            </button>
          </div>
        </div>

        {/* ✅ Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-3">
              {navGroups.map((group) => (
                <div key={group.id} className="px-2">
                  <div className="text-xs uppercase tracking-wider text-gray-500 px-2 py-2">{group.label}</div>
                  <div className="flex flex-col gap-1">
                    {group.items.map((item) => {
                      const cls = `px-4 py-2 text-sm font-serif tracking-wider text-left transition-all rounded-full ${
                        !item.href && activeSection === item.id ? 'bg-black text-white' : 'text-black hover:bg-gray-100'
                      }`;

                      // ✅ Mobile: sottomenu (Eventi > WYD)
                      if (group.id === 'eventi' && item.children?.length) {
                        const open = openSubmenu === item.id;
                        return (
                          <div key={item.id} className="flex flex-col gap-1">
                            <button
                              onClick={() => setOpenSubmenu(open ? null : item.id)}
                              className={`px-4 py-2 text-sm font-serif tracking-wider text-left transition-all rounded-full flex items-center justify-between ${
                                open ? 'bg-gray-100 text-black' : 'text-black hover:bg-gray-100'
                              }`}
                            >
                              <span>{item.label}</span>
                              <span className="text-gray-500">{open ? '˄' : '˅'}</span>
                            </button>
                            {open && (
                              <div className="pl-4 flex flex-col gap-1">
                                {item.children.map((child) => {
                                  const ccls = `px-4 py-2 text-sm font-serif tracking-wider text-left transition-all rounded-full ${
                                    !child.href && activeSection === child.id
                                      ? 'bg-black text-white'
                                      : 'text-black hover:bg-gray-100'
                                  }`;
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
                                        className={ccls}
                                      >
                                        {child.label}
                                      </a>
                                    );
                                  }
                                  return (
                                    <button
                                      key={child.id}
                                      onClick={() => scrollToSection(child.id)}
                                      className={ccls}
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
                            {item.label}
                          </a>
                        );
                      }

                      return (
                        <button key={item.id} onClick={() => scrollToSection(item.id)} className={cls}>
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-4 px-4 pt-2">
                <a href="mailto:pellegrinaggio.cnc.piemonte@gmail.com" className="text-black hover:text-amber-700 transition-colors">
                  <Mail size={20} />
                </a>
                <a
                  href={RESERVED_AREA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-80"
                  aria-label="Apri area riservata"
                  title="Area riservata"
                >
                  <img src="/images/login.png" alt="Area riservata" className="w-5 h-5 brightness-0" />
                </a>
                <a
                  href="https://tawk.to/chat/65fdae1ba0c6737bd123b4bd/1hpjf07eo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-amber-700 transition-colors"
                  aria-label="Apri assistenza online"
                  title="Assistenza online"
                >
                  <MessageCircle size={20} />
                </a>
                <button onClick={() => setPhoneModalOpen(true)} className="text-black hover:text-amber-700 transition-colors">
                  <Phone size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal telefono */}
        {phoneModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setPhoneModalOpen(false)}>
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full mx-auto flex items-center justify-center text-white">
                  <Phone size={32} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-black">Contattaci</h2>
                <p className="text-gray-600 text-sm">Connettiti con noi tramite WhatsApp</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-black">+39 347 465 9282</p>
                </div>
                <a
                  href="https://wa.me/393474659282"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 w-full justify-center bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  <MessageCircle size={20} />
                  Apri WhatsApp
                </a>
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
