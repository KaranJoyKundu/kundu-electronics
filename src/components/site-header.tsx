"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AccountIcon, CartIcon, CloseIcon, MenuIcon } from "@/components/icons";
import { SearchBox } from "@/components/search-box";
import { useCart } from "@/components/cart/cart-provider";

const primaryLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/projects", label: "Projects" },
  { href: "/gallery", label: "Photo gallery" },
  { href: "/support", label: "Support" },
  { href: "/about", label: "About the Founder" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <>
      <div className="announcement-bar"><span className="announcement-dot" /> Kundu Electronics <span className="announcement-divider">/</span> Khulna, Bangladesh</div>
      <header className="site-header">
        <div className="header-main container">
          <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark"><Image src="/images/brand/logo.png" alt="Kundu Electronics logo" width={52} height={52} priority /></span>
            <span className="brand-copy"><strong>KUNDU</strong><small>ELECTRONICS</small></span>
          </Link>
          <div className="header-search"><SearchBox /></div>
          <div className="header-actions">
            <Link href="/account" className="account-link" onClick={() => setMenuOpen(false)}><AccountIcon /><span>Account</span></Link>
            <Link href="/cart" className="cart-link"><CartIcon /><span>Cart</span><span className="cart-count">{itemCount}</span></Link>
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
