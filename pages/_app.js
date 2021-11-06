import '../styles/globals.scss'
import CustomHead from '../components/CustomHead'
import Footer from '../components/Footer.tsx'
import Header from '../components/Header.tsx'
import React, { useEffect, useState } from 'react'
import {PContext} from "../services/context";
import {pAuth, pDatabase } from "../services/config";

function MyApp({ Component, pageProps }) {
  const [batchSize,setBatchSize] = useState(3);
  const commentBatchSize = 5; //document getting varies with n^2, because this is batch size for both main comments and replies
  const [loggedIn,setLoggedIn] = useState(false);
  const [admins,setAdmins] = useState([]);
  const [isAdmin,setIsAdmin] = useState(loggedIn);
  const [isMobile,setIsMobile] = useState(false);
  pAuth.onAuthStateChanged((user)=>{
    if(user) {
      setLoggedIn(true)
      if(admins.includes(user.uid)) setIsAdmin(true);
      else setIsAdmin(false);
    }else {
      setLoggedIn(false);
      setIsAdmin(false);
    }
  })

  useEffect(()=>{
    getAdmins();
    if(window.innerWidth<576) setIsMobile(true)
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
    isMobile
  };
  return  <PContext.Provider value={contextObj}>
    <CustomHead/>
    <Header></Header>
    <main><Component {...pageProps} /></main>
    <Footer/>
  </PContext.Provider>
}

export default MyApp
