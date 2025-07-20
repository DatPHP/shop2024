<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\User;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create a test user
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        $posts = [
            [
                'title' => 'Getting Started with Laravel',
                'content' => 'Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as authentication, routing, sessions, and caching.',
                'status' => 'published',
                'published_at' => now()->subDays(5),
                'user_id' => $user->id,
            ],
            [
                'title' => 'Building REST APIs with Laravel',
                'content' => 'Laravel makes it easy to build RESTful APIs. With built-in support for API resources, form requests, and authentication, you can quickly create robust APIs that follow REST conventions. This article will guide you through the process of building a complete REST API.',
                'status' => 'published',
                'published_at' => now()->subDays(3),
                'user_id' => $user->id,
            ],
            [
                'title' => 'Performance Optimization in Laravel',
                'content' => 'Performance is crucial for any web application. Laravel provides several tools and techniques to optimize your application performance, including caching, database query optimization, and asset compilation. Learn how to make your Laravel application faster.',
                'status' => 'draft',
                'user_id' => $user->id,
            ],
            [
                'title' => 'Testing Laravel Applications',
                'content' => 'Testing is an essential part of modern web development. Laravel provides excellent testing support with PHPUnit integration, database testing, and HTTP testing. This guide will show you how to write comprehensive tests for your Laravel application.',
                'status' => 'published',
                'published_at' => now()->subDays(1),
                'user_id' => $user->id,
            ],
            [
                'title' => 'Deploying Laravel Applications',
                'content' => 'Deploying a Laravel application can be straightforward with the right tools and configuration. This article covers various deployment strategies, from simple shared hosting to complex cloud deployments with Docker and CI/CD pipelines.',
                'status' => 'archived',
                'published_at' => now()->subWeeks(2),
                'user_id' => $user->id,
            ],
        ];

        foreach ($posts as $postData) {
            Post::create($postData);
        }
    }
} 