<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

// Load the Model.
use App\Models\Post;

// Custom form request validation for handling add or update content.
use App\Http\Requests\PostRequest;

// Post service class.
use App\Services\PostService;

class PostController extends Controller
{
    /**
     * The post service for the detail CRUD process.
     */
    protected $postService;

    /**
     * The controller constructor.
     */
    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('per_page', 25);
            $status = $request->input('status');
            $keyword = $request->input('search');

            // Validate per_page parameter
            if ($perPage > 100) {
                $perPage = 100;
            }

            $posts = match (true) {
                !empty($keyword) => $this->postService->searchPosts($keyword, $perPage),
                $status === 'published' => $this->postService->getPublishedPosts($perPage),
                default => $this->postService->getAllPosts($perPage),
            };

            return response()->json([
                'success' => true,
                'message' => 'Posts retrieved successfully',
                'data' => $posts->items(),
                'pagination' => [
                    'current_page' => $posts->currentPage(),
                    'last_page' => $posts->lastPage(),
                    'per_page' => $posts->perPage(),
                    'total' => $posts->total(),
                    'from' => $posts->firstItem(),
                    'to' => $posts->lastItem(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve posts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param PostRequest $request
     * @return JsonResponse
     */
    public function store(PostRequest $request): JsonResponse
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $post = $this->postService->createPost($request->validated(), $userId);

            return response()->json([
                'success' => true,
                'message' => 'Post created successfully',
                'data' => $post
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $post = $this->postService->getPostById($id);

            if (!$post) {
                return response()->json([
                    'success' => false,
                    'message' => 'Post not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Post retrieved successfully',
                'data' => $post
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param PostRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(PostRequest $request, int $id): JsonResponse
    {
        try {
            $post = Post::find($id);

            if (!$post) {
                return response()->json([
                    'success' => false,
                    'message' => 'Post not found'
                ], 404);
            }

            // Check if user owns the post or is admin
            $userId = Auth::id();

            if ($post->user_id !== $userId && !Auth::user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update this post'
                ], 403);
            }

            $updatedPost = $this->postService->updatePost($id, $request->validated());

            if (!$updatedPost) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update post'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Post updated successfully',
                'data' => $updatedPost
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $post = Post::find($id);

            if (!$post) {
                return response()->json([
                    'success' => false,
                    'message' => 'Post not found'
                ], 404);
            }

            // Check if user owns the post or is admin
            $userId = Auth::id();
            if ($post->user_id !== $userId && !Auth::user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete this post'
                ], 403);
            }

            $deleted = $this->postService->deletePost($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete post'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Post deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get posts by current user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function myPosts(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $perPage = $request->input('per_page', 15);
            $posts = $this->postService->getPostsByUser($userId, $perPage);

            return response()->json([
                'success' => true,
                'message' => 'User posts retrieved successfully',
                'data' => $posts->items(),
                'pagination' => [
                    'current_page' => $posts->currentPage(),
                    'last_page' => $posts->lastPage(),
                    'per_page' => $posts->perPage(),
                    'total' => $posts->total(),
                    'from' => $posts->firstItem(),
                    'to' => $posts->lastItem(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user posts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get post statistics
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = $this->postService->getPostStats();

            return response()->json([
                'success' => true,
                'message' => 'Post statistics retrieved successfully',
                'data' => $stats
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve post statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Publish a draft post
     *
     * @param int $id
     * @return JsonResponse
     */
    public function publish(int $id): JsonResponse
    {
        try {
            $post = Post::find($id);

            if (!$post) {
                return response()->json([
                    'success' => false,
                    'message' => 'Post not found'
                ], 404);
            }

            // Check if user owns the post or is admin
            $userId = Auth::id();
            if ($post->user_id !== $userId && !Auth::user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to publish this post'
                ], 403);
            }

            $updatedPost = $this->postService->updatePost($id, [
                'status' => 'published',
                'published_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Post published successfully',
                'data' => $updatedPost
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to publish post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Archive a post
     *
     * @param int $id
     * @return JsonResponse
     */
    public function archive(int $id): JsonResponse
    {
        try {
            $post = Post::find($id);

            if (!$post) {
                return response()->json([
                    'success' => false,
                    'message' => 'Post not found'
                ], 404);
            }

            // Check if user owns the post or is admin
            $userId = Auth::id();
            if ($post->user_id !== $userId && !Auth::user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to archive this post'
                ], 403);
            }

            $updatedPost = $this->postService->updatePost($id, [
                'status' => 'archived'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Post archived successfully',
                'data' => $updatedPost
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to archive post',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}