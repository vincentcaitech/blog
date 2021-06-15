import Link from "next/link";
import { getDateString } from "../services/convert";

export default function PostPreview({post}){
    return <Link href={`/posts/${post.id}`}><a id="single-post">
    <div className="post-image" style={{backgroundImage: `url(${post.imageURL})`}}></div>
    <div className="post-info">
        <h3>{post.title}</h3>
        <p className="subtitle">{post.subtitle}</p>
        <p className="author">By {post.author}</p>
        {post.isFeatured&&<p className="featured">Featured</p>}
        <p className="date">{getDateString(post.dateWritten)}</p>
    </div>
</a>
</Link>
}