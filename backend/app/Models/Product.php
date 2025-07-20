<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; 

class Product extends Model
{
    use HasFactory, SoftDeletes; 

    protected $fillable = [
        'title', 
        'description', 
        'image',
        'price',
        'sales_off',
        'low_price',
        'status',
        'active',
        'user_id'
    ];

    /**
     * Get the user that owns the product.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
