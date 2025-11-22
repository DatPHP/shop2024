<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Http\Requests\CustomerRequest;
use App\Http\Resources\CustomerResource;

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
}
