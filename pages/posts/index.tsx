import { useContext, useEffect, useState } from "react"
import ListScaffold from "../../components/ListScaffold"
import { pAuth, pDatabase,fbFieldValue } from "../../services/config";
import { getDateString } from "../../services/convert";
import Link from "next/link"
import Popup from "../../components/Popup";
import Loading from "../../components/Loading"
import { useRouter } from 'next/router'
import { route } from "next/dist/next-server/server/router";
import PostPreview from "../../components/PostPreview";
import { PContext } from "../../services/context";

export default function Posts(){
    const router = useRouter();

    const [docs,setDocs] = useState([]);
    const [loading,setLoading] = useState(false);

    useEffect(()=>{
        getRecentDocs();
    },[])

    const { isAdmin, batchSize }= useContext(PContext);
    

    const getRecentDocs = async () =>{
        var res = (await pDatabase.collection("posts").where("isPrivate","==",false).orderBy("dateWritten","desc").limit(batchSize).get()).docs;
        var arr = res.map(doc=>{return {...doc.data(),id:doc.id}});
        setDocs(arr);
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
        </ul>
    </ListScaffold>
}
