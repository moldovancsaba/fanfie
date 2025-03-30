import { render } from '@testing-library/react';
import Analytics from '@/components/Analytics';

describe('Analytics Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Analytics />);
    const scripts = container.getElementsByTagName('script');
    expect(scripts.length).toBe(2);
  });

  it('includes correct Google Analytics ID', () => {
    const { container } = render(<Analytics />);
    const scripts = container.getElementsByTagName('script');
    const srcScript = Array.from(scripts).find(script => 
      script.getAttribute('src')?.includes('gtag/js')
    );
    expect(srcScript?.getAttribute('src')).toContain('G-02YS3TDP5T');
  });
});

