'use client';

import type {ComponentProps, MouseEvent} from 'react';

type OriginalPhotoLinkProps = Pick<ComponentProps<'a'>, 'className' | 'aria-label' | 'children'> & {
  href: string;
  onOpen: () => void;
};

function hasModifier(event: Pick<MouseEvent, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'>) {
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

export function OriginalPhotoLink({href, onOpen, ...props}: OriginalPhotoLinkProps) {
  return <a {...props} href={href} aria-haspopup="dialog"
    onClick={event => {
      if (event.defaultPrevented || event.button !== 0 || hasModifier(event)) return;
      event.preventDefault();
      event.currentTarget.focus({preventScroll: true});
      onOpen();
    }}
    onKeyDown={event => {
      if (event.defaultPrevented || event.key !== ' ' || hasModifier(event)) return;
      event.preventDefault();
      if (!event.repeat) event.currentTarget.click();
    }}/>;
}
