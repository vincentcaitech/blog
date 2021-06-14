import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { getDateString } from "../services/convert"
import dynamic from "next/dynamic";
import 'draft-js/dist/Draft.css';
import ReactMarkdown from 'react-markdown'
import EditInput from "./EditInput";
import { fbFieldValue, pAuth, pDatabase, pStorage } from "../services/config";
import Popup from "./Popup";
import {useRouter} from "next/router";



export default function Post(props){
    const router = useRouter();
    const [isEditor,setIsEditor] = useState(props.isEditor);
    const [title,setTitle] = useState(props.title);
    const [subtitle,setSubtitle] = useState(props.subtitle);
    const [author,setAuthor] = useState(props.author);
    const [dateWritten,setDateWritten] = useState(props.dateWritten);
    const [dateModified,setDateModified] = useState(props.dateModified);
    const [body,setBody] = useState(props.body);
    const [topics,setTopics] = useState(props.topics)
    const [imageURL,setImageURL] = useState(props.imageURL);
    const [isFeatured,setIsFeatured] = useState(props.isFeatured)

    const [togglePreview,setTogglePreview] = useState(false);
    const [topicInput,setTopicInput] = useState("");
    const [saving,setSaving] = useState(false);
    const [uploading,setUploading] = useState(false);
    const [otherPosts,setOtherPosts] = useState([]);
    const [deletePopup,setDeletePopup] = useState(false);
    const [deleteText,setDeleteText] = useState("");

    pAuth.onAuthStateChanged((user)=>{
        if(user) setIsEditor(true);
        else setIsEditor(false);
    })


    const save = async () => {
        setSaving(true);
        try{
            await pDatabase.collection("posts").doc(props.id).update({
                title, subtitle, author, body,topics, imageURL, dateModified: (new Date()).getTime(),
            })
        }catch(e){
            console.error(e);
        }
        setSaving(false);
    }

    const uploadJumboImage = async (e) => {
        setUploading(true);
        try{
            const res = await pStorage.child("images").child(props.id).put(e.target.files[0]);
            const url:string = await res.ref.getDownloadURL();
            setImageURL(url);
        }catch(e){
            console.error(e);
        }
        setUploading(false);
    }

    useEffect(()=>{
        getRandomDocs()
    },[])

    const getRandomDocs = async () =>{
        var allDocs:string[] = (await pDatabase.collection("posts").doc("data").get()).data()["ids"];
        //allDocs = allDocs.filter((id)=>id!=props.id);
        var arr:string[] = [];
        for(var i = 0 ;i<3;i++){//three random docs.
            var index = Math.floor(Math.random()*allDocs.length)
            arr.push(allDocs[index]);
            allDocs.splice(index,1);
        }
        console.log(arr);
        var res = [];
        
        //Now get the data on these three docs.
        res[0] = {...(await pDatabase.collection("posts").doc(arr[0]).get()).data(), id: arr[0]};
        res[1] = {...(await pDatabase.collection("posts").doc(arr[1]).get()).data(), id: arr[1]};
        res[2] = {...(await pDatabase.collection("posts").doc(arr[2]).get()).data(), id: arr[2]};
        console.log(res);
        setOtherPosts(res);
    }

    const deletePost = async () =>{
        setSaving(true);
        const id:string = props.id;
        try{
            await pDatabase.collection("posts").doc(id).delete();
            await pDatabase.collection("posts").doc('data').update({
                ids: fbFieldValue.arrayRemove(id)
            })
            await pStorage.child("images").child(id).delete();
            setSaving(false);
            router.push("/posts");
        }catch(e){
            console.error(e);
            setSaving(false);
        }
    }


    return <div id="post">
        <div id="title-section"><h2 id="post-title">{isEditor?<EditInput placeholder="Title" set={setTitle} val={title}></EditInput>:title}</h2>
        <p id="post-subtitle">{isEditor?<EditInput placeholder="Subtitle" set={setSubtitle} val={subtitle}></EditInput>:subtitle}</p>
        </div>
        <div id="first-row">
            <div>
                <p id="post-date">{getDateString(dateWritten)}<span>(Last Updated {getDateString(dateModified)})</span></p>
                <p id="post-author">By {isEditor?<EditInput placeholder="Author" set={setAuthor} val={author}></EditInput>:author}</p>
            </div>
            <ul>
                <li>
                    <Link href="/recent"><a className="sb">Other Posts</a></Link>
                </li>
                <li>
                    <Link href={`/topics/${topics[0]}`}><a className="sb">{topics[0]}</a></Link>
                </li>
                <li>
                    <Link href="/about"><a className="sb">About</a></Link>
                </li>
            </ul>
        </div>
        <section id="jumbo-image" style={{backgroundImage: `url(${imageURL})`, backgroundSize: "cover"}}>
            {isEditor&&<div id="upload-jimage"><p>Upload A New Image</p><input type="file" onChange={uploadJumboImage}></input></div>}
        </section>
        <section id="blog-text">
            {isEditor&&<div id="toggler">
                <button className={!togglePreview?"on":"off"} onClick={()=>setTogglePreview(false)}>Edit</button>
                <button className={togglePreview?"on":"off"} onClick={()=>setTogglePreview(true)}>Preview</button>
            </div>}
            <div id="blog-body">{!isEditor||togglePreview?(<ReactMarkdown>{body}</ReactMarkdown>):
                <textarea placeholder="Start Typing ... " onChange={(e)=>setBody(e.target.value)} value={body}></textarea>
            }</div>
        </section>
        <section id="topics">
            {isEditor&&<div id="input-topic">
                <EditInput placeholder="New Topic" set={setTopicInput} val={topicInput}></EditInput>
                <button className="sb" onClick={()=>{
                    var arr = topics;
                    topics.push(topicInput);
                    setTopicInput("");
                    setTopics(arr);
                }}>Add Topic</button>
            </div>}
            <ul><li>Topics:</li>
                {topics.map(topic=><li>{topic}{isEditor&&<button onClick={()=>setTopics(topics.filter(t=>t!=topic))}>X</button>}</li>)}</ul>
        </section>
        <section id="explore-more">
            <h6>Explore More</h6>
            <ul id="other-posts">{otherPosts.map((post)=>{
                if(!post.id) return;
                return <li className="other-post" ><Link href={`/posts/${post.id}`}>
                    <div>
                        <div className="j-image-other" style={{backgroundImage: `url(${post.imageURL})`, backgroundSize: "cover"}}></div>
                        <div className="other-info"><h3>{post.title}</h3>
                        <p>{post.subtitle}</p>
                        <div>
                            {getDateString(post.dateWritten)} By {post.author}
                        </div>
                        </div>
                    </div>
                </Link></li>
            })}</ul>
        </section> 
        {isEditor&&<section>
            <button id="delete-post" className="rb" onClick={()=>setDeletePopup(true)}>Delete Post</button>
        </section>}

        {isEditor&&<div id="editor-space">
            <h6>Editing Mode</h6>
            <button onClick={save} id="save-button">Publish</button>    
        </div>}

        {deletePopup&&<Popup><div>
                <div>Type "confirm" to confirm deletion</div>
                <EditInput set={setDeleteText} val={deleteText} placeholder="confirm"></EditInput>
                {deleteText==="confirm"&&<button className="rb" onClick={deletePost}>Delete</button>}
            </div></Popup>}

        {saving&&<Popup><p>Saving ...</p></Popup>}
        {uploading&&<Popup><p>Uploading...</p></Popup>}
    </div>
}