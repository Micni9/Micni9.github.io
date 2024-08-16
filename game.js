var container;
var ctx;

var x;
var y;
const radius=5;
var speed=2;
var dx=0;
var dy=0;
var Life=5;
const maxLife=8;
var invincible=false;
const invintime=1000;
var time=0;
var Diff=1;
const maxDiff=10;
const acc=0.2;

var right=false;
var left=false;
var up=false;
var down=false;

const ghostnum=4;
const ghostcolors=["#8B0000", "#008000", "#800080", "#808080"];
const ghostr=7;
const gacc=0.1;
var ghosthp=50;
const gcooldown=200;
const skilld=500;
var freeze=false;
const gskillspd=4;
const grevivetime=5000;

const starr=3;
var starnum=2;
const sscore=100;
var score=0;

const heartr=2;
var showheart=false;
const hscore=50;
const hregentime=8000;

const icel=6;
var showice=false;
const iscore=80;
const freezetime=1000;
const iregentime=13000;

const atttime=30;
const aspeed=5;
const attpow=10;

const speedup=0.15;
const gspeedup=0.2;
const ghpup=10;
var interval;
var difficulty;

class Ghost {
    constructor(){
        this.x=randX();
        this.y=randY();
        this.dx=0;
        this.dy=0;
        this.speed=Math.random()/2+1;
        this.cd=Math.floor(Math.random()*gcooldown);
        this.skill=false;
        this.type=Math.floor(Math.random()*4);
        this.hp=ghosthp;
        this.alive=true;
    }
    newghost(){
        this.x=randX();
        this.y=randY();
        this.dx=0;
        this.dy=0;
        this.speed=Math.random()/2+1;
        this.cd=0;
        this.skill=false;
        this.type=Math.floor(Math.random()*4);
        this.hp=ghosthp;
    }
    setspeed(sp){
        this.speed=sp;
    }
    dist2(){
        let distx=this.x-x;
        let disty=this.y-y;
        return distx*distx+disty*disty;
    }
    collide(){
        if(invincible)
        return false;
        let L=radius+ghostr;
        return this.dist2()<=L*L;
    }
    activate(){
        this.cd=0;
        this.skill=true;
        this.speed*=gskillspd;
        switch(this.type){
            case 0:
                this.dy=-1;
                break;
            case 1:
                this.dy=1;
                break;
            case 2:
                this.dx=-1;
                break;
            case 3:
                this.dx=1;
                break;
        }
    }
    refresh(){
        this.cd++;
        if(this.skill)
        return;
        if(this.x>x&&this.dx>-1)
        this.dx-=2*gacc;
        else if(this.x<x&&this.dx<1)
        this.dx+=2*gacc;
        if(this.y>y&&this.dy>-1)
        this.dy-=2*gacc;
        else if(this.y<y&&this.dy<1)
        this.dy+=2*gacc;
        if(dx>0&&this.dx<1)
        this.dx+=gacc;
        if(dx<0&&this.dx>-1)
        this.dx-=gacc;
        if(dy>0&&this.dx<1)
        this.dy+=gacc;
        if(dy<0&&this.dy>-1)
        this.dy-=gacc;
        let a=Math.abs(this.dx);
        let b=Math.abs(this.dy);
        if(a>1)
        this.dx/=a;
        if(b>1)
        this.dy/=b;
    }

}

class Star {
    constructor(r){
        this.x=Math.random()*(container.width-r-r)+r;
        this.y=Math.random()*(container.height-r-r)+r;
        this.r=r;
    }
    regen(){
        this.x=Math.random()*(container.width-this.r-this.r)+this.r;
        this.y=Math.random()*(container.height-this.r-this.r)+this.r;
    }
    collide(){
        let distx=this.x-x;
        let disty=this.y-y;
        let L=radius+starr;
        return distx*distx+disty*disty<=L*L;
    }
}

class Arrow {
    constructor(x,y,dx,dy){
        this.x=x;
        this.y=y;
        this.dx=dx;
        this.dy=dy;
    }
    collide(g) {
        let distx=this.x-g.x;
        let disty=this.y-g.y;
        return distx*distx+disty*disty<=ghostr*ghostr;
    }
    wall() {
        return !(this.x>0&&this.y>0&&this.x<container.width&&this.y<container.height);
    }
}

let aGhost=[];
let aStar=[];
let aArrow=[];
let heart;
let ice;

function invin(){
    invincible=true;
    setTimeout(function(){invincible=false;},invintime);
}

function randX() {
    return Math.floor(Math.random()*3)*container.width/3+container.width/6;
}

function randY(){
    return Math.floor(Math.random()*2)*container.height/2+container.height/4;
}

function randdir(){
    return Math.random()*2-1;
}

