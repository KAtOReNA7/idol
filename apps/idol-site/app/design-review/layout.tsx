import type {Metadata} from 'next';
import {DesignReviewTimelineProvider} from '@/components/design-review/timeline-provider';
import {DesignReviewLabel} from '@/components/design-review/review-label';
import './review-label.css';
export const metadata: Metadata = {title: '设计审阅 · stage.', robots: {index: false, follow: false}};
/** Existing site-wide owner access and catalog authentication remain unchanged. */
export default function DesignReviewLayout({children}: {children: React.ReactNode}) {
  return <><DesignReviewTimelineProvider>{children}</DesignReviewTimelineProvider><DesignReviewLabel defaultSummary="设计审阅 · 独立预览"/></>;
}
