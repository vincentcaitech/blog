import { useEffect, useState } from "react"
import ListScaffold from "../../components/ListScaffold"
import { pAuth, pDatabase,fbFieldValue } from "../../services/config";
import { getDateString } from "../../services/convert";
import Link from "next/link"
import Popup from "../../components/Popup";
import Loading from "../../components/Loading"
import { useRouter } from 'next/router'
import { route } from "next/dist/next-server/server/router";

export default function Posts(){
    const batchSize = 5;//five posts at a time;
    const router = useRouter();

    const [docs,setDocs] = useState([]);
    const [loading,setLoading] = useState(false);

    useEffect(()=>{
        getRecentDocs();
    },[])

    useEffect(()=>{
        console.log(docs);
    },[docs])

    const [loggedIn,setLoggedIn] = useState(false);

    pAuth.onAuthStateChanged((user)=>{
        if(user) setLoggedIn(true);
        else setLoggedIn(false);
    })
    

    const getRecentDocs = async () =>{
        var res = (await pDatabase.collection("posts").orderBy("dateWritten","desc").limit(batchSize).get()).docs;
        var arr = res.map(doc=>{return {...doc.data(),id:doc.id}});
        console.log(arr);
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
                isFeatured: false,
            })
            console.log(fbFieldValue);
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
        {loggedIn&&<button id="add-post" onClick={newPost}>New Post</button>}
        <ul id="posts-list">
            {docs.map((post)=>{
                return <li><Link href={`/posts/${post.id}`}><a id="single-post">
                    <div className="post-image" style={{backgroundImage: `url(${post.imageURL})`}}></div>
                    <div className="post-info">
                        <h3>{post.title}</h3>
                        <p className="subtitle">{post.subtitle}</p>
                        <p className="author">By {post.author}</p>
                        <p className="date">{getDateString(post.dateWritten)}</p>
                    </div>
                </a>
                </Link></li>
            })}
        </ul>
    </ListScaffold>
}
