<?php

namespace App\Services;

use App\Models\Post;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PostService
{
    /**
     * Get all posts with pagination and caching
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllPosts(int $perPage = 15): LengthAwarePaginator
    {
        $cacheKey = "posts.all.page.{$perPage}." . request()->get('page', 1);
        
        return Cache::remember($cacheKey, 300, function () use ($perPage) {
            return Post::with('user:id,name,email')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        });
    }

    /**
     * Get published posts with pagination and caching
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getPublishedPosts(int $perPage = 15): LengthAwarePaginator
    {
        $cacheKey = "posts.published.page.{$perPage}." . request()->get('page', 1);
        
        return Cache::remember($cacheKey, 300, function () use ($perPage) {
            return Post::with('user:id,name,email')
                ->published()
                ->orderBy('published_at', 'desc')
                ->paginate($perPage);
        });
    }

        /**
     * Get archived posts with pagination and caching
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getArchivedPosts(int $perPage = 15): LengthAwarePaginator
    {
        $cacheKey = "posts.archived.page.{$perPage}." . request()->get('page', 1);
        
        return Cache::remember($cacheKey, 300, function () use ($perPage) {
            return Post::with('user:id,name,email')
                ->where('status','archived')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        });
    }

           /**
     * Get archived posts with pagination and caching
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getDraftPosts(int $perPage = 15): LengthAwarePaginator
    {
        $cacheKey = "posts.draft.page.{$perPage}." . request()->get('page', 1);
        
        return Cache::remember($cacheKey, 300, function () use ($perPage) {
            return Post::with('user:id,name,email')
                ->where('status','draft')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        });
    }

    


    /**
     * Search posts by keyword with pagination and optional status filter
     *
     * @param string|null $keyword
     * @param int $perPage
     * @param string|null $status
     * @return LengthAwarePaginator
     */
    public function searchPosts(?string $keyword, int $perPage = 15, ?string $status = null): LengthAwarePaginator
    {
        $statusKey = $status ? ".{$status}" : '';
        $cacheKey = "posts.search.{$keyword}{$statusKey}.page.{$perPage}." . request()->get('page', 1);
        
        return Cache::remember($cacheKey, 180, function () use ($keyword, $perPage, $status) {
            $query = Post::with('user:id,name,email')
                ->search($keyword)
                ->orderBy('created_at', 'desc');
            
            if ($status) {
                $query->where('status', $status);
            }
            
            return $query->paginate($perPage);
        });
    }

    /**
     * Get a single post by ID with caching
     *
     * @param int $id
     * @return Post|null
     */
    public function getPostById(int $id): ?Post
    {
        $cacheKey = "post.{$id}";
        
        return Cache::remember($cacheKey, 600, function () use ($id) {
            return Post::with('user:id,name,email')->find($id);
        });
    }

    /**
     * Create a new post
     *
     * @param array $data
     * @param int $userId
     * @return Post
     */
    public function createPost(array $data, int $userId): Post
    {
        DB::beginTransaction();
        
        try {
            $post = Post::create([
                'title' => $data['title'],
                'content' => $data['content'],
                'status' => $data['status'] ?? 'draft',
                'published_at' => $data['published_at'] ?? null,
                'user_id' => $userId,
            ]);

            // Clear related caches
            $this->clearPostCaches();
            
            DB::commit();
            
            return $post->load('user:id,name,email');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing post
     *
     * @param int $id
     * @param array $data
     * @return Post|null
     */
    public function updatePost(int $id, array $data): ?Post
    {
        $post = Post::find($id);
        
        if (!$post) {
            return null;
        }

        DB::beginTransaction();
        
        try {
            $post->update([
                'title' => $data['title'],
                'content' => $data['content'],
                'status' => $data['status'] ?? $post->status,
                'published_at' => $data['published_at'] ?? $post->published_at,
            ]);

            // Clear related caches
            $this->clearPostCaches();
            Cache::forget("post.{$id}");
            
            DB::commit();
            
            return $post->load('user:id,name,email');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete a post
     *
     * @param int $id
     * @return bool
     */
    public function deletePost(int $id): bool
    {
        $post = Post::find($id);
        
        if (!$post) {
            return false;
        }

        DB::beginTransaction();
        
        try {
            $post->delete();
            
            // Clear related caches
            $this->clearPostCaches();
            Cache::forget("post.{$id}");
            
            DB::commit();
            
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get posts by user ID
     *
     * @param int $userId
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getPostsByUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        $cacheKey = "posts.user.{$userId}.page.{$perPage}." . request()->get('page', 1);
        
        return Cache::remember($cacheKey, 300, function () use ($userId, $perPage) {
            return Post::with('user:id,name,email')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        });
    }

    /**
     * Get post statistics
     *
     * @return array
     */
    public function getPostStats(): array
    {
        $cacheKey = 'posts.stats';
        
        return Cache::remember($cacheKey, 600, function () {
            return [
                'total' => Post::count(),
                'published' => Post::where('status', 'published')->count(),
                'draft' => Post::where('status', 'draft')->count(),
                'archived' => Post::where('status', 'archived')->count(),
                'this_month' => Post::whereMonth('created_at', now()->month)->count(),
            ];
        });
    }

    /**
     * Clear all post-related caches
     */
    private function clearPostCaches(): void
    {
        $patterns = [
            'posts.all.*',
            'posts.published.*',
            'posts.search.*',
            'posts.user.*',
            'posts.stats'
        ];

        foreach ($patterns as $pattern) {
            $keys = Cache::get($pattern) ?: [];
            foreach ($keys as $key) {
                Cache::forget($key);
            }
        }
    }
} 