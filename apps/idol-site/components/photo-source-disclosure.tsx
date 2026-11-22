import type {ReactNode} from 'react';
import './photo-source-disclosure.css';

type PhotoSourceProps = {children: ReactNode; className?: string; label?: string};

export function PhotoSourceDisclosure({children, className = '', label = '照片出处'}: PhotoSourceProps) {
  return (
    <details className={`photo-source-disclosure ${className}`.trim()}>
      <summary>{label}</summary>
      <div className="photo-source-body">{children}</div>
    </details>
  );
}
