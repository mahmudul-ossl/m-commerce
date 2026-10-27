<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/** @mixin Media */
class MediaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $urls = ['original' => $this->getUrl()];

        foreach (array_keys($this->generated_conversions ?? []) as $conversion) {
            if ($this->hasGeneratedConversion($conversion)) {
                $urls[$conversion] = $this->getUrl($conversion);
            }
        }

        return [
            'id' => $this->id,
            'alt' => $this->getCustomProperty('alt', $this->name),
            'urls' => $urls,
        ];
    }
}
