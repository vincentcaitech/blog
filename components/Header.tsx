import Link from "next/link"

export default function Header(){
    return <header>
        <h1><Link href="/"><a>VC BLOG</a></Link></h1>
        <ul id="menu">
            <li>
                <Link href="/recent"><a>Recent</a></Link>
            </li>
            <li>
                <Link href="/featured"><a>Featured</a></Link>
            </li>
            <li>
                <Link href="/topics"><a>Topics</a></Link>
            </li>
            <li>
                <Link href="/about"><a>About</a></Link>
            </li>
        </ul>
    </header>
}