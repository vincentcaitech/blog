import '../styles/globals.scss'
import CustomHead from '../components/CustomHead'
import Footer from '../components/Footer.tsx'
import Header from '../components/Header.tsx'
import React, { useState } from 'react'
import {PContext} from "../services/context";
import {pAuth } from "../services/config";

function MyApp({ Component, pageProps }) {
  const [batchSize,setBatchSize] = useState(5);
  const [loggedIn,setLoggedIn] = useState(false);
  pAuth.onAuthStateChanged((user)=>{
    if(user) setLoggedIn(true);
    else setLoggedIn(false);
  })


  const contextObj = {
    batchSize,
    setBatchSize,
    loggedIn,
    setLoggedIn
  };
  return  <PContext.Provider value={contextObj}>
    <CustomHead/>
    <Header></Header>
    <main><Component {...pageProps} /></main>
    <Footer/>
  </PContext.Provider>
}

export default MyApp
