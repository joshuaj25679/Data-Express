
let fetchData = async () =>{
    const response = await fetch('http://localhost:3000/api');
    const data = await response.json();
    console.log(data);
}

fetchData();
const q1canvas = document.getElementById('q1Canvas');
const q1ctx = q1canvas.getContext('2d');
q1canvas.width = 200;
q1canvas.height = 500;

const q2canvas = document.getElementById('q2Canvas');
const q2ctx = q2canvas.getContext('2d');
q2canvas.width = 300;
q2canvas.height = 500;

const q3canvas = document.getElementById('q3Canvas');
const q3ctx = q3canvas.getContext('2d');
q3canvas.width = 300;
q3canvas.height = 500;

const drawQ1Res = (a1Size, a2Size) => {

    q1ctx.fillStyle = '#FF00FF';
    q1ctx.font = '20px Arial';
    q1ctx.fillText('Calzone', 0, 20);
    q1ctx.fillStyle = 'blue';
    q1ctx.font = '20px Arial';
    q1ctx.fillText('Ravioli', 0, 40);

    q1ctx.fillStyle = '#FF00FF';
    q1ctx.fillRect(50, 500, 40, -(a1Size*25));

    q1ctx.fillStyle = 'blue';
    q1ctx.fillRect(100, 500, 40, -(a2Size*25));

}

const drawQ2Res = (a1Size, a2Size, a3Size, a4Size) => {
    q2ctx.fillStyle = '#FF00FF';
    q2ctx.fillRect(50, 500, 40, -(a1Size*25));

    q2ctx.fillStyle = 'blue';
    q2ctx.fillRect(100, 500, 40, -(a2Size*25));

    q2ctx.fillStyle = '#FF00FF';
    q2ctx.fillRect(150, 500, 40, -(a3Size*25));

    q2ctx.fillStyle = 'blue';
    q2ctx.fillRect(200, 500, 40, -(a4Size*25));
}

const labelDraw = () => {
    q1ctx.fillStyle = '#000';
    q1ctx.font = '12px Arial';
    for(let i = 1; i<=20; i+=1){
        q1ctx.fillText(i, 180, (500-((i-1)*25))-15);
    };
    q2ctx.fillStyle = '#000';
    q2ctx.font = '12px Arial';
    for(let i = 1; i<=20; i+=1){
        q2ctx.fillText(i, 280, (500-((i-1)*25))-15);
    };
    q3ctx.fillStyle = '#000';
    q3ctx.font = '12px Arial';
    for(let i = 1; i<=20; i+=1){
        q3ctx.fillText(i, 280, (500-((i-1)*25))-15);
    };
}


drawQ1Res(1,4);
drawQ2Res(2,5,3,8);

labelDraw();
