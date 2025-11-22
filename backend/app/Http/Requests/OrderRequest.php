<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'order_date' => ['required', 'date'],
            'total_price' => ['required', 'numeric', 'min:0'],
            'order_details' => ['required', 'array', 'min:1'],
            'order_details.*.product_id' => ['required', 'exists:products,id'],
            'order_details.*.quantity' => ['required', 'integer', 'min:1'],
            'order_details.*.unit_price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
