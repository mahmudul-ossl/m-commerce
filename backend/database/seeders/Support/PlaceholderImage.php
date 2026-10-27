<?php

namespace Database\Seeders\Support;

/**
 * Generates soft gradient placeholder images for demo data,
 * so seeding works offline without downloading photos.
 */
class PlaceholderImage
{
    /**
     * Create a JPEG in the temp folder and return its path.
     * Media Library moves the file when it is attached.
     *
     * @param  array{int, int, int}  $from  Top color (RGB)
     * @param  array{int, int, int}  $to  Bottom color (RGB)
     */
    public static function make(int $width, int $height, array $from, array $to, int $seed = 0): string
    {
        $image = imagecreatetruecolor($width, $height);
        imagealphablending($image, true);

        for ($y = 0; $y < $height; $y++) {
            $ratio = $y / max($height - 1, 1);
            $color = imagecolorallocate(
                $image,
                (int) ($from[0] + ($to[0] - $from[0]) * $ratio),
                (int) ($from[1] + ($to[1] - $from[1]) * $ratio),
                (int) ($from[2] + ($to[2] - $from[2]) * $ratio),
            );
            imageline($image, 0, $y, $width, $y, $color);
        }

        // A few translucent circles so each image looks a little different.
        mt_srand($seed);
        $highlight = imagecolorallocatealpha($image, 255, 255, 255, 95);
        $shadow = imagecolorallocatealpha($image, 0, 0, 0, 110);

        $size = (int) (min($width, $height) * 0.7);
        imagefilledellipse($image, mt_rand((int) ($width * 0.3), (int) ($width * 0.7)), (int) ($height * 0.45), $size, $size, $highlight);
        imagefilledellipse($image, mt_rand(0, $width), mt_rand(0, $height), (int) ($size * 0.5), (int) ($size * 0.5), $shadow);
        imagefilledellipse($image, mt_rand(0, $width), mt_rand(0, $height), (int) ($size * 0.3), (int) ($size * 0.3), $highlight);
        mt_srand();

        $path = tempnam(sys_get_temp_dir(), 'placeholder').'.jpg';
        imagejpeg($image, $path, 85);
        imagedestroy($image);

        return $path;
    }
}
