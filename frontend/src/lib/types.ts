// Shapes returned by the Laravel API (see backend/app/Http/Resources).

export type Media = {
  id: number;
  alt: string;
  urls: {
    original: string;
    thumb?: string;
    medium?: string;
    large?: string;
    mobile?: string;
  };
};

export type Brand = {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image?: string | null;
  parent?: Category;
  children?: Category[];
  products_count?: number;
};

export type ProductCard = {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  current_price: number;
  is_on_sale: boolean;
  discount_percent: number | null;
  is_featured: boolean;
  in_stock?: boolean;
  brand?: Brand;
  image: Media | null;
  hover_image: Media | null;
};

export type ProductVariant = {
  id: number;
  sku: string;
  options: Record<string, string>;
  price: number;
  current_price: number;
  stock: number;
  in_stock: boolean;
};

export type Product = ProductCard & {
  short_description: string | null;
  description: string | null;
  in_stock: boolean;
  images: Media[];
  categories?: Category[];
  options: Record<string, string[]>;
  variants: ProductVariant[];
};

export type Banner = {
  id: number;
  title: string;
  subtitle: string | null;
  button_text: string | null;
  link: string | null;
  image: Media | null;
};

export type Paginated<T> = {
  data: T[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
};
