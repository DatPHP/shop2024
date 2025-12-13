import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axios';
import Swal from 'sweetalert2'

export default function Product() {
    const [products, setProducts] = useState([])
    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        await axios.get(`/products`).then(({ data }) => {
            setProducts(data)
        })
    }

    const deleteProduct = async (id) => {
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

        await axios.delete(`/products/${id}`).then(({ data }) => {
            Swal.fire({
                icon: "success",
                text: data.message
            })
            fetchProducts()
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
									to="/product/create"
									className="font-medium text-primary-600 hover:underline dark:text-primary-500">
									Create
								</Link>

                {/* <Link path="/product/create" className='btn btn-primary mb-2 float-end' index element={<CreateProduct />} />  */}
           </div>
		</>
	);
}
