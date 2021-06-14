import { useEffect, useState } from "react"
import ListScaffold from "../../components/ListScaffold"
import { pAuth, pDatabase,fbFieldValue } from "../../services/config";
import { getDateString } from "../../services/convert";
import Link from "next/link"
import Popup from "../../components/Popup";
import Loading from "../../components/Loading"


export default function Topics(){
    const [docs,setDocs] = useState([]);
    const [loading,setLoading] = useState(false);
    const majorTopics = [
        {   
            name: "Tech",
            title: "My Journey Through Tech",
            description: "My experience learning how to code and how to build things technology related, from my first line of code until now",
            imageURL: "/images/tech.jpg"
        },
        {
            name: 'Country Music',
            title: "Country Music",
            description: "Everything country music, including reviews and my experience with country music as a hobby",
            imageURL: "/images/countrymusic.jpg"
        },
        {
            name: 'Book Reviews',
            title: "Book Reviews",
            description: "Reviewing books that I've read",
            imageURL: "/images/bookreviews.jpg"
        },
        {
            name: "Food",
            title: "Food",
            description: "All about the food that I love",
            imageURL: "/images/food.jpg"
        },
        {
            name: "Education",
            title: "Education",
            description: "School and education topics",
            imageURL: "/images/education.jpg"
        }
    ]

    useEffect(()=>{
        getRecentDocs();
    },[])


    const [loggedIn,setLoggedIn] = useState(false);

    pAuth.onAuthStateChanged((user)=>{
        if(user) setLoggedIn(true);
        else setLoggedIn(false);
    })
    

    const getRecentDocs = async () =>{
        setDocs([]);
    }

    return <ListScaffold title="Topics">
        {loading&&<Popup><Loading/></Popup> }
        <ul id="topics-list">
            {majorTopics.map(topic=>{
                return <li key={topic.name} style={{backgroundImage: `url(${topic.imageURL})`, backgroundSize: "cover"}}>
                    <Link href={`/topics/${topic.name}`}>
                    <div  className="topic">
                        
                            <a >
                                <h3>{topic.title}</h3>
                                <p className="horiz-line"></p>
                                <p className="vert-line"></p>
                                <p className="description">{topic.description}</p>
                            </a>
                        
                    </div>
                    </Link>
                </li>
            })}
        </ul>
    </ListScaffold>
}
