const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

const troops=[
['Barbarian',2],['Archer',2],['Giant',5],['Wizard',4],['Healer',14],['Baby Dragon',10],['P.E.K.K.A',25],['Minion',2],['Valkyrie',8],['Golem',30],['Witch',12],['Bowler',6],['Miner',5],['Hog Rider',5],['Ice Golem',15],['Electro Dragon',30],['Dragon Rider',25],['Root Rider',20],['Apprentice Warden',14],['Super Miner',24],['Super Wizard',10],['Druid',16],['Balloon',5],['Lava Hound',30]
];
const spells=[['Rage',2],['Heal',2],['Freeze',1],['Jump',2],['Poison',1],['Earthquake',1],['Haste',1],['Invisibility',1],['Recall',2],['Overgrowth',2]];
const presets=[
{name:'TH13 Hybrid',desc:'Simple and reliable ground plan',army:{Miner:16,'Hog Rider':18,Healer:5,Wizard:2},spells:{Heal:2,Rage:2,Freeze:1,Poison:1}},
{name:'Queen Charge Hybrid',desc:'High-value Queen entry + Hybrid',army:{Miner:14,'Hog Rider':16,Healer:5,Wizard:2},spells:{Heal:2,Rage:2,Freeze:1,Poison:1}},
{name:'LaLo',desc:'Air attack with a controlled wave',army:{'Lava Hound':2,Balloon:22,Healer:5,'Baby Dragon':1},spells:{Rage:2,Freeze:2,Haste:2,Poison:1}},
{name:'Root Rider Smash',desc:'Heavy ground push',army:{'Root Rider':8,Valkyrie:4,Healer:5,Wizard:2},spells:{Rage:2,Heal:2,Freeze:1,Poison:1}}
];

let mode='beginner', army={}, spellBag={}, capacity=260, selectedPreset=0, imageSrc='';

function used(){return Object.entries(army).reduce((s,[n,q])=>s+q*(troops.find(t=>t[0]===n)?.[1]||0),0)}
function style(){
 const n=Object.keys(army);
 if(n.includes('Lava Hound')||n.includes('Balloon'))return'air';
 if(n.includes('Miner')||n.includes('Hog Rider'))return'hybrid';
 if(n.includes('Root Rider')||n.includes('Golem')||n.includes('P.E.K.K.A'))return'ground';
 return'hero';
}
function setMode(m){
 mode=m;
 $('#beginnerBtn').classList.toggle('active',m==='beginner');
 $('#proBtn').classList.toggle('active',m==='pro');
 $$('.beginnerOnly').forEach(x=>x.classList.toggle('hidden',m!=='beginner'));
 $$('.proOnly').forEach(x=>x.classList.toggle('hidden',m!=='pro'));
 $('.beginnerText').classList.toggle('hidden',m!=='beginner');
 $('.proText').classList.toggle('hidden',m==='beginner');
}
$('#beginnerBtn').onclick=()=>setMode('beginner');
$('#proBtn').onclick=()=>setMode('pro');

function renderQuick(){
 $('#quickArmies').innerHTML=presets.map((p,i)=>`<button class="${i===selectedPreset?'selected':''}" onclick="pickQuick(${i})"><b>${p.name}</b><small>${p.desc}</small></button>`).join('');
 $('#quickUsed').textContent=Object.entries(presets[selectedPreset].army).reduce((s,[n,q])=>s+q*(troops.find(t=>t[0]===n)?.[1]||0),0);
 $('#quickCap').textContent=Number($('#capacityQuick').value||260);
}
window.pickQuick=i=>{selectedPreset=i;army={...presets[i].army};spellBag={...presets[i].spells};renderQuick();renderBuilder()};

function renderUnits(list,id,obj){
 const target=$(id); if(!target)return;
 target.innerHTML=list.map(([name,space])=>`<div class="unit"><button onclick="changeUnit('${name}',${space},'${obj}',1)">🪖 ${name}<br><small>${space} housing</small></button><div class="qty"><button onclick="changeUnit('${name}',${space},'${obj}',-1)">−</button><span>${(obj==='army'?army:spellBag)[name]||0}</span><button onclick="changeUnit('${name}',${space},'${obj}',1)">+</button></div></div>`).join('');
}
window.changeUnit=(name,space,obj,delta)=>{
 const o=obj==='army'?army:spellBag; const next=(o[name]||0)+delta;
 if(next<0)return;
 if(obj==='army'&&delta>0&&used()+space>capacity){alert('That would exceed your housing capacity.');return}
 if(next===0)delete o[name]; else o[name]=next;
 renderBuilder();
};
function renderBuilder(){
 renderUnits(troops,'#troops','army');renderUnits(spells,'#spells','spells');
 $('#used').textContent=used();$('#capText').textContent=capacity;
}
function renderPresets(){
 $('#presets').innerHTML=presets.map((p,i)=>`<button class="preset" onclick="pickQuick(${i})"><b>${p.name}</b><small>${p.desc}</small></button>`).join('');
}
window.pickPreset=pickQuick;

