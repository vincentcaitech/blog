export default function EditInput(props){
    return <input type={props.type||"text"} placeholder={props.placeholder} className="si" onChange={(e)=>props.set(e.target.value)} value={props.val}></input>
}