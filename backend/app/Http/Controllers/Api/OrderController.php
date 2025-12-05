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
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderShipped;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Response;


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

            // Send email notification
          //  Mail::to($order->customer->email)->send(new OrderShipped($order));
            Mail::to('nguyenvandat170296@gmail.com')->send(new OrderShipped($order));

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

    /**
     * Export orders list as CSV
     */
    public function exportCSV(Request $request)
    {
        $search = trim((string) $request->input('search', ''));
        $customerId = $request->input('customer_id');
        
        $query = Order::with(['customer']);

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        if ($search !== '') {
            $query->whereHas('customer', function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $orders = $query->orderByDesc('order_date')->get();

        $filename = 'orders_' . date('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($orders) {
            $file = fopen('php://output', 'w');
            
            // Add CSV headers
            fputcsv($file, ['ID', 'Customer ID', 'Customer Username', 'Customer Email', 'Order Date', 'Total Price', 'Created At', 'Updated At']);
            
            // Add order data
            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->id,
                    $order->customer_id,
                    $order->customer->username ?? '',
                    $order->customer->email ?? '',
                    $order->order_date->format('Y-m-d H:i:s'),
                    number_format($order->total_price, 2),
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->updated_at->format('Y-m-d H:i:s'),
                ]);
            }
            
            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    /**
     * Export orders list as PDF
     */
    /**
     * Export orders list as PDF
     */
    public function exportPDF(Request $request)
    {
        $search = trim((string) $request->input('search', ''));
        $customerId = $request->input('customer_id');
        
        $query = Order::with(['customer', 'orderDetails', 'orderDetails.product']);

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        if ($search !== '') {
            $query->whereHas('customer', function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $orders = $query->orderByDesc('order_date')->get();

        $data = [
            'orders' => $orders,
            'title' => 'Orders List',
            'date' => now()->format('Y-m-d H:i:s'),
        ];

        $pdf = Pdf::loadView('exports.orders-pdf', $data);
        
        $filename = 'orders_' . date('Y-m-d_His') . '.pdf';
        
        return $pdf->download($filename);
    }

    /**
     * Export single order detail as PDF
     */
    public function exportOrderDetailPDF(Order $order)
    {
        // Load all necessary relationships
        $order->load(['customer', 'orderDetails', 'orderDetails.product']);
        
        $data = [
            'order' => $order,
            'title' => 'Order Invoice',
            'date' => now()->format('Y-m-d H:i:s'),
        ];

        $pdf = Pdf::loadView('exports.order-detail-pdf', $data);
        
        $filename = 'order_' . $order->id . '_' . date('Y-m-d_His') . '.pdf';
        
        return $pdf->download($filename);
    }

    /**
     * Get revenue analytics filtered by day, week, or month.
     */
    public function getRevenueAnalytics(Request $request)
    {
        $filter = $request->input('filter', 'day'); // day, week, month
        $query = Order::query();

        switch ($filter) {
            case 'week':
                $data = $query->select(
                    DB::raw('DATE(order_date) as date'),
                    DB::raw('SUM(total_price) as total')
                )
                ->where('order_date', '>=', now()->subWeeks(1))
                ->groupBy('date')
                ->orderBy('date')
                ->get();
                break;

            case 'month':
                $data = $query->select(
                    DB::raw('DATE(order_date) as date'),
                    DB::raw('SUM(total_price) as total')
                )
                ->where('order_date', '>=', now()->subMonths(1))
                ->groupBy('date')
                ->orderBy('date')
                ->get();
                break;
            
            case 'day':
            default:
                $data = $query->select(
                    DB::raw('HOUR(order_date) as hour'),
                    DB::raw('SUM(total_price) as total')
                )
                ->whereDate('order_date', now())
                ->groupBy('hour')
                ->orderBy('hour')
                ->get();
                break;
        }

        return response()->json($data);
    }
}