function showTab(id){
 $$('main>section').forEach(x=>x.classList.add('hidden'));$('#'+id).classList.remove('hidden');
 $$('nav button').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));
}
$$('nav button').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

$('#file').onchange=e=>{
 const f=e.target.files[0]; if(!f)return;
 const r=new FileReader(); r.onload=()=>{imageSrc=r.result;$('#preview').src=imageSrc;$('#preview').hidden=false;$('#visionStatus').textContent='Screenshot loaded. Ready for scan.'}; r.readAsDataURL(f);
};
$('#capacityQuick').onchange=e=>{capacity=Number(e.target.value)||260;renderQuick()};
$('#capacity').onchange=e=>{capacity=Number(e.target.value)||260;if(used()>capacity)alert('Your army is now over capacity. Remove troops until it fits.');renderBuilder()};

function plan(){
 const s=style();
 if(s==='air')return{
 entry:'Start from the side that gives the air army the cleanest path toward the highest-value defenses.',
 funnel:'Remove edge buildings so the main air wave does not split. Use your support unit where it creates the safest funnel.',
 main:'Send Hounds first to tank, then the Balloon wave in a controlled line. Freeze or Rage the biggest damage zones.',
 cleanup:'Keep a small cleanup reserve for corners and buildings the main wave skips.'
 };
 if(s==='hybrid')return{
 entry:'Enter where your heroes can remove the most value and still leave a straight path for the Hybrid.',
 funnel:'Create one lane. Do not feed the Hybrid into two separate compartments before the funnel is ready.',
 main:'Release Miners/Hogs behind the funnel and move Heal with the group through heavy defense clusters.',
 cleanup:'Save a few troops for outside buildings and the far corners.'
 };
 if(s==='ground')return{
 entry:'Choose the side with the best hero value and the shortest route into the core.',
 funnel:'Clear the outside buildings that would pull your main force sideways.',
 main:'Push the ground army through the opened lane. Use Rage/Freeze where several high-damage defenses overlap.',
 cleanup:'Hold fast/ranged units until the main push has cleared the core.'
 };
 return{
 entry:'Start where your heroes can remove the most important defenses safely.',
 funnel:'Clear enough of the perimeter to make the main army choose the intended lane.',
 main:'Deploy the main force only after the funnel is obvious, then protect the push with your best spell timing.',
 cleanup:'Keep a few units for the last buildings instead of spending everything early.'
 };
}

function renderResult(){
 if(!imageSrc){alert('Upload a base screenshot first.');return}
 if(used()===0){alert('Pick an army first.');return}
 const p=plan(), s=style();
 $('#result').classList.remove('hidden');
 $('#result').innerHTML=`
 <h2>🎯 Your Win Plan</h2>
 <p><b>Recommended style:</b> ${s.toUpperCase()} · <b>Army:</b> ${Object.entries(army).map(([n,q])=>q+'× '+n).join(', ')}</p>
 <div class="analysis"><span>🧠 Army-aware</span><span>📍 Deployment map</span><span>⏱️ Timing steps</span><span>🛟 Backup plan</span></div>
 <div class="map"><img src="${imageSrc}"><div class="marker m1">1</div><div class="marker m2">2</div><div class="marker m3">3</div><div class="marker m4">4</div></div>
 <div class="legend"><b>1</b> Entry · <b>2</b> Funnel · <b>3</b> Main attack · <b>4</b> Cleanup</div>
 <div class="plan"><span class="num">① ENTRY</span><br>${p.entry}</div>
 <div class="plan"><span class="num">② FUNNEL</span><br>${p.funnel}</div>
 <div class="plan"><span class="num">③ MAIN ATTACK</span><br>${p.main}</div>
 <div class="plan"><span class="num">④ CLEANUP</span><br>${p.cleanup}</div>
 <div class="plan"><span class="num">⚠️ IF THE ATTACK GOES OFF PLAN</span><br>If the main force walks the wrong way, stop saving spells for a perfect moment: stabilize the group first, then use the next spell on the largest immediate damage zone.</div>
 <p class="warning"><b>Vision note:</b> The browser build is vision-ready but does not claim fake building recognition. True automatic Town Hall/Inferno/X-Bow/Scattershot/Monolith/wall/trap detection needs a dedicated Clash screenshot vision model or connected vision service. The numbered points above are strategic defaults, not pixel-perfect defense detections.</p>`;
}
$('#analyze').onclick=renderResult;

$('#manualScan').onclick=()=>{
 if(!imageSrc){alert('Upload a screenshot first.');return}
 $('#visionStatus').textContent='Manual landmark mode: use the numbered strategy as the starting map, then adjust the entry point based on the visible defenses.';
 renderResult();
};
$('#saveArmy').onclick=()=>{localStorage.setItem('clashcoachArmy',JSON.stringify({army,spellBag,capacity}));alert('Army saved!')};

const saved=localStorage.getItem('clashcoachArmy');
if(saved)try{const x=JSON.parse(saved);army=x.army||{};spellBag=x.spellBag||{};capacity=x.capacity||260}catch{}
renderPresets();renderQuick();renderBuilder();setMode('beginner');
