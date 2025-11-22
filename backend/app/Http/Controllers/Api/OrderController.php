<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\OrderHistory;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Requests\OrderRequest;
use App\Http\Resources\OrderResource;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 15);
        if ($perPage < 1) {
            $perPage = 1;
        }
        if ($perPage > 100) {
            $perPage = 100;
        }

        $search = trim((string) $request->input('search', ''));
        $customerId = $request->input('customer_id');
        $withRelations = $request->input('with', '');

        $query = Order::query();

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        if ($search !== '') {
            $query->whereHas('customer', function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Load relationships if requested
        if ($withRelations) {
            $relations = explode(',', $withRelations);
            $allowedRelations = ['customer', 'orderDetails', 'orderDetails.product', 'orderHistory'];
            $relations = array_intersect($relations, $allowedRelations);
            if (!empty($relations)) {
                $query->with($relations);
            }
        }

        $orders = $query
            ->orderByDesc('order_date')
            ->paginate($perPage)
            ->appends($request->only(['per_page', 'search', 'customer_id', 'with']));

        return OrderResource::collection($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(OrderRequest $request)
    {
        return DB::transaction(function () use ($request) {
            // Create the order
            $order = Order::create([
                'customer_id' => $request->customer_id,
                'order_date' => $request->order_date ?? now(),
                'total_price' => $request->total_price,
            ]);

            // Create order details
            foreach ($request->order_details as $detail) {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'unit_price' => $detail['unit_price'],
                ]);

                // Update product stock
                $product = Product::find($detail['product_id']);
                if ($product) {
                    $product->decrement('stock_quantity', $detail['quantity']);
                }
            }

            // Create order history entry
            OrderHistory::create([
                'customer_id' => $request->customer_id,
                'order_id' => $order->id,
            ]);

            // Load relationships for response
            $order->load(['customer', 'orderDetails', 'orderDetails.product', 'orderHistory']);

            return new OrderResource($order);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Order $order)
    {
        $withRelations = $request->input('with', '');
        
        if ($withRelations) {
            $relations = explode(',', $withRelations);
            $allowedRelations = ['customer', 'orderDetails', 'orderDetails.product', 'orderHistory'];
            $relations = array_intersect($relations, $allowedRelations);
            if (!empty($relations)) {
                $order->load($relations);
            }
        } else {
            // Load default relationships
            $order->load(['customer', 'orderDetails', 'orderDetails.product']);
        }

        return new OrderResource($order);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(OrderRequest $request, Order $order)
    {
        return DB::transaction(function () use ($request, $order) {
            // Restore stock for old order details
            foreach ($order->orderDetails as $oldDetail) {
                $product = Product::find($oldDetail->product_id);
                if ($product) {
                    $product->increment('stock_quantity', $oldDetail->quantity);
                }
            }

            // Delete old order details
            $order->orderDetails()->delete();

            // Update order
            $order->update([
                'customer_id' => $request->customer_id,
                'order_date' => $request->order_date,
                'total_price' => $request->total_price,
            ]);

            // Create new order details
            foreach ($request->order_details as $detail) {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'unit_price' => $detail['unit_price'],
                ]);

                // Update product stock
                $product = Product::find($detail['product_id']);
                if ($product) {
                    $product->decrement('stock_quantity', $detail['quantity']);
                }
            }

            // Load relationships for response
            $order->load(['customer', 'orderDetails', 'orderDetails.product', 'orderHistory']);

            return new OrderResource($order);
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        return DB::transaction(function () use ($order) {
            // Restore stock for order details
            foreach ($order->orderDetails as $detail) {
                $product = Product::find($detail->product_id);
                if ($product) {
                    $product->increment('stock_quantity', $detail->quantity);
                }
            }

            // Delete order (cascade will handle order details and order history)
            $order->delete();

            return response()->noContent();
        });
    }
}
