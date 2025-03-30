import { render } from '@testing-library/react';
import Analytics from '@/components/Analytics';

// Mock next/script
jest.mock('next/script', () => {
  return {
    __esModule: true,
    default: ({ children, strategy = 'afterInteractive', dangerouslySetInnerHTML, src, id }) => (
      <script
        data-nscript={strategy}
        dangerouslySetInnerHTML={dangerouslySetInnerHTML}
        src={src}
        id={id}
      >
        {children}
      </script>
    ),
  };
});

describe('Analytics Component', () => {
  it('renders Script components', () => {
    const { container } = render(<Analytics />);
    const scripts = container.querySelectorAll('script[data-nscript="afterInteractive"]');
    expect(scripts.length).toBe(2);
  });

  it('includes correct Google Analytics configuration', () => {
    const { container } = render(<Analytics />);
    const scriptTags = container.querySelectorAll('script[data-nscript="afterInteractive"]');
    const scriptArray = Array.from(scriptTags);
    
    // Check for GTM script
    const gtmScript = scriptArray.find(script => 
      script.getAttribute('src')?.includes('googletagmanager.com/gtag/js')
    );
    expect(gtmScript?.getAttribute('src')).toContain('G-02YS3TDP5T');

    // Check for initialization script
    const initScript = scriptArray.find(script => script.id === 'gtag-init');
    expect(initScript).toBeTruthy();
    expect(initScript?.innerHTML).toContain('G-02YS3TDP5T');
  });
});
