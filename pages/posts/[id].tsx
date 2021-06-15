import { useContext, useState } from "react";
import Post from "../../components/Post";
import {pDatabase,pAuth} from "../../services/config";
import { PContext } from "../../services/context";

export default function SinglePost(props){
    const { loggedIn }= useContext(PContext);

    return <Post 
        title={props.title} 
        subtitle={props.subtitle}
        author={props.author}
        dateWritten={props.dateWritten}
        dateModified={props.dateModified}
        imageURL={props.imageURL}
        topics={props.topics}
        body={props.body}
        isEditor={loggedIn} //if logged in and can edit
        id={props.id}
        isFeatured={props.isFeatured}
    />
}

export async function getServerSideProps({params}){
    var res = await pDatabase.collection("posts").doc(params.id).get();
    return {props: {...res.data(),id: params.id}}
}

// export async function getStaticPaths(){
//     var arr = [];
//     var res = await pDatabase.collection("posts").doc("data").get();
//     res.data()["ids"].forEach(id => arr.push({
//         params: {id: id}
//     }));
//     console.log(arr);
//     return {paths: arr, fallback: false}
// }