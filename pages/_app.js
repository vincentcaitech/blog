import '../styles/globals.scss'
import CustomHead from '../components/CustomHead'
import Footer from '../components/Footer.tsx'
import Header from '../components/Header.tsx'
import React, { useEffect, useState } from 'react'
import {PContext} from "../services/context";
import {pAuth, pDatabase } from "../services/config";

function MyApp({ Component, pageProps }) {
  const [batchSize,setBatchSize] = useState(5);
  const commentBatchSize = 5;
  const [loggedIn,setLoggedIn] = useState(false);
  const [admins,setAdmins] = useState([]);
  const [isAdmin,setIsAdmin] = useState(loggedIn);
  pAuth.onAuthStateChanged((user)=>{
    if(user) {
      setLoggedIn(true)
      if(admins.includes(user.uid)) setIsAdmin(true);
      else setIsAdmin(false);
    }else setLoggedIn(false);
  })

  useEffect(()=>{
    getAdmins();
  },[])

  const getAdmins = async () =>{
    try{
      var res = (await pDatabase.collection("settings").doc("users").get()).data()["admins"];
      setAdmins(res);
    }catch(e){
      console.error(e);
    }
  }

  const contextObj = {
    batchSize,
    setBatchSize,
    loggedIn,
    setLoggedIn,
    isAdmin,
    commentBatchSize,
  };
  return  <PContext.Provider value={contextObj}>
    <CustomHead/>
    <Header></Header>
    <main><Component {...pageProps} /></main>
    <Footer/>
  </PContext.Provider>
}

export default MyApp
