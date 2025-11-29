<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Order;
use App\Models\Post;
use App\Models\Company;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'customers_count' => Customer::count(),
            'products_count' => Product::count(),
            'orders_count' => Order::count(),
            'total_revenue' => Order::sum('total_price'),
            'blogs_count' => Post::count(),
            'companies_count' => Company::count(),
        ]);
    }
}
