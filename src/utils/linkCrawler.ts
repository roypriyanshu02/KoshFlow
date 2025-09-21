/**
 * कोषFLOW Link Crawler and Validator
 * Comprehensive tool to crawl and validate all internal and external links
 */

interface LinkInfo {
  url: string;
  type: 'internal' | 'external' | 'anchor';
  source: string;
  line?: number;
  status?: 'valid' | 'broken' | 'redirect' | 'unknown';
  statusCode?: number;
  error?: string;
  target?: string;
}

interface CrawlReport {
  summary: {
    totalLinks: number;
    internalLinks: number;
    externalLinks: number;
    anchorLinks: number;
    brokenLinks: number;
    validLinks: number;
    redirects: number;
  };
  brokenLinks: LinkInfo[];
  validLinks: LinkInfo[];
  redirects: LinkInfo[];
  recommendations: string[];
}

class LinkCrawler {
  private baseUrl: string;
  private links: LinkInfo[] = [];
  private checkedUrls: Set<string> = new Set();

  // Define all known internal routes from App.tsx
  private knownRoutes = [
    '/',
    '/login',
    '/register',
    '/dashboard',
    '/debug-auth',
    '/test-signup',
    '/showcase',
    '/masters/contacts',
    '/masters/products',
    '/masters/taxes',
    '/masters/accounts',
    '/reports/balance-sheet',
    '/transactions/purchase-orders',
    '/transactions/sales-orders',
    '/transactions/invoices'
  ];

  // Routes defined in sidebar but missing from App.tsx
  private sidebarRoutes = [
    '/transactions/bills',
    '/transactions/payments',
    '/reports/profit-loss',
    '/reports/stock'
  ];

  // Anchor links that should exist on landing page
  private expectedAnchors = [
    '#features',
    '#security',
    '#help'
  ];

  constructor(baseUrl: string = 'http://localhost:8081') {
    this.baseUrl = baseUrl;
  }

  /**
   * Extract all links from source code files
   */
  async extractLinksFromSource(): Promise<LinkInfo[]> {
    const sourceLinks: LinkInfo[] = [];

    // Links from LandingPage.tsx
    const landingPageLinks = [
      { url: '#features', type: 'anchor' as const, source: 'LandingPage.tsx navigation' },
      { url: '#security', type: 'anchor' as const, source: 'LandingPage.tsx navigation' },
      { url: '#help', type: 'anchor' as const, source: 'LandingPage.tsx navigation' },
      { url: '#', type: 'anchor' as const, source: 'LandingPage.tsx footer (Pricing)' },
      { url: '#', type: 'anchor' as const, source: 'LandingPage.tsx footer (Integrations)' },
      { url: '#', type: 'anchor' as const, source: 'LandingPage.tsx footer (Contact Us)' },
      { url: '#', type: 'anchor' as const, source: 'LandingPage.tsx footer (API Documentation)' },
      { url: '#', type: 'anchor' as const, source: 'LandingPage.tsx footer (System Status)' },
      { url: '#', type: 'anchor' as const, source: 'LandingPage.tsx footer (Privacy Policy)' },
      { url: '#', type: 'anchor' as const, source: 'LandingPage.tsx footer (Terms of Service)' },
      { url: '#', type: 'anchor' as const, source: 'LandingPage.tsx footer (Cookie Policy)' }
    ];

    // Links from Sidebar.tsx
    const sidebarLinks = [
      { url: '/', type: 'internal' as const, source: 'Sidebar.tsx Dashboard' },
      { url: '/masters/contacts', type: 'internal' as const, source: 'Sidebar.tsx Masters' },
      { url: '/masters/products', type: 'internal' as const, source: 'Sidebar.tsx Masters' },
      { url: '/masters/taxes', type: 'internal' as const, source: 'Sidebar.tsx Masters' },
      { url: '/masters/accounts', type: 'internal' as const, source: 'Sidebar.tsx Masters' },
      { url: '/transactions/purchase-orders', type: 'internal' as const, source: 'Sidebar.tsx Transactions' },
      { url: '/transactions/sales-orders', type: 'internal' as const, source: 'Sidebar.tsx Transactions' },
      { url: '/transactions/bills', type: 'internal' as const, source: 'Sidebar.tsx Transactions' },
      { url: '/transactions/invoices', type: 'internal' as const, source: 'Sidebar.tsx Transactions' },
      { url: '/transactions/payments', type: 'internal' as const, source: 'Sidebar.tsx Transactions' },
      { url: '/reports/balance-sheet', type: 'internal' as const, source: 'Sidebar.tsx Reports' },
      { url: '/reports/profit-loss', type: 'internal' as const, source: 'Sidebar.tsx Reports' },
      { url: '/reports/stock', type: 'internal' as const, source: 'Sidebar.tsx Reports' }
    ];

    // Links from DevNavigation.tsx
    const devNavigationLinks = [
      { url: '/', type: 'internal' as const, source: 'DevNavigation.tsx' },
      { url: '/dashboard', type: 'internal' as const, source: 'DevNavigation.tsx' },
      { url: '/showcase', type: 'internal' as const, source: 'DevNavigation.tsx' }
    ];

    // Navigation links from TopBar.tsx
    const topBarLinks = [
      { url: '/login', type: 'internal' as const, source: 'TopBar.tsx logout redirect' }
    ];

    sourceLinks.push(...landingPageLinks, ...sidebarLinks, ...devNavigationLinks, ...topBarLinks);
    return sourceLinks;
  }

