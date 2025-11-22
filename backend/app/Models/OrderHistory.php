<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderHistory extends Model
{
    use HasFactory;

    protected $table = 'order_history';

    protected $fillable = [
        'customer_id',
        'order_id',
    ];

    /**
     * Get the customer that owns the order history.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the order for the order history.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
