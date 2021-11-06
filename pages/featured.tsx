import {  useContext, useEffect, useState } from "react"
import ListScaffold from "../components/ListScaffold"
import {pDatabase } from "../services/config";
import PostPreview from "../components/PostPreview";
import { PContext } from "../services/context";


export default function Featured(){
    const {batchSize} = useContext(PContext);
    const [docs,setDocs] = useState([]);
    const [lastDoc,setLastDoc] = useState<any>(-1);

    useEffect(()=>{
        getRecentDocs(true);
    },[])

    const getRecentDocs = async (isFirst:boolean) =>{
        try{
            var query = pDatabase.collection("posts").where("isPrivate","==",false).where("isFeatured","==",true).orderBy("dateWritten","desc");
            if(lastDoc==null){
                return;
            }else if(lastDoc!=-1&&!isFirst){ //still more to paginate, but also not first batch.
                query = query.startAfter(lastDoc);
            }
            query = query.limit(batchSize);
            var res = (await query.get()).docs;
            console.log(res.length);
            if(res.length==batchSize){
                setLastDoc(res[res.length-1]);
            }else{
                setLastDoc(null);
            }
            var arr = res.map(doc=>{return {...doc.data(),id:doc.id}});
            console.log(arr);
            if(isFirst) setDocs(arr);
            else setDocs([...docs,...arr]);
        }catch(e){
            console.error(e);
        }
    }

    return <ListScaffold title="Featured Posts">
        <ul id="posts-list">
            {docs.map((post)=>{
                return <li key={post.id}><PostPreview post={post}/></li>
            })}
            {lastDoc!=null&&<button className="more-posts" onClick={()=>getRecentDocs(false)}>More Posts</button>}
        </ul>
    </ListScaffold>
}
