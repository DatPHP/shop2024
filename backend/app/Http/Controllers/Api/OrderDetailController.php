<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Requests\OrderDetailRequest;
use App\Http\Resources\OrderDetailResource;
use Illuminate\Support\Facades\DB;

class OrderDetailController extends Controller
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

        $orderId = $request->input('order_id');
        $productId = $request->input('product_id');
        $withRelations = $request->input('with', '');

        $query = OrderDetail::query();

        if ($orderId) {
            $query->where('order_id', $orderId);
        }

        if ($productId) {
            $query->where('product_id', $productId);
        }

        // Load relationships if requested
        if ($withRelations) {
            $relations = explode(',', $withRelations);
            $allowedRelations = ['order', 'order.customer', 'product'];
            $relations = array_intersect($relations, $allowedRelations);
            if (!empty($relations)) {
                $query->with($relations);
            }
        } else {
            // Load default relationships
            $query->with(['order', 'product']);
        }

        $orderDetails = $query
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->appends($request->only(['per_page', 'order_id', 'product_id', 'with']));

        return OrderDetailResource::collection($orderDetails);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(OrderDetailRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $orderDetail = OrderDetail::create($request->validated());

            // Update product stock
            $product = Product::find($request->product_id);
            if ($product) {
                $product->decrement('stock_quantity', $request->quantity);
            }

            // Update order total price
            $order = $orderDetail->order;
            $order->increment('total_price', $orderDetail->quantity * $orderDetail->unit_price);

            // Load relationships for response
            $orderDetail->load(['order', 'product']);

            return new OrderDetailResource($orderDetail);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, OrderDetail $orderDetail)
    {
        $withRelations = $request->input('with', '');
        
        if ($withRelations) {
            $relations = explode(',', $withRelations);
            $allowedRelations = ['order', 'order.customer', 'product'];
            $relations = array_intersect($relations, $allowedRelations);
            if (!empty($relations)) {
                $orderDetail->load($relations);
            }
        } else {
            // Load default relationships
            $orderDetail->load(['order', 'product']);
        }

        return new OrderDetailResource($orderDetail);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(OrderDetailRequest $request, OrderDetail $orderDetail)
    {
        return DB::transaction(function () use ($request, $orderDetail) {
            $oldQuantity = $orderDetail->quantity;
            $oldUnitPrice = $orderDetail->unit_price;
            $oldSubtotal = $oldQuantity * $oldUnitPrice;

            // Restore old stock
            $product = Product::find($orderDetail->product_id);
            if ($product) {
                $product->increment('stock_quantity', $oldQuantity);
            }

            // Update order detail
            $orderDetail->update($request->validated());

            // Update new stock
            $product = Product::find($request->product_id);
            if ($product) {
                $product->decrement('stock_quantity', $request->quantity);
            }

            // Update order total price
            $order = $orderDetail->order;
            $newSubtotal = $request->quantity * $request->unit_price;
            $difference = $newSubtotal - $oldSubtotal;
            $order->increment('total_price', $difference);

            // Load relationships for response
            $orderDetail->load(['order', 'product']);

            return new OrderDetailResource($orderDetail);
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OrderDetail $orderDetail)
    {
        return DB::transaction(function () use ($orderDetail) {
            // Restore stock
            $product = Product::find($orderDetail->product_id);
            if ($product) {
                $product->increment('stock_quantity', $orderDetail->quantity);
            }

            // Update order total price
            $order = $orderDetail->order;
            $subtotal = $orderDetail->quantity * $orderDetail->unit_price;
            $order->decrement('total_price', $subtotal);

            // Delete order detail
            $orderDetail->delete();

            return response()->noContent();
        });
    }
}
