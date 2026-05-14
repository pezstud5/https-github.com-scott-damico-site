const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Facilitation', href: '#facilitation' },
  { label: 'Approach', href: '#approach' },
  { label: 'Speaking', href: '#speaking' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Go to home">
        S. Damico
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
