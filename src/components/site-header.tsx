"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/catalog/types";
import { CartIcon, CloseIcon, MenuIcon, SparkIcon } from "@/components/icons";
import { SearchBox } from "@/components/search-box";

const primaryLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/support", label: "Support" },
  { href: "/about", label: "About us" },
];

export function SiteHeader({ products }: { products: readonly Product[] }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="announcement-bar"><span className="announcement-dot" /> Kundu Electronics <span className="announcement-divider">/</span> Khulna, Bangladesh</div>
      <header className="site-header">
        <div className="header-main container">
          <Link href="/" className="brand" aria-label="Kundu Electronics home" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark"><SparkIcon /></span>
            <span className="brand-copy"><strong>KUNDU</strong><small>ELECTRONICS</small></span>
          </Link>
          <div className="header-search"><SearchBox products={products} /></div>
          <div className="header-actions">
            <Link href="/cart" className="cart-link"><CartIcon /><span>Cart</span><span className="cart-count">0</span></Link>
            <button className="mobile-menu-toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
        <div className={`nav-row ${menuOpen ? "nav-row-open" : ""}`}>
          <nav className="container primary-nav" aria-label="Main navigation">
            {primaryLinks.map((link) => <Link href={link.href} key={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}
            <span className="nav-note">Components for curious minds.</span>
          </nav>
        </div>
        {menuOpen && <button className="mobile-nav-backdrop" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      </header>
    </>
  );
}