function DrawBall(){
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle="#FFFF00";
    ctx.fill();
    ctx.stroke();
}

function DrawGhost(){
    for (let i = 0; i < ghostnum; i++) {
        let g=aGhost[i];
        if(!g.alive)
        continue;
        ctx.beginPath();
        ctx.arc(g.x, g.y, ghostr, 0, 2 * Math.PI);
        ctx.closePath();
        if(freeze)
        ctx.fillStyle="#AFEEEE";
        else
        ctx.fillStyle=ghostcolors[g.type];
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(g.x-ghostr,g.y+ghostr+2);
        ctx.lineTo(g.x-ghostr+2*(g.hp/ghosthp)*ghostr,g.y+ghostr+2);
        ctx.strokeStyle="#FF0000";
        ctx.stroke();
        ctx.strokeStyle="#FFA533";
    }
}

function DrawStar(){
    for (let i = 0; i < starnum; i++) {
        let s=aStar[i];
        ctx.beginPath();
        ctx.moveTo(s.x,s.y-starr);
        ctx.lineTo(s.x-starr*2/3,s.y+starr);
        ctx.lineTo(s.x+starr,s.y-starr/3);
        ctx.lineTo(s.x-starr,s.y-starr/3);
        ctx.lineTo(s.x+starr*2/3,s.y+starr);
        ctx.lineTo(s.x,s.y-starr);
        ctx.closePath();
        ctx.fillStyle="#FFFF00";
        ctx.fill();
        ctx.stroke();
    }
}

function DrawHeart(){
    ctx.beginPath();
    ctx.moveTo(heart.x,heart.y+heartr);
    ctx.lineTo(heart.x+heartr,heart.y);
    ctx.arc(heart.x+heartr/2,heart.y,heartr/2,0,Math.PI,true);
    ctx.arc(heart.x-heartr/2,heart.y,heartr/2,0,Math.PI,true);
    ctx.lineTo(heart.x,heart.y+heartr);
    ctx.closePath();
    ctx.fillStyle="#FF0000";
    ctx.fill();
    ctx.stroke();
}

function DrawIce(){
    ctx.beginPath();
    ctx.rect(ice.x-icel/2,ice.y-icel/2,icel,icel);
    ctx.closePath();
    ctx.fillStyle="#AFEEEE";
    ctx.fill();
    ctx.stroke();
}

function DrawArrow(){
    for(let i=0;i<aArrow.length;i++){
        let a=aArrow[i];
        ctx.beginPath();
        ctx.moveTo(a.x-aspeed*a.dx, a.y-aspeed*a.dy);
        ctx.lineTo(a.x, a.y);
        ctx.stroke();
    }
}

function attack(){
    var min2=1000000;
    let target;
    for(let i=0;i<ghostnum;i++){
        let g=aGhost[i];
        if(!g.alive)
        continue;
        if(g.dist2()<min2){
            target=g;
            min2=g.dist2();
        }
    }
    if(min2<1000000)
    {
        let dx=target.x-x;
        let dy=target.y-y;
        let length=Math.sqrt(dx*dx+dy*dy);
        aArrow.push(new Arrow(x,y,dx/length,dy/length));
    }
}

$(function(){
    container=document.getElementById("game");
    ctx=container.getContext("2d");
    ctx.strokeStyle="#FFA533";
    ctx.lineWidth=0.5;
    x=container.width/2;
    y=container.height/2;

    for (let i = 0; i < ghostnum; i++) {
        aGhost.push(new Ghost());
        let g=aGhost[i];
    }

    for (let i = 0; i < starnum; i++) {
        aStar.push(new Star(starr));
    }

    heart=new Star(heartr);

    ice=new Star(icel/2);
});

function move(e){
    if (e.key=="Right"||e.key=="ArrowRight"){
        right=true;
    }
    else if(e.key=="Left"||e.key=="ArrowLeft"){
        left=true;
    }
    if(e.key=="Up"||e.key=="ArrowUp"){
        up=true;
    }
    else if(e.key=="Down"||e.key=="ArrowDown"){
        down=true;
    }
    if(e.key=="r")
    {
        document.location.reload();
        clearInterval(interval);
        clearInterval(difficulty);
    }
}

function stand(e){
    if (e.key=="Right"||e.key=="ArrowRight"){
        right=false;
    }
    else if(e.key=="Left"||e.key=="ArrowLeft"){
        left=false;
    }
    if(e.key=="Up"||e.key=="ArrowUp"){
        up=false;
    }
    else if(e.key=="Down"||e.key=="ArrowDown"){
        down=false;
    }
}

function refreshLife(){
    $("#life").text("Life: ");
    for (let i = 0; i < Life; i++) {
        $("#life").append("❤");
    }
}

