import Link from "next/link"

export default function Post(props){
    return <div id="post">
        <h2 id="post-title">{props.title}</h2>
        <p id="post-subtitle">{props.subtitle}</p>
        <div id="first-row">
            <div>
                <p id="post-date">{props.dateWritten}</p>
                <p id="post-author">By {props.author}</p>
            </div>
            <ul>
                <li>
                    <Link href="/recent"><a className="sb">Other Posts</a></Link>
                </li>
                <li>
                    <Link href={`/topics/${props.topic}`}><a className="sb">{props.topic}</a></Link>
                </li>
                <li>
                    <Link href="/about"><a className="sb">About</a></Link>
                </li>
            </ul>
        </div>
    </div>
}