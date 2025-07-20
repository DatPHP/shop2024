<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'status' => $this->status,
            'published_at' => $this->published_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            'excerpt' => $this->when($request->routeIs('posts.index'), function () {
                return \Str::limit(strip_tags($this->content), 150);
            }),
            'read_time' => $this->when($request->routeIs('posts.index'), function () {
                $wordsPerMinute = 200;
                $wordCount = str_word_count(strip_tags($this->content));
                return ceil($wordCount / $wordsPerMinute);
            }),
        ];
    }
} 