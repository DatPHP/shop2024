<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'address' => $this->address,
            'phone_number' => $this->phone_number,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'orders' => $this->whenLoaded('orders', function () {
                return OrderResource::collection($this->orders);
            }),
            'order_history' => $this->whenLoaded('orderHistory', function () {
                return OrderHistoryResource::collection($this->orderHistory);
            }),
            'orders_count' => $this->when(isset($this->orders_count), $this->orders_count),
        ];
    }
}
