<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Requests\CreateCategoryRequest;

class CategoryController extends Controller
{
    public function createCategory(Request $request)
    {
        $categories = Category::where('parent_id', null)->orderby('name', 'asc')->get();
        if($request->method()=='GET')
        {
            return view('create-category', compact('categories'));
        }
        if($request->method()=='POST')
        {
            $validator = $request->validate([
                'name'      => 'required',
                'slug'      => 'required|unique:categories',
                'parent_id' => 'nullable|numeric'
            ]);

            Category::create([
                'name' => $request->name,
                'slug' => $request->slug,
                'parent_id' =>$request->parent_id
            ]);

            return redirect()->back()->with('success', 'Category has been created successfully.');
        }
    }

     /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function allCategory(Request $request)
    {
        $categories = Category::where('parent_id', 0)->orderby('name', 'asc')->get();

        return response()->json([
            'categories'=>$categories
        ]);
    }

     /**
     * Display the specified resource.
     *
     * @param  \App\Models\Category  $product
     * @return \Illuminate\Http\Response
     */
    public function show(Category $category)
    {
        return response()->json([
            'category'=>$category->load('parent')
        ]);
    }


    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
      //  $categories = Category::with('parent')->whereNull('parent_id')->get();
        $categories = Category::with('parent')->get();
        return $categories;
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $categories = Category::all();
        return view('categories.create')->with(compact(['categories']));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {

       
        $request->validate([
            'name'      => 'required',
            'slug'      => 'required|unique:categories',
            'parent_id' => 'nullable|numeric'
        ]);

        try{

        $category = new Category;
        $category->name = $request->name;
        $category->slug = $request->slug;
        $category->parent_id = $request->parent_id ? $request->parent_id : 0;

        if ($category->save() ) {
            return response()->json([
                'message'=>'Category Created Successfully!!'
            ]);
        }

        }catch(\Exception $e){

            \Log::error($e->getMessage());
            return response()->json([
                'message'=>'Something goes wrong while creating a cca!!'
            ],500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Category $category)
    {
        $categories = Category::all();
        return view('categories.edit')->with(compact(['category', 'categories']));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
      
        $request->validate([
            'name'      => 'required',
            'slug'      => 'required',
            'parent_id' => 'nullable'
        ]);

        try{
            $category = Category::where('id', $id)->first();

            $category->fill($request->post())->update();
            
            /*
            $category->name = $request->name;
            $category->slug = $request->slug;
            $category->parent_id = $request->parent_id ? $request->parent_id : 0;
            $category->save();
            */

            return response()->json([
                'message'=>'Category Updated Successfully!!'
            ]);
        }catch(\Exception $e){
            \Log::error($e->getMessage());
            return response()->json([
                'message'=>'Something goes wrong while updating a category!!'
            ],500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Category $category)
    {
        try {
            $category->delete();
            return response()->json([
                'message'=>'Category Deleted Successfully!!'
            ]);
        } catch (\Exception $e) {
            \Log::error($e->getMessage());
            return response()->json([
                'message'=>'Something goes wrong while deleting a category!!'
            ]);
        }
    }
}
