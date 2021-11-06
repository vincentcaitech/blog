import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import Post from "../../components/Post";
import {pDatabase} from "../../services/config";
import { PContext } from "../../services/context";

export default function SinglePost(props){
    const {isAdmin} = useContext(PContext);
    const [data,setData] = useState({...props});
    const {query: {id}} = useRouter();
    const [loading,setIsLoading] = useState(true);

    
    //if isFailed, it is private, so try again on client side with auth in case you are an admin and still have access to private posts.
    useEffect(()=>{
        getDoc(id);
        /**FOLLOWING CODE IN USE FOR SERVER SIDE RENDERING */
        // setData({...props});
        // if(props.isFailed&&isAdmin){
        //     getDoc(props.id);
        // }
    },[isAdmin,props])


    //try on client side in case you are a admin
    const getDoc = async (id) => {
        try{
            var res = await pDatabase.collection("posts").doc(id).get();
            setData({...res.data(),id: res.id});
            setIsLoading(false);
        }catch(e){
            console.error(e);
        }
    };
    if(loading) return <div className="gob">
        <div className="popup">Loading...</div>
    </div>
    return <Post 
        title={data.title} 
        subtitle={data.subtitle}
        author={data.author}
        dateWritten={data.dateWritten}
        dateModified={data.dateModified}
        imageURL={data.imageURL}
        topics={data.topics}
        body={data.body}
        id={data.id}
        isFeatured={data.isFeatured}
        isPrivate={data.isPrivate}
        //this component will find if it isAdmin
    />
}

// export async function getServerSideProps({params}){
//     try{
//         var res = await pDatabase.collection("posts").doc(params.id).get();
//         return {props: {...res.data(),id: params.id, isFailed: false}}
//     }catch(e){
//         return {props: {isFailed: true, id: params.id}};   
//     }
// }