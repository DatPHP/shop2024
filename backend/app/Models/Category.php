<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'parent_id', 'user_id'];

    public function subcategory()
    {
        return $this->hasMany(\App\Models\Category::class, 'parent_id');
    }

    public function parent()
    {
        return $this->belongsTo(\App\Models\Category::class, 'parent_id');
    }

    /**
     * Get the user that owns the category.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
