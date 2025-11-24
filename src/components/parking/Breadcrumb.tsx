'use client';

import Link from 'next/link';

type BreadcrumbProps = {
  companyName: string;
};

export default function Breadcrumb({ companyName }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6"
    >
      <ol
        className="flex items-center gap-2 text-sm sm:text-base"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link
            href="/home"
            className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded px-1"
            itemProp="item"
            aria-label="Ir para página inicial"
          >
            <span itemProp="name">Início</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        <li aria-hidden="true" className="text-muted-foreground">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </li>

        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
          className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none"
          aria-current="page"
        >
          <span itemProp="name">{companyName}</span>
          <meta itemProp="position" content="2" />
        </li>
      </ol>
    </nav>
  );
}
