import { useState } from "react"
import ListScaffold from "../components/ListScaffold"
import { pAuth,} from "../services/config";
import Popup from "../components/Popup";
import Loading from "../components/Loading"


export default function About(){
    
    const [loading,setLoading] = useState(false);


    const [loggedIn,setLoggedIn] = useState(false);

    pAuth.onAuthStateChanged((user)=>{
        if(user) setLoggedIn(true);
        else setLoggedIn(false);
    })


    return <ListScaffold title="About">
        {loading&&<Popup><Loading/></Popup> }
        <ul id="posts-list">
            
        </ul>
    </ListScaffold>
}
