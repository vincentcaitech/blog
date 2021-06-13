import Post from "../../components/Post";
import {pDatabase,pAuth} from "../../services/config";

export default function SinglePost(props){
    return <Post 
        title={props.title} 
        subtitle={props.subtitle}
        author={props.author}
        dateWritten={props.dateWritten}
        dateModified={props.dateModified}
        imageURL={props.imageURL}
        topic={props.topic}
        body={props.body}
    />
}

export async function getStaticProps({params}){
    var res = await pDatabase.collection("posts").doc(params.id).get();
    return {props: res.data()}
}

export async function getStaticPaths(){
    var arr = [];
    var res = await pDatabase.collection("posts").doc("data").get();
    res.data()["ids"].forEach(id => arr.push({
        params: {id: id}
    }));
    console.log(arr);
    return {paths: arr, fallback: false}
}