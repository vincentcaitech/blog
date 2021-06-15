import { useContext, useState } from "react"
import ListScaffold from "../components/ListScaffold"
import { pAuth,} from "../services/config";
import Popup from "../components/Popup";
import Loading from "../components/Loading"
import ReactMarkdown from "react-markdown";
import { PContext } from "../services/context";


export default function About(){
    
    const [loading,setLoading] = useState(false);
    const [togglePreview,setTogglePreview] = useState(false);

    const { loggedIn }= useContext(PContext); 
    const [text,setText] = useState("");


    return <ListScaffold title="About">
        {loading&&<Popup><Loading/></Popup> }
        <div id="about-body">
        <section id="blog-text">
            {loggedIn&&<div id="toggler">
                <button className={!togglePreview?"on":"off"} onClick={()=>setTogglePreview(false)}>Edit</button>
                <button className={togglePreview?"on":"off"} onClick={()=>setTogglePreview(true)}>Preview</button>
            </div>}
            <div id="blog-body">{!loggedIn||togglePreview?(<ReactMarkdown>{text}</ReactMarkdown>):
                <textarea placeholder="Start Typing ... " onChange={(e)=>setText(e.target.value)} value={text}></textarea>
            }</div>
        </section>
        </div>
    </ListScaffold>
}
