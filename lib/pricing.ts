// lib/pricing.ts

export const pricingRules = {
  websiteTypes: {
    landing: { min: 5000, max: 8000, label: "Landing Page" },
    portfolio: { min: 5000, max: 15000, label: "Portfolio Website" },
    business: { min: 15000, max: 35000, label: "Business Website" },
    ecommerce: { min: 30000, max: 80000, label: "E-Commerce Store" },
    webApp: { min: 50000, max: 200000, label: "Web Application" }
  },

  branding: {
    logo: { min: 800, max: 8000, label: "Logo Design" },
    branding: { min: 5000, max: 20000, label: "Complete Branding Package" }
  },

  mobileApp: {
    basic: { min: 50000, max: 100000, label: "Basic Mobile App" },
    advanced: { min: 100000, max: 200000, label: "Advanced Mobile App" }
  },

  features: {
    authentication: { min: 3000, max: 8000, label: "User Authentication" },
    adminPanel: { min: 5000, max: 15000, label: "Admin Panel" },
    dashboard: { min: 8000, max: 20000, label: "Dashboard" },
    paymentGateway: { min: 5000, max: 10000, label: "Payment Gateway" },
    bookingSystem: { min: 5000, max: 15000, label: "Booking System" },
    chatbot: { min: 8000, max: 25000, label: "Basic Chatbot" },
    aiChatbot: { min: 15000, max: 50000, label: "AI-Powered Chatbot" },
    cms: { min: 8000, max: 20000, label: "Content Management System" },
    blog: { min: 3000, max: 8000, label: "Blog" },
    gallery: { min: 2000, max: 5000, label: "Image Gallery" },
    contactForm: { min: 1000, max: 3000, label: "Contact Form" },
    apiIntegration: { min: 5000, max: 20000, label: "API Integration" },
    threejs: { min: 10000, max: 50000, label: "3D/Three.js Integration" },
    gsapAnimation: { min: 5000, max: 15000, label: "GSAP Animations" },
    multilingual: { min: 5000, max: 12000, label: "Multi-language Support" },
    seo: { min: 3000, max: 10000, label: "SEO Optimization" },
    responsiveDesign: { min: 2000, max: 5000, label: "Responsive Design" },
    hostingSetup: { min: 1000, max: 3000, label: "Hosting Setup" }
  },

  pricingPolicy: {
    minimumProject: 3000,
    supportIncluded: true,
    consultationIncluded: true,
    advancePayment: 50,
    negotiationThreshold: 3000
  },

  // Service type mapping for quick lookup
  serviceTypes: {
    logo: 'branding.logo',
    branding: 'branding.branding',
    landing: 'websiteTypes.landing',
    portfolio: 'websiteTypes.portfolio',
    website: 'websiteTypes.business',
    ecommerce: 'websiteTypes.ecommerce',
    webapp: 'websiteTypes.webApp',
    'mobile app': 'mobileApp.basic',
    'advanced app': 'mobileApp.advanced'
  }
} as const;

export type WebsiteType = keyof typeof pricingRules.websiteTypes;
export type BrandingType = keyof typeof pricingRules.branding;
export type MobileAppType = keyof typeof pricingRules.mobileApp;
export type FeatureType = keyof typeof pricingRules.features;

export interface PriceRange {
  min: number;
  max: number;
  label: string;
}

export interface PricingResult {
  min: number;
  max: number;
  label: string;
  details: string[];
}

/**
 * Get price range for a specific item
 */
export function getPriceRange(
  category: keyof typeof pricingRules,
  item: string
): PriceRange | null {
  try {
    const categoryData = pricingRules[category];
    if (!categoryData) return null;
    
    const itemData = categoryData[item as keyof typeof categoryData];
    if (!itemData || !('min' in itemData)) return null;
    
    return itemData as PriceRange;
  } catch (error) {
    console.error('[Pricing] Error getting price range:', error);
    return null;
  }
}

