import { PAGE_META, SitePage } from '../config/sitePages';

type Props = { page: SitePage };

export default function PageIntro({ page }: Props) {
  if (page === 'home') return null;
  const meta = PAGE_META[page];
  return (
    <section className="page-intro" aria-labelledby="page-intro-title">
      <div className="container mx-auto px-4">
        <div className="page-intro-inner">
          <p className="page-intro-eyebrow">{meta.eyebrow}</p>
          <h1 id="page-intro-title">{meta.title}</h1>
          <p className="page-intro-copy">{meta.intro}</p>
        </div>
      </div>
    </section>
  );
}
