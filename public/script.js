
let fetchData = async () =>{
    const response = await fetch('http://localhost:3000/api');
    const data = await response.json();
    console.log(data);
}

fetchData();