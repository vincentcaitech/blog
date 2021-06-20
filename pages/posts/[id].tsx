import { redirect } from "next/dist/next-server/server/api-utils";
import { useContext, useEffect, useState } from "react";
import Post from "../../components/Post";
import {pDatabase,pAuth} from "../../services/config";
import { PContext } from "../../services/context";

export default function SinglePost(props){
    const {isAdmin} = useContext(PContext);
    const [data,setData] = useState({...props});
    
    //if isFailed, it is private, so try again on client side with auth in case you are an admin and still have access to private posts.
    useEffect(()=>{
        setData({...props});
        if(props.isFailed&&isAdmin){
            getDoc(props.id);
        }
    },[isAdmin,props])


    //try on client side in case you are a admin
    const getDoc = async (id) => {
        try{
            var res = await pDatabase.collection("posts").doc(id).get();
            setData({...res.data(),id: res.id});
        }catch(e){
            console.error(e);
        }
    };
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

export async function getServerSideProps({params}){
    try{
        var res = await pDatabase.collection("posts").doc(params.id).get();
        return {props: {...res.data(),id: params.id, isFailed: false}}
    }catch(e){
        return {props: {isFailed: true, id: params.id}};   
    }
}