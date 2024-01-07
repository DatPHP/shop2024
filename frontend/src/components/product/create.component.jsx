import React, { useEffect, useState } from "react";
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import axios from 'axios'
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'

export default function CreateProduct() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [price, setPrice] = useState("")
  const [checked, setChecked] = useState(0)
  const [imageUpload, setImageUpload] = useState()

  const [validationError, setValidationError] = useState({})


  useEffect(() => {
    // free memory when ever this component is unmounted
    return () => imageUpload && URL.revokeObjectURL(imageUpload.preview)
  }, [imageUpload])

  const changeHandler = (event) => {
    const file = event.target.files[0];
    file.preview = URL.createObjectURL(file); //url image 
    setImage(file); //set value 
    setImageUpload(file) //set upload image url 
  };

  const handleClick = () => setChecked(!checked)

  const createProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('image', image)
    formData.append('price', price)
    formData.append('active', checked)
    formData.append('status', 0)

    await axios.post(`http://localhost:8000/api/products`, formData).then(({ data }) => {
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
      <Card color="transparent" shadow={false}>
        <Typography variant="h4" color="blue-gray">
          Create Product
        </Typography>

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


        <form onSubmit={createProduct} className="mt-2 mb-10 w-80 max-w-screen-lg sm:w-96">
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
            {imageUpload && <img className="h-auto max-w-lg rounded-lg" src={imageUpload.preview} />}
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="image">Upload file</label>
            <input
              name="image"
              id="Image"
              onChange={changeHandler}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              type="file" />
          </div>
          <div className="flex items-center mb-4">
            <input
              id="Active"
              checked={!checked}
              onChange={handleClick}
              value="true"
              type="checkbox"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="Active" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Active</label>
          </div>
          <Button type="submit" className="primary-button px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" fullWidth>
            Create
          </Button>
        </form>
      </Card>
    </div>
  )
}