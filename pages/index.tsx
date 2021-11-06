import Link from "next/link";
import { useEffect, useState } from "react";
import { pDatabase } from "../services/config";
import { getDateString } from "../services/convert";
import Posts from "./posts/index";

export default function Home() {
  const numPosts = 9; // 3 x 3 grid
  const [focused, setFocused] = useState<number | null>(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts();
  });

  const getPosts = async () => {
    try {
      var arr = (
        await pDatabase
          .collection("posts")
          .where("isPrivate", "==", false)
          .orderBy("dateWritten", "desc")
          .limit(numPosts)
          .get()
      ).docs;
      setPosts(
        arr.map((a) => {
          return { ...a.data(), id: a.id };
        })
      );
    } catch (e) {
      console.error(e);
    }
  };

  const renderGrid = () => {
    var arr = [];
    for (let i: number = 0; i < posts.length; i++) {
      let p = posts[i];
      arr.push(
        <li
          onClick={() => setFocused(i)}
          className={`collage-item${focused == i ? " focused" : ""}`}
          style={{
            backgroundImage: `url(${p.imageURL})`,
          }}
        >
          {focused==i&&<div className="dateWritten">{getDateString(p.dateWritten)}</div>}
        </li>
      );
    }
    return arr;
  };

  return (
    <div className="homepage">
      <div id="top-homepage">
        <h6>Recent Posts</h6>
        {/* <p>(Click each image to learn more)</p> */}
      </div>
      <div className="homepage-divider">
        <div className="collage">
          <ul id="collage-list">{renderGrid()}</ul>
        </div>
        <div className="right">
          <h2>
            {focused !== null ? posts[focused].title : "Vincent Cai's Blog"}
          </h2>
          <p>
            {focused !== null ? posts[focused].subtitle : "Welcome to my blog!"}
          </p>
          {focused !== null && (
            <Link href={`/posts/${posts[focused].id}`}>
              <a className="link-to-post">Read This Post</a>
            </Link>
          )}
        </div>
      </div>

      
    </div>
  );
}


// (
//   <div id="click-arrow">
//     <span
//       style={{ backgroundImage: "url(/images/leftarrow.png)" }}
//     ></span>
//     Click on a Post to View
//   </div>
// )