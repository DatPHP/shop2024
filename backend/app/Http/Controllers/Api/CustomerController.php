<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Http\Requests\CustomerRequest;
use App\Http\Resources\CustomerResource;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Response;

class CustomerController extends Controller
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
        $withRelations = $request->input('with', '');

        $query = Customer::query();

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        // Load relationships if requested
        if ($withRelations) {
            $relations = explode(',', $withRelations);
            $allowedRelations = ['orders', 'orderHistory'];
            $relations = array_intersect($relations, $allowedRelations);
            if (!empty($relations)) {
                $query->with($relations);
            }
        }

        $customers = $query
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->appends($request->only(['per_page', 'search', 'with']));

        return CustomerResource::collection($customers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CustomerRequest $request)
    {
        $customer = Customer::create($request->validated());
        return new CustomerResource($customer);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Customer $customer)
    {
        $withRelations = $request->input('with', '');
        
        if ($withRelations) {
            $relations = explode(',', $withRelations);
            $allowedRelations = ['orders', 'orderHistory'];
            $relations = array_intersect($relations, $allowedRelations);
            if (!empty($relations)) {
                $customer->load($relations);
            }
        }

        return new CustomerResource($customer);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());
        return new CustomerResource($customer);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();
        return response()->noContent();
    }

    /**
     * Export customers list as CSV
     */
    public function exportCSV(Request $request)
    {
        $search = trim((string) $request->input('search', ''));
        
        $query = Customer::query();

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $customers = $query->orderByDesc('created_at')->get();

        $filename = 'customers_' . date('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($customers) {
            $file = fopen('php://output', 'w');
            
            // Add CSV headers
            fputcsv($file, ['ID', 'Username', 'Email', 'Address', 'Phone Number', 'Created At', 'Updated At']);
            
            // Add customer data
            foreach ($customers as $customer) {
                fputcsv($file, [
                    $customer->id,
                    $customer->username,
                    $customer->email,
                    $customer->address ?? '',
                    $customer->phone_number ?? '',
                    $customer->created_at->format('Y-m-d H:i:s'),
                    $customer->updated_at->format('Y-m-d H:i:s'),
                ]);
            }
            
            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    /**
     * Export customers list as PDF
     */
    public function exportPDF(Request $request)
    {
        $search = trim((string) $request->input('search', ''));
        
        $query = Customer::query();

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $customers = $query->orderByDesc('created_at')->get();

        $data = [
            'customers' => $customers,
            'title' => 'Customers List',
            'date' => now()->format('Y-m-d H:i:s'),
        ];

        $pdf = Pdf::loadView('exports.customers-pdf', $data);
        
        $filename = 'customers_' . date('Y-m-d_His') . '.pdf';
        
        return $pdf->download($filename);
    }
}
