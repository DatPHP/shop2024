<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderHistory;
use Illuminate\Http\Request;
use App\Http\Requests\OrderHistoryRequest;
use App\Http\Resources\OrderHistoryResource;

class OrderHistoryController extends Controller
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

        $customerId = $request->input('customer_id');
        $orderId = $request->input('order_id');
        $withRelations = $request->input('with', '');

        $query = OrderHistory::query();

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        if ($orderId) {
            $query->where('order_id', $orderId);
        }

        // Load relationships if requested
        if ($withRelations) {
            $relations = explode(',', $withRelations);
            $allowedRelations = ['customer', 'order', 'order.orderDetails', 'order.orderDetails.product'];
            $relations = array_intersect($relations, $allowedRelations);
            if (!empty($relations)) {
                $query->with($relations);
            }
        } else {
            // Load default relationships
            $query->with(['customer', 'order']);
        }

        $orderHistory = $query
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->appends($request->only(['per_page', 'customer_id', 'order_id', 'with']));

        return OrderHistoryResource::collection($orderHistory);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(OrderHistoryRequest $request)
    {
        // Check if order history already exists
        $existingHistory = OrderHistory::where('customer_id', $request->customer_id)
            ->where('order_id', $request->order_id)
            ->first();

        if ($existingHistory) {
            return response()->json([
                'message' => 'Order history entry already exists for this customer and order.'
            ], 409);
        }

        $orderHistory = OrderHistory::create($request->validated());
        
        // Load relationships for response
        $orderHistory->load(['customer', 'order']);

        return new OrderHistoryResource($orderHistory);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, OrderHistory $orderHistory)
    {
        $withRelations = $request->input('with', '');
        
        if ($withRelations) {
            $relations = explode(',', $withRelations);
            $allowedRelations = ['customer', 'order', 'order.orderDetails', 'order.orderDetails.product'];
            $relations = array_intersect($relations, $allowedRelations);
            if (!empty($relations)) {
                $orderHistory->load($relations);
            }
        } else {
            // Load default relationships
            $orderHistory->load(['customer', 'order']);
        }

        return new OrderHistoryResource($orderHistory);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(OrderHistoryRequest $request, OrderHistory $orderHistory)
    {
        // Check if another order history entry exists with the same customer and order
        $existingHistory = OrderHistory::where('customer_id', $request->customer_id)
            ->where('order_id', $request->order_id)
            ->where('id', '!=', $orderHistory->id)
            ->first();

        if ($existingHistory) {
            return response()->json([
                'message' => 'Order history entry already exists for this customer and order.'
            ], 409);
        }

        $orderHistory->update($request->validated());
        
        // Load relationships for response
        $orderHistory->load(['customer', 'order']);

        return new OrderHistoryResource($orderHistory);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OrderHistory $orderHistory)
    {
        $orderHistory->delete();
        return response()->noContent();
    }
}
