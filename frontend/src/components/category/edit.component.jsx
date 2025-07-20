import React, { useEffect, useState } from "react";
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
  Select,
  Option
} from "@material-tailwind/react";
import axios from 'axios'
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom'

export default function EditCategory() {
  const navigate = useNavigate();

  const { id } = useParams()
  
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [parentCategory, setParentCategory] = useState("")
 
  const [validationError, setValidationError] = useState({})

  const [categories, setCategories] = useState([])

    useEffect(() => {
      fetchCategories()
    }, [])

    useEffect(() => {
      fetchCategory()
    }, [])

    const fetchCategories = async () => {
        await axios.get(`http://localhost:8000/api/allcategory`).then(({ data }) => {
          setCategories(data.categories)

          console.log(categories);

        })
    }

    const fetchCategory = async () => {
      await axios.get(`http://localhost:8000/api/categories/${id}`).then(({ data }) => {
        const { name, slug, parent_id } = data.category
        setName(name)
        setSlug(slug)
        setParentId(parent_id)
      }).catch(({ response: { data } }) => {
        Swal.fire({
          text: data.message,
          icon: "error"
        })
      })
  }

  const editCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData()
    formData.append('_method', 'PUT');
    formData.append('name', name)
    formData.append('slug', slug)
    formData.append('parent_id', parentCategory ? parentCategory : 0 )
   
   

    await axios.post(`http://localhost:8000/api/categories/${id}`, formData).then(({ data }) => {
      Swal.fire({
        icon: "success",
        text: data.message
      })
      navigate("/category")
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
          Edit Category
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

        <form onSubmit={editCategory} className="mt-2 mb-10 w-80 max-w-screen-lg sm:w-96">
          <div className="mb-1 flex flex-col gap-6 pb-5">
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Name
            </Typography>
            <Input
              size="lg"
              id="Name"
              value={name} onChange={(event) => {
                setName(event.target.value)
              }}
              placeholder="Input name of category"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Slug
            </Typography>
            <Input
              size="lg"
              id="Slug"
              value={slug} onChange={(event) => {
                setSlug(event.target.value)
              }}

              placeholder="Input description of category"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />

            <Typography variant="h6" color="blue-gray" className="-mb-3">
               Parent Category
            </Typography>

            <Select 
             id="parentCategory"
              className="rounded-md !border-t-blue-gray-200 focus:!border-t-gray-900 text-xs"
              selected={(element) =>
              {
                if (element) {
                  const selectedValue = element.props.value;
                  console.log('Selected Value:', selectedValue); 
                  setParentCategory(selectedValue);
                  
                  
                return <div className="pl-10 text-xs !border-t-blue-gray-200 focus:!border-t-gray-900"
                
               
                
                > 
                    {element.props.name}
                </div>
                }
              }
              }>
                {categories.map((option) => (
                      <Option   
                      key={String(option.id)} 
                      value={String(option.id)}
                       data-id={String(option.id)}
                        name={option.name}
                        className="border border-indigo-600"
                        >
                          <div className="pl-3 pt-1 pb-3 m-2"> 
                              {option.name}
                          </div>
                      </Option>
                    ))}
                </Select>
          </div>

          <Button 
          type="submit" 
          className="pt-10 primary-button px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" 
          fullWidth>
            Edit
          </Button>
        </form>
      </Card>
    </div>
  )
}