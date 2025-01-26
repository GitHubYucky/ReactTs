import { useEffect,useState } from 'react'
import localforage from 'localforage'
import { isTodos } from './lib/isTodos'

// type Todo = {
//   value:string
//   readonly id:number
//   checked:boolean
//   removed:boolean
// }

// type Filter='all'|'checked'|'unchecked'|'removed'

export const App = () => {
  const [text,setText] = useState('')
  const [todos,setTodos] = useState<Todo[]>([])
  const [filter,setFilter]=useState<Filter>('all')

  const handleSubmit=()=>{
    if(!text) return;
    const newTodo:Todo={
      value:text,
      id:new Date().getTime(),
      checked:false,
      removed:false,
    }
    setTodos([...todos,newTodo])
    setText('')
  }


  const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    setText(e.target.value)
  }


  const handleFilter=(filter:Filter)=>{
    setFilter(filter)
  }

  const filteredTodos=todos.filter((todo)=>{
    switch(filter){
      case 'all':
        return !todo.removed
      case 'checked':
        return todo.checked
      case 'unchecked':
        return !todo.checked && !todo.removed
      case 'removed':
        return todo.removed
      default:
        return todo
    }
  })

  const handleEmpty=()=>{
    setTodos((todos)=>todos.filter((todo)=>!todo.removed))
  }

  const handleTodo=<K extends keyof Todo,V extends Todo[K]>
  (id:number,key:K,value:V)=>{
    setTodos((todos)=>{
      const newTodos=todos.map((todo)=>{
        if(todo.id===id){
          return {...todo,[key]:value}
        }
        return todo
      })
      return newTodos
    })
  }

  useEffect(()=>{
    localforage
    .getItem('todo-20200101')
    .then((values)=>isTodos(values) && setTodos(values as Todo[]))

  },[])

  useEffect(()=>{
    localforage
    .setItem('todo-20200101',todos)
  },[todos])

  return (
    <div>
      <select defaultValue="all" onChange={(e)=>handleFilter(e.target.value as Filter)}>
        <option value="all">全てのタスク</option>
        <option value="checked">完了したタスク</option>
        <option value="unchecked">現在のタスク</option>
        <option value="removed">ゴミ箱</option>
      </select>
      {filter==='removed'?
      (
        <button onClick={handleEmpty}>全て削除</button>
      ):(
        filter!=='checked' &&
        (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}>
            <input type="text" value={text} onChange={(e) => handleChange(e)}/>
            <input type="submit" value="追加" onSubmit={handleSubmit}/>
          </form>
        )
      )
    }
      <ul>
        {filteredTodos.map((todo)=>{
          return <li key={todo.id}>
            <input type="checkbox" checked={todo.checked} onChange={()=>handleTodo(todo.id,'checked',!todo.checked)} disabled={todo.removed}/>
            <input type="text" value={todo.value} onChange={(e)=>handleTodo(todo.id,'value',e.target.value)} disabled={todo.checked||todo.removed}/>
            <button onClick={()=>handleTodo(todo.id,'removed',!todo.removed)}>{todo.removed?"戻す":"削除"}</button>
          </li>
        })}
      </ul>

      <p>{text}</p>
    </div>
  );
}
