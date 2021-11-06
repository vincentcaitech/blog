export default function CommentInput(props){
    return <div className="add-comment-section">
        {/* <h6>Add A {props.isReply?"Reply":"Comment"}</h6> */}
        <input className="username-input" placeholder="Username" onChange={e=>props.setUsername(e.target.value)} value={props.username}></input>
        <textarea className="comment-text-input" placeholder="Type a comment..." onChange={e=>props.setComment(e.target.value)} value={props.comment}></textarea>
        {props.comment.length>0&&props.username.length>0&&<button className="post-comment" onClick={props.post}>Post</button>}
    </div>
}