/**
 * Get label for a specific item
 */
export function getItemLabel(
  category: keyof typeof pricingRules,
  item: string
): string {
  try {
    const categoryData = pricingRules[category];
    if (!categoryData) return item;
    
    const itemData = categoryData[item as keyof typeof categoryData];
    if (!itemData || !('label' in itemData)) return item;
    
    return (itemData as PriceRange).label;
  } catch (error) {
    console.error('[Pricing] Error getting label:', error);
    return item;
  }
}

/**
 * Calculate combined price range for multiple items
 */
export function calculateCombinedPrice(
  items: { category: keyof typeof pricingRules; item: string }[]
): PricingResult | null {
  if (!items || items.length === 0) return null;

  const ranges: PriceRange[] = [];
  const labels: string[] = [];

  for (const { category, item } of items) {
    const range = getPriceRange(category, item);
    if (range) {
      ranges.push(range);
      labels.push(range.label);
    }
  }

  if (ranges.length === 0) return null;

  // Calculate combined min and max (additive)
  const totalMin = ranges.reduce((sum, range) => sum + range.min, 0);
  const totalMax = ranges.reduce((sum, range) => sum + range.max, 0);

  // Apply a discount factor for multiple items (optional)
  const discountFactor = items.length > 2 ? 0.85 : 0.9;
  const discountedMin = Math.round(totalMin * discountFactor);
  const discountedMax = Math.round(totalMax * discountFactor);

  return {
    min: Math.max(discountedMin, pricingRules.pricingPolicy.minimumProject),
    max: discountedMax,
    label: labels.join(' + '),
    details: labels
  };
}

/**
 * Format price range for display
 */
export function formatPriceRange(min: number, max: number): string {
  const formattedMin = min >= 1000 ? `₹${(min / 1000).toFixed(0)}K` : `₹${min}`;
  const formattedMax = max >= 1000 ? `₹${(max / 1000).toFixed(0)}K` : `₹${max}`;
  return `${formattedMin}–${formattedMax}`;
}

/**
 * Get price range description with context
 */
export function getPriceDescription(
  min: number,
  max: number,
  context?: string
): string {
  const range = formatPriceRange(min, max);
  const base = `roughly ${range}`;
  
  if (context) {
    return `${context} costs ${base} approximately`;
  }
  
  return `typically ${range}`;
}

/**
 * Check if a budget is below minimum
 */
export function isBelowMinimum(budget: number): boolean {
  return budget < pricingRules.pricingPolicy.minimumProject;
}

/**
 * Get minimum project price
 */
export function getMinimumPrice(): number {
  return pricingRules.pricingPolicy.minimumProject;
}

/**
 * Identify service type from user input
 */
export function identifyServiceType(input: string): string | null {
  const normalized = input.toLowerCase().trim();
  
  for (const [key, path] of Object.entries(pricingRules.serviceTypes)) {
    if (normalized.includes(key)) {
      return path;
    }
  }
  
  return null;
}

/**
 * Parse price from user message
 */
export function parsePriceFromMessage(message: string): number | null {
  const numbers = message.match(/\d{1,3}(?:,\d{3})*|\d+/g);
  if (!numbers) return null;

  for (const num of numbers) {
    const clean = parseFloat(num.replace(/,/g, ''));
    if (!isNaN(clean) && clean > 0) {
      return clean;
    }
  }
  
  return null;
}

/**
 * Generate negotiation response based on budget
 */
export function getNegotiationStrategy(
  budget: number,
  requiredMin: number
): string {
  if (budget < requiredMin) {
    return 'below_minimum';
  } else if (budget < requiredMin * 0.7) {
    return 'significantly_below';
  } else if (budget < requiredMin) {
    return 'slightly_below';
  } else if (budget >= requiredMin && budget <= requiredMin * 1.2) {
    return 'acceptable';
  } else {
    return 'above_minimum';
  }
}

export default pricingRules;