<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'username',
        'password',
        'email',
        'address',
        'phone_number',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Hash the password before saving.
     */
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = Hash::make($value);
    }

    /**
     * Get the orders for the customer.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the order history for the customer.
     */
    public function orderHistory()
    {
        return $this->hasMany(OrderHistory::class);
    }
}