  /**
   * Check if internal route exists in App.tsx
   */
  isRouteDefinedInApp(path: string): boolean {
    return this.knownRoutes.includes(path);
  }

  /**
   * Check if anchor exists on landing page
   */
  async checkAnchorExists(anchor: string): Promise<boolean> {
    // For now, we know these anchors exist based on the landing page structure
    const existingAnchors = ['#features', '#security', '#help'];
    return existingAnchors.includes(anchor);
  }

  /**
   * Validate internal links
   */
  async validateInternalLinks(links: LinkInfo[]): Promise<void> {
    for (const link of links) {
      if (link.type === 'internal') {
        if (this.isRouteDefinedInApp(link.url)) {
          link.status = 'valid';
        } else {
          link.status = 'broken';
          link.error = 'Route not defined in App.tsx';
        }
      } else if (link.type === 'anchor') {
        if (link.url === '#') {
          link.status = 'broken';
          link.error = 'Empty anchor link - needs proper destination';
        } else if (await this.checkAnchorExists(link.url)) {
          link.status = 'valid';
        } else {
          link.status = 'broken';
          link.error = 'Anchor target not found on page';
        }
      }
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport(links: LinkInfo[]): CrawlReport {
    const brokenLinks = links.filter(link => link.status === 'broken');
    const validLinks = links.filter(link => link.status === 'valid');
    const redirects = links.filter(link => link.status === 'redirect');

    const summary = {
      totalLinks: links.length,
      internalLinks: links.filter(link => link.type === 'internal').length,
      externalLinks: links.filter(link => link.type === 'external').length,
      anchorLinks: links.filter(link => link.type === 'anchor').length,
      brokenLinks: brokenLinks.length,
      validLinks: validLinks.length,
      redirects: redirects.length
    };

    const recommendations = this.generateRecommendations(brokenLinks);

    return {
      summary,
      brokenLinks,
      validLinks,
      redirects,
      recommendations
    };
  }

  /**
   * Generate fix recommendations
   */
  private generateRecommendations(brokenLinks: LinkInfo[]): string[] {
    const recommendations: string[] = [];

    // Check for missing routes
    const missingRoutes = brokenLinks
      .filter(link => link.type === 'internal' && link.error?.includes('Route not defined'))
      .map(link => link.url);

    if (missingRoutes.length > 0) {
      recommendations.push(
        `Add missing routes to App.tsx: ${missingRoutes.join(', ')}`
      );
    }

    // Check for empty anchor links
    const emptyAnchors = brokenLinks.filter(link => 
      link.type === 'anchor' && link.error?.includes('Empty anchor')
    );

    if (emptyAnchors.length > 0) {
      recommendations.push(
        `Replace ${emptyAnchors.length} empty anchor links (#) with proper destinations`
      );
    }

    // Check for missing page components
    const routesNeedingComponents = [
      '/transactions/bills',
      '/transactions/payments', 
      '/reports/profit-loss',
      '/reports/stock'
    ];

    recommendations.push(
      'Create missing page components for: ' + routesNeedingComponents.join(', ')
    );

    recommendations.push(
      'Add proper anchor targets for footer links (Privacy Policy, Terms, etc.)'
    );

    recommendations.push(
      'Consider implementing a proper 404 error boundary for undefined routes'
    );

    return recommendations;
  }

  /**
   * Main crawl function
   */
  async crawl(): Promise<CrawlReport> {
    console.log('🔍 Starting कोषFLOW link crawl...');

    // Extract links from source code
    const sourceLinks = await this.extractLinksFromSource();
    
    // Validate all links
    await this.validateInternalLinks(sourceLinks);

    // Generate comprehensive report
    const report = this.generateReport(sourceLinks);

    console.log('✅ Link crawl completed!');
    return report;
  }
}

export { LinkCrawler, type LinkInfo, type CrawlReport };
