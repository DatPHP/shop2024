import React, { useEffect, useState } from 'react';
import Header from './components/header.jsx'
import Footer from './components/footer.jsx'
import Banner from './components/banner.jsx'
import Cart from './components/cart.jsx'
import Sliderbanner from './components/sliderbanner.jsx'
import SimpleSlider from './components/simpleslider.jsx';
import Product from './components/product.jsx'
import Backtotop from './components/backtotop.jsx'
import Modal1 from './components/modal1.jsx'

function App() {

  return (
    <>
      <Header></Header>
      <Cart></Cart>
      <SimpleSlider></SimpleSlider>
      <Banner></Banner>
      <Product></Product>
      <Footer></Footer>
      <Backtotop></Backtotop>
      <Modal1></Modal1>
    </>
  )
}

export default App
