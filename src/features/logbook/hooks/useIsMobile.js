import { useEffect, useState } from 'react';

const QUERY = '(max-width: 768px)';

const read = () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(read);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isMobile;
}