function accelerate(){
    if (right&&dx<1)
    dx+=acc;
    if (left&&dx>-1)
    dx-=acc;
    if (down&&dy<1)
    dy+=acc;
    if (up&&dy>-1)
    dy-=acc;
    if(!(right||left))
    dx*=0.8;
    if(!(up||down))
    dy*=0.8;
}

function wall(){
    if(x>container.width-radius)
    x=container.width-radius;
    if(x<radius)
    x=radius;
    if(y>container.height-radius)
    y=container.height-radius;
    if(y<radius)
    y=radius;
}

function atkghost(){
    for(let i=0;i<aArrow.length;i++){
        let a=aArrow[i];
        a.x=a.x+a.dx*aspeed;
        a.y=a.y+a.dy*aspeed;
        if(a.wall())
        {
            aArrow.splice(i,1);
            continue;
        }
        for(let j=0;j<ghostnum;j++){
            let g=aGhost[j];
            if(a.collide(g))
            {
                aArrow.splice(i,1);
                g.hp-=attpow;
                if(g.hp<=0){
                    g.alive=false;
                    g.newghost();
                    setTimeout(function(){
                        g.alive=true;
                    },grevivetime);
                }
                break;
            }
        }
    }
}

function ghostmove(){
    for (let i = 0; i < ghostnum; i++) {
        let g=aGhost[i];
        if(!g.alive)
        continue;
        if(g.collide()){
            Life--;
            refreshLife();
            if(Life==0){
                clearInterval(interval);
                clearInterval(difficulty);
                $("#end > .message").html(`GAME OVER!<br>Your Score is ${score}`);
                $("#end").show();
                return;
            }
            if(!g.skill)
            {
                g.dx=0-g.dx;
                g.dy=0-g.dy;
            }
            invin();
        }
        else if(!freeze){
            g.x+=g.dx*g.speed;
            g.y+=g.dy*g.speed;
            if(g.x>container.width-ghostr)
            g.x=container.width-ghostr;
            if(g.x<ghostr)
            g.x=ghostr;
            if(g.y>container.height-ghostr)
            g.y=container.height-ghostr;
            if(g.y<ghostr)
            g.y=ghostr;
            if(!g.skill)
            g.refresh();
            if(g.cd>=gcooldown)
            {
                g.activate();
                setTimeout(function(){
                    g.speed/=gskillspd;
                    g.skill=false;
                },skilld);
            }
        }
    }
}

function getstar(){
    for (let i = 0; i < starnum; i++) {
        let s=aStar[i];
        if(s.collide()){
            score+=sscore*Diff; 
            $("#score").text(`Score: ${score}`);
            s.regen();
        }
    }
}

function getheart(){
    if(showheart&&heart.collide()){
        score+=hscore*Diff;
        if(Life<maxLife){
            Life++;
            refreshLife();
        }
        $("#score").text(`Score: ${score}`);
        showheart=false;
        if(Diff<maxDiff){
            heart.regen();
            setTimeout(function(){
                showheart=true;
            },hregentime);
        }
    }
}

function getice(){
    if(showice&&ice.collide()){
        score+=iscore*Diff;
        $("#score").text(`Score: ${score}`);
        freeze=true;
        setTimeout(function(){
            freeze=false;
        },freezetime);
        showice=false;
        ice.regen();
        setTimeout(function(){
            showice=true;
        },iregentime);
    }
}

function draw(){
    ctx.clearRect(0,0,container.width,container.height);
    DrawBall();
    DrawGhost();
    DrawStar();
    if(showheart)
    DrawHeart();
    if(showice)
    DrawIce();
    DrawArrow();
    atkghost();
    ghostmove();
    getstar();
    getheart();
    getice();
    accelerate();
    x+=dx*speed;
    y+=dy*speed;
    if(time>atttime)
    {
        attack();
        time-=atttime;
    }
    wall();
    time++;
}

function LevelUp(){
    speed+=speedup;
    ghosthp+=10;
    for (let i = 0; i < ghostnum; i++) {
        aGhost[i].speed+=gspeedup;
        aGhost[i].hp+=ghpup;
    }
    starnum++;
    aStar.push(new Star(starr));
    Diff++;
    $("#level").text(`Level: ${Diff}`);
    if(Diff==maxDiff)
    clearInterval(difficulty);
}

function Start(){
    let b=document.getElementById("start");
    b.remove();
    refreshLife();
    $("#level").text(`Level: ${Diff}`);
    $("#score").text(`Score: ${score}`);
    interval=setInterval(draw,50);
    difficulty=setInterval(LevelUp,20000);
    document.addEventListener("keydown", move, false);
    document.addEventListener("keyup", stand, false);
    invin();
    setTimeout(function(){
        showheart=true;
    },8000);
    setTimeout(function(){
        showice=true;
    },13000);
}