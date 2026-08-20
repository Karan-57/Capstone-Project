import { useState ,useEffect} from 'react'
import './App.css'
import { getData } from './api.service';

function App() {
  const [data, setdata] = useState("")
 useEffect(()=>{
  const gettingData = async ()=>{
    const temp = await getData();
    setdata(temp);
  } 
  gettingData();
 });

  return (
    <main>
      <h1>
        {data}
      </h1>
    </main>
  )
}

export default App
