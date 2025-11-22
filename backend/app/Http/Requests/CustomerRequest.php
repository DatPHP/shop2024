<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomerRequest extends FormRequest
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
        $customerId = $this->route('customer') ? $this->route('customer')->id : null;
        
        return [
            'username' => ['required', 'string', 'max:255', 'unique:customers,username,' . $customerId],
            'password' => $this->isMethod('POST') ? ['required', 'string', 'min:6'] : ['sometimes', 'string', 'min:6'],
            'email' => ['required', 'email', 'max:255', 'unique:customers,email,' . $customerId],
            'address' => ['nullable', 'string', 'max:500'],
            'phone_number' => ['nullable', 'string', 'max:20'],
        ];
    }
}
