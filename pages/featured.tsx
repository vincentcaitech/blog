import { useContext, useEffect, useState } from "react"
import ListScaffold from "../components/ListScaffold"
import { pAuth, pDatabase,fbFieldValue } from "../services/config";
import { getDateString } from "../services/convert";
import Link from "next/link"
import Popup from "../components/Popup";
import Loading from "../components/Loading"
import { useRouter } from 'next/router'
import { route } from "next/dist/next-server/server/router";
import PostPreview from "../components/PostPreview";
import { PContext } from "../services/context";

export default function Featured(){
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

    const getRecentDocs = async () =>{
        var res = (await pDatabase.collection("posts").orderBy("dateWritten","desc").where("isPrivate","==",false).where("isFeatured","==",true).limit(batchSize).get()).docs;
        var arr = res.map(doc=>{return {...doc.data(),id:doc.id}});
        setDocs(arr);
    }

    return <ListScaffold title="Featured Posts">
        <ul id="posts-list">
            {docs.map((post)=>{
                return <li><PostPreview post={post}/></li>
            })}
        </ul>
    </ListScaffold>
}
