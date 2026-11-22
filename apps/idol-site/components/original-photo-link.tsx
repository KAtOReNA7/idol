'use client';

import type {ComponentProps, MouseEvent} from 'react';

type OriginalPhotoLinkProps = Pick<ComponentProps<'a'>, 'className' | 'aria-label' | 'children'> & {
  href: string;
  onOpen: (src: string) => void;
};

function hasModifier(event: Pick<MouseEvent, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'>) {
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

export function OriginalPhotoLink({href, onOpen, ...props}: OriginalPhotoLinkProps) {
  return <a {...props} href={href} aria-haspopup="dialog" data-original-photo="" ref={link => {
    if (!link) return;
    const open = (request: Event) => {
      request.preventDefault();
      link.focus({preventScroll:true});
      onOpen(href);
    };
    link.addEventListener('stage-original-photo-open', open);
    return () => link.removeEventListener('stage-original-photo-open', open);
  }}
    onClick={event => {
      if (event.defaultPrevented || event.button !== 0 || hasModifier(event)) return;
      event.preventDefault();
      event.currentTarget.focus({preventScroll: true});
      onOpen(href);
    }}
    onKeyDown={event => {
      if (event.defaultPrevented || event.key !== ' ' || hasModifier(event)) return;
      event.preventDefault();
      if (!event.repeat) event.currentTarget.click();
    }}/>;
}
