<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'customer_id' => $this->customer_id,
            'order_date' => $this->order_date?->toISOString(),
            'total_price' => (float) $this->total_price,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'customer' => $this->whenLoaded('customer', function () {
                return new CustomerResource($this->customer);
            }),
            'order_details' => $this->whenLoaded('orderDetails', function () {
                return OrderDetailResource::collection($this->orderDetails);
            }),
            'order_history' => $this->whenLoaded('orderHistory', function () {
                return OrderHistoryResource::collection($this->orderHistory);
            }),
            'order_details_count' => $this->when(isset($this->order_details_count), $this->order_details_count),
        ];
    }
}
