
import { useMedia } from './use-media';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  return useMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
