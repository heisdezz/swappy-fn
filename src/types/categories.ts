export interface CategoryTrendingItem {
  id: string;
  name: string;
  slug: string;
  series: string;
  variant: string;
  release_year: number;
  icon?: string;
  item_count: number;
  total_views: number;
  average_views: number;
  min_price?: number;
  max_price?: number;
  average_price?: number;
  swap_count?: number;
  promoted_count?: number;
}

export interface CategoryHighlights {
  most_viewed?: CategoryTrendingItem;
  highest_average_views?: CategoryTrendingItem;
  least_average_views?: CategoryTrendingItem;
  highest_item_count?: CategoryTrendingItem;
  least_item_count?: CategoryTrendingItem;
}

export interface CategoryTrendingResponse {
  highlights: CategoryHighlights;
  trending: CategoryTrendingItem[];
  summary: {
    total_categories: number;
    active_categories_count: number;
    total_items: number;
    total_views: number;
    overall_average_views_per_item: number;
  };
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  series: string;
  variant: string;
  release_year: number;
  icon?: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}
