// ===== Price / Quantity =====
const PRICE=2;
const DAILY_LIMIT=5;
const qtyInput=document.getElementById("quantity");
const totalText=document.getElementById("totalPrice");
const usernameInput=document.getElementById("username");

function updatePrice(){
  let qty=parseInt(qtyInput.value)||1;
  if(qty>DAILY_LIMIT) qty=DAILY_LIMIT;
  totalText.innerText="$"+(qty*PRICE);
}
qtyInput.addEventListener("input",updatePrice);
updatePrice();

// ===== Toy Drag & Spin =====
const toy=document.getElementById("toy");
let dragging=false;
let offsetX=0, offsetY=0;
let rotation=0;

toy.addEventListener("mousedown",(e)=>{
  dragging=true;
  offsetX=e.offsetX;
  offsetY=e.offsetY;
  toy.style.cursor="grabbing";
});
document.addEventListener("mouseup",()=>{
  dragging=false;
  toy.style.cursor="grab";
});
document.addEventListener("mousemove",(e)=>{
  if(!dragging) return;
  const rect=toy.parentElement.getBoundingClientRect();
  let x=e.clientX-rect.left-offsetX;
  let y=e.clientY-rect.top-offsetY;
  x=Math.max(0,Math.min(rect.width-80,x));
  y=Math.max(0,Math.min(rect.height-80,y));
  toy.style.left=x+"px";
  toy.style.top=y+"px";
});

// Spin toy on click
toy.addEventListener("click",(e)=>{
  if(dragging) return;
  rotation += 720;
  toy.style.transform=`rotate(${rotation}deg)`;
  const circles = toy.querySelectorAll(".circle");
  circles.forEach((c,i)=>{
    c.style.transition="transform 0.7s ease-out";
    c.style.transform=`rotate(${rotation*1.5 + i*120}deg)`;
    setTimeout(()=>{c.style.transition="";},700);
  });
});

// ===== Change Color =====
document.querySelectorAll(".colorBtn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const colors={colorRed:"red",colorBlue:"blue",colorGreen:"green"};
    toy.style.background=colors[btn.classList[1]];
  });
});

// ===== User system =====
document.getElementById("registerBtn").addEventListener("click",async ()=>{
  const user=document.getElementById("loginUser").value.trim();
  const pass=document.getElementById("loginPass").value.trim();
  if(!user||!pass)return alert("Fill both fields");
  const res=await fetch("/register",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`username=${user}&password=${pass}`});
  alert(await res.text());
});
document.getElementById("loginBtn").addEventListener("click",async ()=>{
  const user=document.getElementById("loginUser").value.trim();
  const pass=document.getElementById("loginPass").value.trim();
  const res=await fetch("/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`username=${user}&password=${pass}`});
  const text=await res.text();
  if(text.includes("Logged in")){alert(text);usernameInput.value=user}else alert(text);
});
document.getElementById("logoutBtn").addEventListener("click",async ()=>{
  await fetch("/logout");
  usernameInput.value="";
  alert("Logged out");
});

// ===== Place order =====
document.getElementById("orderBtn").addEventListener("click",async ()=>{
  const qty=parseInt(qtyInput.value)||1;
  if(!usernameInput.value) return alert("Login first");
  const res=await fetch("/buy",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`quantity=${qty}`});
  alert(await res.text());
  updatePrice();
});
