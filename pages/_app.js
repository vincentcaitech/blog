import '../styles/globals.scss'
import CustomHead from '../components/CustomHead'
import Footer from '../components/Footer.tsx'
import Header from '../components/Header.tsx'
import React, { useState } from 'react'
import {PContext} from "../services/context";

function MyApp({ Component, pageProps }) {
  const [batchSize,setBatchSize] = useState(5);

  const contextObj = {
    batchSize,
    setBatchSize,
  };
  return  <PContext.Provider value={contextObj}>
    <CustomHead/>
    <Header></Header>
    <main><Component {...pageProps} /></main>
    <Footer/>
  </PContext.Provider>
}

export default MyApp
