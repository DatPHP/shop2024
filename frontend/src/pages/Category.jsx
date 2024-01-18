import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Button } from "@material-tailwind/react";


export default function Category() {


    const [categories, setCategories] = useState([])

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        await axios.get(`http://localhost:8000/api/categories`).then(({ data }) => {
            setCategories(data)
        })
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

        await axios.delete(`http://localhost:8000/api/categories/${id}`).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.message
            })
            fetchCategories()
        }).catch(({ response: { data } }) => {
            Swal.fire({
                text: data.message,
                icon: "error"
            })
        })
    }

    return (
        <>
            <div className='col-12'>
                <Link
                    to="/category/create"
                    className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                    Create
                </Link>
                {/* <Link path="/product/create" className='btn btn-primary mb-2 float-end' index element={<CreateProduct />} />  */}
            </div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Category name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Category slug
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Parent Category
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

                                    <tr key={key} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {row.name}
                                        </th>
                                        <td className="px-6 py-4">
                                            {row.slug}
                                        </td>
                                        <td className="px-6 py-4">
                                            {row?.parent?.name}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex w-max gap-4">
                                                <Link to={`/category/edit/${row.id}`} className='<button type="button" class="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-6 py-2 text-center me-2 mb-2">Cyan to Blue</button>me-2'>
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

        </>
    );
}
