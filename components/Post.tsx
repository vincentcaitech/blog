import Link from "next/link"
import { useState, useRef, useEffect, useContext } from "react"
import { getDateString } from "../services/convert"
import dynamic from "next/dynamic";
import 'draft-js/dist/Draft.css';
import ReactMarkdown from 'react-markdown'
import EditInput from "./EditInput";
import { fbFieldValue, pAuth, pDatabase, pStorage } from "../services/config";
import Popup from "./Popup";
import {useRouter} from "next/router";
import { PContext } from "../services/context";
import CommentInput from "./CommentInput";
import imageCompression from 'browser-image-compression';



export default function Post(props){
    const router = useRouter();
    const context = useContext(PContext);
    const isEditor = context["isAdmin"]
    const commentBatchSize = context["commentBatchSize"];
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

    const [comments,setComments] = useState([]);
    const [lastComment,setLastComment] = useState<any>(null); //for non-replies, -1 for done;
    const [lastReply,setLastReply] = useState<any>({}); //object mapping last reply for each comment, -1 for done 
    const [commentUsername,setCommentUsername] = useState("");
    const [commentText,setCommentText] = useState("");
    const [writeReplyPopup,setWriteReplyPopup] = useState<null|string>(null); // null if adding comment, main comment id if writing a reply
    const [isPosting,setIsPosting] = useState(false);
    const [commentToDelete,setCommentToDelete] = useState<string|null>(null); //null is no popup.
    const [deleting,setDeleting] = useState(false);
    //const [showReplies,setShowReplies] = useState({}); //object of [commentId]: boolean, to toggle comments on/off
    useEffect(()=>{
        if(context.loggedIn) setCommentUsername(pAuth.currentUser.displayName);
    },[context.loggedIn])

    const save = async () => {
        setSaving(true);
        try{
            await pDatabase.collection("posts").doc(props.id).update({
                title, subtitle, author, body,topics, imageURL, dateModified: (new Date()).getTime(), isFeatured
            })
        }catch(e){
            console.error(e);
        }
        setSaving(false);
    }

    const uploadJumboImage = async (e) => {
        setUploading(true);
        try{
            const imageFile = e.target.files[0];
            const options = {
                maxSizeMB: 1,
            }
            const compressedFile = await imageCompression(imageFile, options);
            const res = await pStorage.child("images").child(props.id).put(compressedFile);
            const url:string = await res.ref.getDownloadURL();
            setImageURL(url);
        }catch(e){
            console.error(e);
        }
        setUploading(false);
    }

    //When getting a new post;
    useEffect(()=>{   
        //Reset all the blog post's properties
        setTitle(props.title);
        setSubtitle(props.subtitle);
        setAuthor(props.author);
        setDateWritten(props.dateWritten);
        setDateModified(props.dateModified);
        setBody(props.body);
        setTopics(props.topics)
        setImageURL(props.imageURL);
        setIsFeatured(props.isFeatured)
        //Then reset these values;
        setLastComment(null);
        setLastReply({})
        setComments([]);
        //Then call these functions: 
        getRandomDocs();
        getComments(true);
    },[props.id])

    const getRandomDocs = async () =>{
        var allDocs:string[] = (await pDatabase.collection("posts").doc("data").get()).data()["ids"];
        allDocs = allDocs.filter((id)=>id!=props.id);
        var arr:string[] = [];
        for(var i = 0 ;i<3;i++){//three random docs.
            var index = Math.floor(Math.random()*allDocs.length)
            arr.push(allDocs[index]);
            allDocs.splice(index,1);
        }
        var res = [];
        console.log(arr);
        
        //Now get the data on these three docs.
        res[0] = {...(await pDatabase.collection("posts").doc(arr[0]).get()).data(), id: arr[0]};
        res[1] = {...(await pDatabase.collection("posts").doc(arr[1]).get()).data(), id: arr[1]};
        res[2] = {...(await pDatabase.collection("posts").doc(arr[2]).get()).data(), id: arr[2]};
        setOtherPosts(res);
    }

    const getComments = async (isRefresh) =>{
        console.log("getting comments");
        var postRef = pDatabase.collection("posts").doc(props.id);
        try{
            //Get all main comments (non-replies)
            var query = postRef.collection("comments").where("replyTo","==",null).limit(commentBatchSize);
            if(lastComment==-1&&!isRefresh) return;
            if(lastComment!=null&&!isRefresh) query = query.startAfter(lastComment);
            var res = (await query.get()).docs;
            var arr = res.map(c=>{return {...c.data(),replies:[],id: c.id}});
            console.log(res);

            //Then get replies for each comment
            var repliesQuery = res.map(c=>{
                return postRef.collection("comments").where("replyTo","==",c.id).orderBy("dateAdded","asc").limit(commentBatchSize).get();
            });
            
            var allReplies = (await Promise.all(repliesQuery)).map(replies=>{return replies.docs;});
            console.log(allReplies);

            //Then assign replies to corresponding comment;
            var i = 0;  //index of reply list matches index of the main comment they replied to.
            var newObj = {}; //for mapping of post id to last reply (for pagination)
            allReplies.forEach(replies =>{
                replies.forEach(reply =>{
                    arr[i]["replies"].push({...reply.data(),id: reply.id});
                })
                var id = arr[i].id;
                newObj[id] = replies.length<commentBatchSize?-1:replies[replies.length-1];
                i++;
            })
            setLastReply({...lastReply,...newObj}); //combining lastReplys of all previous comments and theses new ones;
            setLastComment(res.length<commentBatchSize?-1:res[res.length-1]);
            console.log(arr);
            if(!isRefresh) setComments([...comments,...arr]);
            else setComments([...arr]); //don't keep previous comments if a refresh for a new post
        }catch(e){
            console.error(e);
        }
    }

    const getMoreReplies = async (commentId: string)=> {
        //First set all undefined to -1;
        if(lastReply[commentId]===undefined){
           var newObj = {...lastReply};
           newObj[commentId] = -1;
           setLastReply(newObj); 
        }
        try{
            console.log(lastReply[commentId]);
            if(!lastReply[commentId]) return;
            var res = (await pDatabase
                .collection("posts")
                .doc(props.id)
                .collection("comments")
                .where("replyTo","==",commentId)
                .orderBy("dateAdded","asc")
                .startAfter(lastReply[commentId])
                .limit(commentBatchSize)
                .get())
            //find index of the comment where the replies are to
            var index = findCommentIndex(commentId);
            console.log(index);
            if(index==-1) return;
            var arr = [...comments];
            //then update the replies in comments
            res.docs.forEach(reply =>{
                console.log(reply);
                arr[index]["replies"].push({...reply.data(),id: reply.id});
            })
            setComments(arr);
            //set lastReply for this comment thread
            var newObj = {...lastReply};
            newObj[commentId] = res.docs.length<commentBatchSize?-1:res.docs[res.docs.length-1];
            console.log(newObj[commentId],res.docs.length)
            
            setLastReply(newObj);
        }catch(e){
            console.error(e);
        }
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
            router.push("/");
        }catch(e){
            console.error(e);
            setSaving(false);
        }
    }

    const postComment = async (commentId: string | null) => {
        setIsPosting(true);
        try{
            var d = new Date();
            var res = await pDatabase.collection("posts").doc(props.id).collection("comments").add({
                dateAdded: d.getTime(),
                dateEdited: d.getTime(),
                text: commentText,
                username: commentUsername,
                userId: pAuth.currentUser?pAuth.currentUser.uid:"",
                replyTo: commentId
            })
            //Then get this added comment to show:
            var doc = await pDatabase.collection("posts").doc(props.id).collection("comments").doc(res.id).get();
            if(doc.data().replyTo==null){
                //Add the comment to 'comments'
                var arr = [...comments];
                arr.push({...doc.data(),id:doc.id,replies:[]});
                setComments(arr);

                //Then set lastReply to -1
                var newObj = {};
                newObj[doc.id] = -1;
                setLastReply(newObj)
            }else{
                //Add the comment to it's thread in "comments"
                var arr = [...comments];
                var index = findCommentIndex(commentId);
                arr[index]["replies"].push({...doc.data(),id: doc.id});
                setComments(arr);
            }
        }catch(e){
            console.error(e);
        }
        setIsPosting(false);
        setWriteReplyPopup(null);
        setCommentText("");
    }

    const deleteComment = async () =>{
        setDeleting(true);
        try{
            var res = await pDatabase.collection("posts").doc(props.id).collection("comments").doc(commentToDelete).delete();
            //Then delete it from state:
            //If it is a main comment:
            var arr = [...comments];
            var index = findCommentIndex(commentToDelete);
            if(index>-1){
                arr.splice(index,1);
            }else{
                arr = arr.map(c=>{
                    c.replies = c.replies.filter(reply => reply.id != commentToDelete)
                    return c;
                })
            }
            setComments(arr);
        }catch(e){
            console.error(e);
        }
        setDeleting(false)
        setCommentToDelete(null);
    }

    const findCommentIndex = (commentId:string):number =>{
        var index = -1;
            for(var i = 0;i<comments.length;i++) {
                if(comments[i].id==commentId) {
                    index=i;
                    break;
                }
            }
        return index;
    }

    useEffect(()=>{
        console.log(lastComment);
    },[lastComment])

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
                    <Link href="/posts"><a className="sb">Other Posts</a></Link>
                </li>
                {topics&&topics.length>0&&<li>
                    <Link href={`/topics/${topics[0]}`}><a className="sb">{topics[0]}</a></Link>
                </li>}
                <li>
                    <Link href="/about"><a className="sb">About</a></Link>
                </li>
            </ul>
        </div>
        <section id="isFeatured">
            {isEditor?<button className={isFeatured?"featured":"notFeatured"} onClick={()=>setIsFeatured(!isFeatured)}>{isFeatured?"Featured ":"Not Featured"}</button>:
            isFeatured&&<div className="featured">Featured</div>}
        </section>
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
                {topics&&topics.map(topic=><li>{topic}{isEditor&&<button onClick={()=>setTopics(topics.filter(t=>t!=topic))}>X</button>}</li>)}</ul>
        </section>
        {/* <section id="attachments">
            <h6>Attachments</h6>
        </section> */}
        <section id="comments">
            <h6>Comments</h6>
            {context.loggedIn?(writeReplyPopup==null&&<CommentInput 
                isReply={false}
                setUsername={setCommentUsername}
                username={commentUsername}
                setComment={setCommentText}
                comment={commentText}
                post={()=>postComment(null)} 
            />):<div className="login-to-comment">
                Log in to Comment
            </div>}
            <ul>{comments.sort((a,b)=>b.dateAdded-a.dateAdded).map(c=>{
                return <li>
                    <div className="comment-first-row">
                        <div className="comment-username">{c.username}</div>
                        <span className="comment-dateAdded">{getDateString(c.dateAdded)}</span>
                        {c.dateEdited!=c.dateAdded&&<span className="comment-dateEdited">(Edited {getDateString(c.dateEdited)})</span>}
                        {(isEditor||(context.loggedIn&&c.userId==pAuth.currentUser.uid))&&<button className="delete-comment" onClick={()=>setCommentToDelete(c.id)}>X</button>}
                    </div>
                    <div className="comment-text">{c.text}</div>  
                    <ul className="replies">
                        <div className="write-reply">
                            {context.loggedIn?<button onClick={()=>{
                                setWriteReplyPopup(writeReplyPopup==c.id?null:c.id);
                                setCommentText("");
                            }}>{writeReplyPopup==c.id?"Hide":"Write a Reply"}</button>:<div style={{height: "20px"}}></div>}
                        </div>
                        {writeReplyPopup==c.id&&<CommentInput 
                            isReply={true}
                            setUsername={setCommentUsername}
                            username={commentUsername}
                            setComment={setCommentText}
                            comment={commentText}
                            post={()=>postComment(c.id)} 
                        />}
                        {c.replies&&c.replies.sort((a,b)=>a.dateAdded-b.dateAdded).map(r=>{
                            return <li>
                                <div className="comment-first-row">
                                    <div className="comment-username">{r.username}</div>
                                    <span className="comment-dateAdded">{getDateString(r.dateAdded)}</span>
                                    {r.dateEdited!=r.dateAdded&&<span className="comment-dateEdited">(Edited {getDateString(r.dateEdited)})</span>}
                                    {(isEditor||(context.loggedIn&&r.userId==pAuth.currentUser.uid))&&<button className="delete-comment" onClick={()=>setCommentToDelete(r.id)}>X</button>}
                                </div>
                                <div className="comment-text">{r.text}</div>
                                
                            </li>})}
                        {lastReply[c.id]!=-1&&<button className="get-more-comments" onClick={()=>getMoreReplies(c.id)}>+ Get More Replies</button>}
                    </ul>
                </li>
            })}
            {lastComment!=-1&&<button className="get-more-comments" onClick={()=>getComments(false)}>+ Get More Comments</button>}
            {comments.length==0&&<div className="no-comments-text">No Comments Yet</div>}
            </ul>
            
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
        {isPosting&&<Popup><p>Posting...</p></Popup>}
        {commentToDelete&&<Popup>
            <div className="delete-comment-popup">
                <h6>Delete This Comment?</h6>
                <div><button className="rb" onClick={deleteComment}>Yes, Delete</button><button className="gb" onClick={()=>setCommentToDelete(null)}>Cancel</button></div>
                {deleting&&<div className="deleting">Deleting ... </div>}
            </div></Popup>}
    </div>
}