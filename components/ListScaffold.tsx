export default function ListScaffold(props){
    return <div id="listscaffold">
        <div id="heading">
            <h2>{props.title}</h2>
            <p></p>
        </div>
        <section id="list-main">
            {props.children}
        </section>
    </div>
}