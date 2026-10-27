<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Database\Seeders\Support\PlaceholderImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Demo catalog: categories, brands, products with size/color variants,
 * placeholder images and home page banners.
 */
class CatalogSeeder extends Seeder
{
    /**
     * Gradient color pairs used for placeholder images.
     *
     * @var list<array{array{int, int, int}, array{int, int, int}}>
     */
    private const PALETTES = [
        [[232, 226, 216], [196, 184, 166]],
        [[220, 228, 235], [160, 178, 196]],
        [[236, 222, 222], [196, 160, 160]],
        [[222, 232, 222], [164, 188, 168]],
        [[230, 226, 238], [178, 168, 204]],
        [[240, 232, 214], [210, 180, 130]],
        [[40, 40, 44], [90, 90, 98]],
    ];

    private const SIZES = ['S', 'M', 'L', 'XL'];

    private const SHOE_SIZES = ['40', '41', '42', '43', '44'];

    /**
     * Category tree: parent => [child => [product names]].
     *
     * @var array<string, array<string, list<string>>>
     */
    private const CATALOG = [
        'Men' => [
            'T-Shirts' => ['Essential Crew Tee', 'Heavyweight Pocket Tee', 'Linen Blend Tee', 'Striped Boxy Tee', 'Organic Cotton V-Neck'],
            'Shirts' => ['Oxford Button-Down', 'Relaxed Linen Shirt', 'Corduroy Overshirt', 'Cuban Collar Shirt'],
            'Jeans' => ['Slim Tapered Jeans', 'Straight Fit Selvedge', 'Relaxed Carpenter Jeans'],
        ],
        'Women' => [
            'Dresses' => ['Satin Slip Dress', 'Linen Midi Dress', 'Pleated Wrap Dress', 'Knit Bodycon Dress'],
            'Tops' => ['Ribbed Tank Top', 'Puff Sleeve Blouse', 'Cropped Cardigan', 'Oversized Poplin Shirt'],
            'Kurtis' => ['Block Print Kurti', 'Embroidered Cotton Kurti', 'Chikankari Long Kurti'],
        ],
        'Footwear' => [
            'Sneakers' => ['Court Classic Sneaker', 'Retro Runner', 'Canvas Low-Top'],
            'Sandals' => ['Leather Slide Sandal', 'Strappy Flat Sandal'],
        ],
        'Accessories' => [
            'Bags' => ['Canvas Tote Bag', 'Mini Crossbody Bag', 'Leather Backpack'],
            'Watches' => ['Minimal Mesh Watch', 'Chronograph Steel Watch'],
        ],
    ];

    private const COLORS = ['Black', 'White', 'Navy', 'Beige', 'Olive', 'Maroon'];

    private const BRANDS = ['Northwind', 'Loom & Co', 'Urban Thread', 'Aarong Edit', 'Stride', 'Kite Studio'];

    public function run(): void
    {
        mt_srand(2026);

        $brands = collect(self::BRANDS)->map(fn (string $name) => Brand::create(['name' => $name]));

        $parentOrder = 0;

        foreach (self::CATALOG as $parentName => $children) {
            $parent = Category::create([
                'name' => $parentName,
                'description' => "Shop the latest in {$parentName}.",
                'is_featured' => true,
                'sort_order' => $parentOrder++,
            ]);
            $this->attachImage($parent, 'image', 600, 600, $parent->id);

            $childOrder = 0;

            foreach ($children as $childName => $productNames) {
                $child = Category::create([
                    'parent_id' => $parent->id,
                    'name' => $childName,
                    'slug' => Str::slug("{$parentName} {$childName}"),
                    'sort_order' => $childOrder++,
                ]);
                $this->attachImage($child, 'image', 600, 600, $child->id);

                foreach ($productNames as $productName) {
                    $this->createProduct($productName, $parent, $child, $brands->random());
                }
            }
        }

        $this->createBanners();

        mt_srand();
    }

    private function createProduct(string $name, Category $parent, Category $child, Brand $brand): void
    {
        $price = mt_rand(6, 60) * 100 - 10;
        $onSale = mt_rand(1, 100) <= 30;

        $product = Product::create([
            'brand_id' => $brand->id,
            'name' => $name,
            'short_description' => "A modern wardrobe essential from {$brand->name}.",
            'description' => "<p>The {$name} is designed for everyday comfort with a clean, modern fit.</p>"
                .'<ul><li>Premium materials</li><li>Easy care</li><li>Cash on delivery available</li></ul>',
            'price' => $price,
            'sale_price' => $onSale ? round($price * (mt_rand(70, 90) / 100), -1) : null,
            'is_featured' => mt_rand(1, 100) <= 25,
        ]);

        $product->categories()->attach([$parent->id, $child->id]);

        $this->createVariants($product, $parent->name);

        // Two images per product: the card shows the second one on hover.
        $this->attachImage($product, 'images', 800, 1000, $product->id * 2);
        $this->attachImage($product, 'images', 800, 1000, $product->id * 2 + 1);
    }

    private function createVariants(Product $product, string $department): void
    {
        $colors = collect(self::COLORS)->shuffle()->take(mt_rand(1, 3));

        $sizes = match ($department) {
            'Footwear' => self::SHOE_SIZES,
            'Accessories' => [null],
            default => self::SIZES,
        };

        $sortOrder = 0;

        foreach ($colors as $color) {
            foreach ($sizes as $size) {
                $options = array_filter(['size' => $size, 'color' => $color]);

                $product->variants()->create([
                    'sku' => Str::upper(Str::slug($product->slug.' '.implode(' ', $options))),
                    'options' => $options,
                    'stock' => mt_rand(1, 100) <= 15 ? 0 : mt_rand(3, 40),
                    'sort_order' => $sortOrder++,
                ]);
            }
        }
    }

    private function createBanners(): void
    {
        $banners = [
            ['title' => 'New Season Arrivals', 'subtitle' => 'Fresh styles for every day. Cash on delivery nationwide.', 'link' => '/shop?sort=-newest'],
            ['title' => 'Up to 30% Off', 'subtitle' => 'Selected favourites, for a limited time.', 'link' => '/shop?filter[on_sale]=1'],
        ];

        foreach ($banners as $index => $data) {
            $banner = Banner::create([...$data, 'button_text' => 'Shop now', 'sort_order' => $index]);
            $this->attachImage($banner, 'image', 1920, 800, 900 + $index);
        }
    }

    /**
     * @param  Category|Product|Banner  $model
     */
    private function attachImage($model, string $collection, int $width, int $height, int $seed): void
    {
        [$from, $to] = self::PALETTES[$seed % count(self::PALETTES)];

        $model->addMedia(PlaceholderImage::make($width, $height, $from, $to, $seed))
            ->usingFileName(Str::slug($model->name ?? $model->title).'-'.$seed.'.jpg')
            ->withCustomProperties(['alt' => $model->name ?? $model->title])
            ->toMediaCollection($collection);
    }
}
