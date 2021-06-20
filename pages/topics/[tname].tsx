import { useContext, useEffect, useState } from "react"
import ListScaffold from "../../components/ListScaffold"
import { pDatabase } from "../../services/config";
import {PContext} from "../../services/context";
import PostPreview from "../../components/PostPreview";
import { useRouter } from 'next/router'

export default function Topic(props){
    const [docs,setDocs] = useState([]);
    const router = useRouter()
    const { tname } = router.query;
    const topic = tname;
    const batchSize = useContext(PContext).batchSize;
    useEffect(()=>{
        getDocs();
    },[])



    const getDocs = async () =>{
        var res = (await pDatabase.collection("posts").orderBy("dateWritten","desc").where("isPrivate","==",false).where("topics","array-contains",topic).limit(batchSize).get()).docs;
        var arr = res.map(doc=>{return {...doc.data(),id:doc.id}});
        setDocs(arr);
    }

    return <div>
        <ListScaffold title={`Topic: ${topic}`}>
            <ul id="posts-list">
                {docs.map(post=>{
                    return <li id={post.id}><PostPreview post={post}/></li>
                })}
            </ul>
        </ListScaffold>
    </div>
}

/*READ MORE: https://nextjs.org/docs/routing/dynamic-routes#caveats, 
must have a serverside rendered page to not be "automatically statically optimized"
*/

export async function getServerSideProps(context) {
    return {
        props: {},
    };
}