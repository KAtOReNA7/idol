import type {MouseEvent} from 'react';
import {libraryFormats, type LibraryFormat} from '@/lib/idol/artist-library-format';
import './artist-library-filters.css';

type Props = {
  className: string;
  selected: string;
  counts?: Record<LibraryFormat, number>;
  hrefFor: (format: LibraryFormat) => string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
};

export function ArtistLibraryFilters({className, selected, counts, hrefFor, onNavigate}: Props) {
  return <nav className={className + ' artist-library-filters'} aria-label="作品类型">
    {libraryFormats.map(([format, label]) => {
      const href = hrefFor(format);
      const current = format === selected;
      return <a key={format} href={href} aria-current={current ? 'page' : undefined}
        className={current ? 'is-active' : undefined} onClick={event => onNavigate(event, href)}>
        <span>{label}{counts && ` ${counts[format]}`}</span>
      </a>;
    })}
  </nav>;
}
