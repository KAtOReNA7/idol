import type {ReactNode} from 'react';
import './photo-source-disclosure.css';

export function PhotoSourceDisclosure({children, className = ''}: {children: ReactNode; className?: string}) {
  return (
    <details className={`photo-source-disclosure ${className}`.trim()}>
      <summary>照片出处</summary>
      <div className="photo-source-body">{children}</div>
    </details>
  );
}
