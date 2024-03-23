import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from './components/header.jsx'
import Footer from './components/footer.jsx'
import Banner from './components/banner.jsx'
import Cart from './components/cart.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header></Header>
      <Cart></Cart>
      <Banner></Banner>
    
      <Footer></Footer>
    </>
  )
}

export default App
