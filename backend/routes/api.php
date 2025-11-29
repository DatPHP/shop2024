<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderDetailController;
use App\Http\Controllers\Api\OrderHistoryController;
use App\Http\Controllers\Api\DashboardController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public post routes (read-only)
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{id}', [PostController::class, 'show']);
Route::get('/posts/stats', [PostController::class, 'stats']);

// Public product routes (read-only)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Public category routes (read-only)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/allcategory', [CategoryController::class, 'allCategory']);

// Public customer routes (read-only)
Route::get('/customers', [CustomerController::class, 'index']);
Route::get('/customers/{customer}', [CustomerController::class, 'show']);
Route::get('/customers/export/csv', [CustomerController::class, 'exportCSV']);
Route::get('/customers/export/pdf', [CustomerController::class, 'exportPDF']);

// Public order routes (read-only)
Route::get('/orders/revenue-analytics', [OrderController::class, 'getRevenueAnalytics']);
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/{order}', [OrderController::class, 'show']);
Route::get('/orders/export/csv', [OrderController::class, 'exportCSV']);
Route::get('/orders/export/pdf', [OrderController::class, 'exportPDF']);

// Public order detail routes (read-only)
Route::get('/order-details', [OrderDetailController::class, 'index']);
Route::get('/order-details/{orderDetail}', [OrderDetailController::class, 'show']);

// Public order history routes (read-only)
Route::get('/order-history', [OrderHistoryController::class, 'index']);
Route::get('/order-history/{orderHistory}', [OrderHistoryController::class, 'show']);

// Dashboard Metrics
Route::get('/dashboard/metrics', [DashboardController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // User's own posts
    Route::get('/my-posts', [PostController::class, 'myPosts']);
    
    // User's own products
    Route::get('/my-products', [ProductController::class, 'myProducts']);
    
    // User's own categories
    Route::get('/my-categories', [CategoryController::class, 'myCategories']);
    
    // Post management (CRUD)
    Route::post('/posts', [PostController::class, 'store']);
    Route::put('/posts/{id}', [PostController::class, 'update']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    
    // Post status management
    Route::patch('/posts/{id}/publish', [PostController::class, 'publish']);
    Route::patch('/posts/{id}/archive', [PostController::class, 'archive']);


    Route::apiResource('companies', CompanyController::class);
    
    // Customer management (CRUD)
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::put('/customers/{customer}', [CustomerController::class, 'update']);
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);
    
    // Order management (CRUD)
    Route::post('/orders', [OrderController::class, 'store']);
    Route::put('/orders/{order}', [OrderController::class, 'update']);
    Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
    
    // Order detail management (CRUD)
    Route::post('/order-details', [OrderDetailController::class, 'store']);
    Route::put('/order-details/{orderDetail}', [OrderDetailController::class, 'update']);
    Route::delete('/order-details/{orderDetail}', [OrderDetailController::class, 'destroy']);
    
    // Order history management (CRUD)
    Route::post('/order-history', [OrderHistoryController::class, 'store']);
    Route::put('/order-history/{orderHistory}', [OrderHistoryController::class, 'update']);
    Route::delete('/order-history/{orderHistory}', [OrderHistoryController::class, 'destroy']);
 
});

    // Product management (CRUD) - protected
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    
    // Category management (CRUD) - protected
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    
    // Additional category routes
    Route::any('category/create', [CategoryController::class, 'createCategory'])
        ->name('createCategor');

