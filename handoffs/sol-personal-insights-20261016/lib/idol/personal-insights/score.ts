import type {Work} from '../types';
import type {InsightOptions} from './contract';

/** Accept finite scores in [0,10]; retain zero and the supplied precision. */
export function validScore(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10
    ? value : null;
}
/** Stage presence does not establish score binding: the host must approve. */
export function isStageEligible(work: Readonly<Work>, options?: InsightOptions): boolean {
  if (!work?.stage) return false;
  try {return options?.isStageScoreEligible?.(work) === true;}
  catch {return false;}
}
