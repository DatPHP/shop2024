import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@material-tailwind/react";
import axios from '../../axios';
import Swal from 'sweetalert2'

export default function List() {

    const [categories, setCategories] = useState([])

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            Swal.fire({
                text: 'Failed to fetch categories',
                icon: "error"
            });
        }
    }

    const deleteCategory = async (id) => {
        const isConfirm = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            return result.isConfirmed
        });

        if (!isConfirm) {
            return;
        }

        try {
            const response = await axios.delete(`/categories/${id}`);
            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    text: response.data.message
                });
                fetchCategories();
            } else {
                Swal.fire({
                    text: response.data.message || 'Failed to delete category',
                    icon: "error"
                });
            }
        } catch (error) {
            Swal.fire({
                text: error.response?.data?.message || 'Failed to delete category',
                icon: "error"
            });
        }
    }

    return (
        <>
            {/* <div className='flex justify-start'>
                <Link
                    to="/category/create"
                    className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                    Create
                </Link>
            </div>
            <div className="flex justify-center flex-col items-center mt-2">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full overflow-x-auto h-64 text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Category name
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">
                                        Slug
                                        <a href="#"><svg className="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                        </svg></a>
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">
                                        Parent Category
                                        <a href="#"><svg className="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                        </svg></a>
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                categories.length > 0 && (
                                    categories.map((row, key) => (

                                        <tr key={key} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                {row.name}
                                            </th>
                                            <td className="px-6 py-4">
                                                {row.slug}
                                            </td>
                                            <td className="px-6 py-4">
                                                {row.parent ? row.parent.name : 'None'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex w-max gap-4">
                                                    <Link to={`/category/edit/${row.id}`} className='text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-6 py-2 text-center me-2 mb-2'>
                                                        Edit
                                                    </Link>
                                                    <Button className='text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2' color="red" onClick={() => deleteCategory(row.id)}>
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div> */}


            <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
          <Link
            to="/category/create"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Create Category
          </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No posts found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Parent Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                      {category.excerpt && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {category.excerpt}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900">
                      {category.slug || "N/A"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {category.parent ? category.parent.name : "None"}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/category/${category.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link
                          to={`/category/edit/${category.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deletecategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

        </>
    )
}