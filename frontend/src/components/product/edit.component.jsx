import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";

export default function EditProduct() {
  const navigate = useNavigate();

  const { id } = useParams()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [validationError, setValidationError] = useState({})
  const [price, setPrice] = useState()
  const [image, setImage] = useState()
  const [checked, setChecked] = useState(0)
  //picture upload 
  const [selectedFile, setSelectedFile] = useState()

  useEffect(() => {
    fetchProduct()
  }, [])

  const fetchProduct = async () => {
    await axios.get(`http://localhost:8000/api/products/${id}`).then(({ data }) => {
      const { title, description, image, price, active } = data.product
      setTitle(title)
      setDescription(description)
      setPrice(price)
      setChecked(active)
      setImage(image)

    }).catch(({ response: { data } }) => {
      Swal.fire({
        text: data.message,
        icon: "error"
      })
    })
  }

  useEffect(() => {
    // free memory when ever this component is unmounted
    return () => selectedFile && URL.revokeObjectURL(selectedFile.preview)
  }, [selectedFile])

  const onSelectFile = e => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined)
      return
    }
    const file = e.target.files[0];
    file.preview = URL.createObjectURL(file); //url image 

    // I've kept this example simple by using the first image instead of multiple
    setSelectedFile(file)
  }
  const handleClick = e => {
    var isChecked = e.target.checked == true ? 1 : 0;
    setChecked(isChecked);
  }

  const updateProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData()
    formData.append('_method', 'PUT');
    formData.append('id', id);
    formData.append('title', title)
    formData.append('description', description)
    formData.append('image', selectedFile)
    formData.append('price', price)
    formData.append('active', checked)


    if (selectedFile !== null && selectedFile !== undefined) {
      formData.append('image', selectedFile)
    } else {
      formData.append('image', image)
    }

    await axios.post(`http://localhost:8000/api/products/${id}`, formData).then(({ data }) => {
      Swal.fire({
        icon: "success",
        text: data.message
      })
      navigate("/product")
    }).catch(({ response }) => {
      if (response.status === 422) {
        setValidationError(response.data.errors)
      } else {
        Swal.fire({
          text: response.data.message,
          icon: "error"
        })
      }
    })
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Update Product</h4>
              <hr />
              <div className="form-wrapper">
                {
                  Object.keys(validationError).length > 0 && (
                    <div className="row">
                      <div className="col-12">
                        <div className="alert alert-danger">
                          <ul className="mb-0">
                            {
                              Object.entries(validationError).map(([key, value]) => (
                                <li key={key}>{value}</li>
                              ))
                            }
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                }
                <form onSubmit={updateProduct} className="mt-2 mb-10 w-80 max-w-screen-lg sm:w-96">
                  <div className="mb-1 flex flex-col gap-6">
                    <Typography variant="h6" color="blue-gray" className="-mb-3">
                      Name
                    </Typography>
                    <Input
                      size="lg"
                      id="Name"
                      value={title} onChange={(event) => {
                        setTitle(event.target.value)
                      }}
                      placeholder="Input name of product"
                      className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                    />
                    <Typography variant="h6" color="blue-gray" className="-mb-3">
                      Description
                    </Typography>
                    <Input
                      size="lg"
                      id="Description"
                      value={description} onChange={(event) => {
                        setDescription(event.target.value)
                      }}

                      placeholder="Input description of product"
                      className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                    />

                    <Typography variant="h6" color="blue-gray" className="-mb-3">
                      Price
                    </Typography>
                    <Input
                      id="Price"
                      value={price} onChange={(event) => {
                        setPrice(event.target.value)
                      }}

                      size="lg"
                      placeholder="Input price of product"
                      className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                    />
                    {!selectedFile && image && <img className="h-auto max-w-lg rounded-lg" width="100px" src={`http://localhost:8000/storage/product/image/${image}`} />}
                    {selectedFile && <img className="h-auto max-w-lg rounded-lg" width="100px" src={selectedFile.preview} />}
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="image">Upload file</label>
                    <input
                      name="image"
                      id="Image"
                      onChange={onSelectFile}
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                      type="file" />
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      id="Active"
                      checked={checked}
                      onChange={handleClick}
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="Active" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Active</label>
                  </div>
                  <Button type="submit" className="primary-button px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" fullWidth>
                    Create
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}