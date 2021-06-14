import { useEffect, useState } from "react"
import ListScaffold from "../components/ListScaffold"
import { pAuth, pDatabase,fbFieldValue } from "../services/config";
import { getDateString } from "../services/convert";
import Link from "next/link"
import Popup from "../components/Popup";
import Loading from "../components/Loading"


export default function Topics(){
    const [docs,setDocs] = useState([]);
    const [loading,setLoading] = useState(false);

    useEffect(()=>{
        getRecentDocs();
    },[])


    const [loggedIn,setLoggedIn] = useState(false);

    pAuth.onAuthStateChanged((user)=>{
        if(user) setLoggedIn(true);
        else setLoggedIn(false);
    })
    

    const getRecentDocs = async () =>{
        setDocs([]);
    }

    return <ListScaffold title="Topics">
        {loading&&<Popup><Loading/></Popup> }
        <ul id="posts-list">
            
        </ul>
    </ListScaffold>
}
