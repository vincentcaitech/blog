import { useContext, useEffect, useState } from "react"
import ListScaffold from "../components/ListScaffold"
import { pAuth, pDatabase} from "../services/config";
import PostPreview from "../components/PostPreview";
import { PContext } from "../services/context";

export default function PrivatePosts(){
    const [docs,setDocs] = useState([]);

    const { isAdmin, batchSize } = useContext(PContext);

    useEffect(()=>{
        getRecentDocs();
    },[isAdmin])
  
    const getRecentDocs = async () =>{
        var res = (await pDatabase.collection("posts").where("isPrivate","==",true).orderBy("dateWritten","desc").limit(batchSize).get()).docs;
        var arr = res.map(doc=>{return {...doc.data(),id:doc.id}});
        setDocs(arr);
    }

    return <div>
        {isAdmin?<ListScaffold title="Private Posts">
            <ul id="posts-list">
                {docs.map((post)=>{
                    return <li><PostPreview post={post}/></li>
                })}
            </ul>
        </ListScaffold>:<div id="private-no-access">No Access to Private Posts</div>}
    </div>
}
