/**
 * Navigation component providing consistent top-level navigation across pages.
 * Uses Tailwind CSS for styling with responsive design patterns.
 * 
 * Includes:
 * - Branding/title section
 * - Main navigation links (Gallery, Admin)
 * - Responsive behavior (mobile menu hidden, desktop menu visible)
 */
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      <Link href="/mosaic">Mosaic</Link>
      <Link href="/admin">Admin</Link>
    </nav>
  );
}
