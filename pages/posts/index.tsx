import { useContext, useEffect, useState } from "react"
import ListScaffold from "../../components/ListScaffold"
import { pAuth, pDatabase,fbFieldValue } from "../../services/config";
import Popup from "../../components/Popup";
import Loading from "../../components/Loading"
import { useRouter } from 'next/router'
import PostPreview from "../../components/PostPreview";
import { PContext } from "../../services/context";

export default function Posts(){
    const router = useRouter();

    const [docs,setDocs] = useState([]);
    const [lastDoc,setLastDoc] = useState(-1);
    const [loading,setLoading] = useState(false);

    useEffect(()=>{
        getRecentDocs(true);
    },[])

    const { isAdmin, batchSize }= useContext(PContext);
    

    const getRecentDocs = async (isFirst:boolean) =>{
        try{
            var query = pDatabase.collection("posts").where("isPrivate","==",false).orderBy("dateWritten","desc");
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

    const newPost = async () =>{
        setLoading(true);
        try{
            var res = await pDatabase.collection("posts").add({
                title: "",
                subtitle: "",
                author: pAuth.currentUser.displayName,
                imageURL: "",
                dateWritten: (new Date()).getTime(),
                dateModified: (new Date()).getTime(),
                body: "",
                topics: [],
                attachments: [],
                comments: [],
                isFeatured: false,
                isPrivate: true,
            })
            await pDatabase.collection("posts").doc("data").update({
                ids: fbFieldValue.arrayUnion(res.id),
            })
        }catch(e){
            console.error(e);
        }
        setLoading(false);
        router.push(`/posts/${res.id}`)
    }

    return <ListScaffold title="Recent Posts">
        {loading&&<Popup><Loading/></Popup> }
        {isAdmin&&<button id="add-post" onClick={newPost}>New Post</button>}
        <ul id="posts-list">
            {docs.map((post)=>{
                return <li key={post.id}><PostPreview post={post}/></li>
            })}
            {lastDoc!=null&&<button className="more-posts" onClick={()=>getRecentDocs(false)}>More Posts</button>}
        </ul>
    </ListScaffold>
}
