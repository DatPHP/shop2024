<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class PostRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'title' => 'required|string|max:255|min:3',
            'content' => 'required|string|min:10',
            'status' => 'sometimes|in:draft,published,archived',
            'published_at' => 'sometimes|nullable|date',
        ];

        // Add unique title validation for updates
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['title'] .= '|unique:posts,title,' . $this->route('post');
        } else {
            $rules['title'] .= '|unique:posts,title';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The post title is required.',
            'title.unique' => 'A post with this title already exists.',
            'title.min' => 'The title must be at least 3 characters.',
            'title.max' => 'The title may not be greater than 255 characters.',
            'content.required' => 'The post content is required.',
            'content.min' => 'The content must be at least 10 characters.',
            'status.in' => 'The status must be draft, published, or archived.',
            'published_at.date' => 'The published date must be a valid date.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422)
        );
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default status if not provided
        if (!$this->has('status')) {
            $this->merge(['status' => 'draft']);
        }

        // Set published_at to now if status is published and published_at is not set
        if ($this->input('status') === 'published' && !$this->has('published_at')) {
            $this->merge(['published_at' => now()]);
        }
    }
} 