import { useContext, useEffect, useState } from "react"
import ListScaffold from "../components/ListScaffold"
import { pAuth, pDatabase,} from "../services/config";
import Popup from "../components/Popup";
import Loading from "../components/Loading"
import ReactMarkdown from "react-markdown";
import { PContext } from "../services/context";


export default function About(){
    
    const [loading,setLoading] = useState(false);
    const [togglePreview,setTogglePreview] = useState(false);

    const { isAdmin }= useContext(PContext); 
    const [text,setText] = useState("");

    useEffect(()=>{
        getText()
    },[])

    const getText = async () =>{
        try{
            var res = (await pDatabase.collection("settings").doc("about").get()).data();
            setText(res["text"]);
        }catch(e){
            console.error(e);
        }
    }

    const save = async () =>{
        setLoading(true);
        try{
            await pDatabase.collection("settings").doc("about").update({text: text});
        }catch(e){
            console.error(e);
        }
        setLoading(false);
    }


    return <ListScaffold title="About">
        {loading&&<Popup><Loading/></Popup> }
        <div id="about-body">
        <section id="blog-text">
            {isAdmin&&<div id="toggler">
                <button className={!togglePreview?"on":"off"} onClick={()=>setTogglePreview(false)}>Edit</button>
                <button className={togglePreview?"on":"off"} onClick={()=>setTogglePreview(true)}>Preview</button>
            </div>}
            <div id="blog-body">{!isAdmin||togglePreview?(<ReactMarkdown>{text}</ReactMarkdown>):
                <textarea placeholder="Start Typing ... " onChange={(e)=>setText(e.target.value)} value={text}></textarea>
            }</div>
        </section>
        {isAdmin&&<div id="editor-space">
            <h6>Editing Mode</h6>
            <button onClick={save} id="save-button">Publish</button>    
        </div>}
        </div>
    </ListScaffold>
}
