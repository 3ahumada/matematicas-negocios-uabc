const $ = (id) => document.getElementById(id);
const round = (n, d=2) => Number(n.toFixed(d));
const money = n => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:2}).format(n);
const rand = (min,max,step=1) => Math.round((min + Math.random()*(max-min))/step)*step;

const UNITS = [
  {
    id:1,title:'Funciones lineales',
    subtitle:'Costos, ingresos, utilidad, oferta, demanda y punto de equilibrio.',
    topics:['Recta','Sistemas 2×2','Costos','Ingresos','Oferta y demanda','Punto de equilibrio'],
    generators:[linearSlope,linearSystem,linearCost,linearProfit,supplyDemand,breakEven]
  },
  {
    id:2,title:'Funciones cuadráticas',
    subtitle:'Raíces, factorización, vértice, dominio, rango y aplicaciones empresariales.',
    topics:['Fórmula general','Factorización','Vértice','Gráfica','Utilidad','Punto de equilibrio'],
    generators:[quadraticRoots,quadraticFactor,quadraticVertex,quadraticRange,quadraticProfit,quadraticBreakEven]
  },
  {
    id:3,title:'Funciones exponenciales y logarítmicas',
    subtitle:'Crecimiento, interés compuesto y tiempo para alcanzar metas.',
    topics:['Exponenciales','Logaritmos','Crecimiento','Interés compuesto','Proyecciones','Tiempo'],
    generators:[expEvaluate,expGrowth,compoundInterest,compoundTime,businessGrowth,logSolve]
  },
  {
    id:4,title:'Matrices y sistemas lineales',
    subtitle:'Operaciones, reducción de renglones, determinantes y aplicaciones de insumo-producto.',
    topics:['Suma','Multiplicación','Sistemas','Determinantes','Matriz inversa','Insumo-producto'],
    generators:[matrixAdd,matrixMultiply,twoByTwoSystem,determinant2,inverse2,inputOutput]
  }
];

let state = {
  student:null, unit:null, mode:'practice', session:[], index:0, correct:0, checked:false,
  history:JSON.parse(localStorage.getItem('math38976_history')||'[]')
};
let chart = null;

function getStudentProgress(){
  const s = state.student;
  return state.history.filter(r => s && r.studentId===s.id);
}
function saveHistory(){
  localStorage.setItem('math38976_history',JSON.stringify(state.history));
}
function loadStudent(){
  const saved=JSON.parse(localStorage.getItem('math38976_student')||'null');
  if(saved){state.student=saved; $('studentName').value=saved.name;$('studentId').value=saved.id;$('studentGroup').value=saved.group;}
}
function switchView(id){
  ['loginView','dashboardView','practiceView','teacherView'].forEach(v=>$(v).classList.add('hidden'));
  $(id).classList.remove('hidden');
  $('logoutBtn').classList.toggle('hidden', !(id==='dashboardView' || id==='practiceView'));
}
function startStudent(){
  const name=$('studentName').value.trim(), id=$('studentId').value.trim(), group=$('studentGroup').value.trim();
  if(!name||!id||!group){alert('Completa nombre, matrícula y grupo.');return;}
  state.student={name,id,group};
  localStorage.setItem('math38976_student',JSON.stringify(state.student));
  renderDashboard();
}
function renderDashboard(){
  switchView('dashboardView');
  $('welcomeTitle').textContent='Hola, '+state.student.name.split(' ')[0];
  $('studentMeta').textContent=`Matrícula ${state.student.id} · Grupo ${state.student.group}`;
  const rows=getStudentProgress();
  const total=rows.reduce((a,r)=>a+r.total,0), hits=rows.reduce((a,r)=>a+r.correct,0);
  const avg=rows.length?Math.round(rows.reduce((a,r)=>a+r.score,0)/rows.length):null;
  $('overallScore').textContent=avg===null?'—':avg;
  $('doneCount').textContent=rows.length;
  $('accuracy').textContent=total?Math.round(hits/total*100)+'%':'0%';
  $('attemptCount').textContent=rows.length;
  const unitAverages=UNITS.map(u=>{
    const rr=rows.filter(r=>r.unit===u.id);
    return rr.length?Math.round(rr.reduce((a,r)=>a+r.score,0)/rr.length):0;
  });
  $('masteredCount').textContent=unitAverages.filter(v=>v>=80).length;
  $('unitGrid').innerHTML=UNITS.map((u,i)=>`
    <article class="unit-card">
      <div class="unit-top">
        <div><div class="eyebrow">UNIDAD ${roman(u.id)}</div><h3>${u.title}</h3></div>
        <div class="unit-number">${u.id}</div>
      </div>
      <p>${u.subtitle}</p>
      <div class="topic-tags">${u.topics.map(t=>'<span>'+t+'</span>').join('')}</div>
      <div>
        <div class="micro">Dominio actual: ${unitAverages[i]}%</div>
        <div class="unit-progress"><div style="width:${unitAverages[i]}%"></div></div>
      </div>
      <button class="primary-btn" onclick="startUnit(${u.id})">Practicar unidad</button>
    </article>`).join('');
  renderChart(unitAverages);
}
function renderChart(values){
  const ctx=$('progressChart');
  if(chart) chart.destroy();
  chart=new Chart(ctx,{type:'bar',data:{labels:['Unidad I','Unidad II','Unidad III','Unidad IV'],datasets:[{label:'Promedio',data:values,borderWidth:1}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,max:100}},plugins:{legend:{display:false}}}});
}
function startUnit(id){
  state.unit=UNITS.find(u=>u.id===id); state.index=0;state.correct=0;state.checked=false;
  buildSession();
  switchView('practiceView');
  $('unitEyebrow').textContent='UNIDAD '+roman(id);
  $('practiceTitle').textContent=state.unit.title;
  $('practiceSubtitle').textContent=state.unit.subtitle;
  renderExercise();
}
function buildSession(){
  const gens=[...state.unit.generators].sort(()=>Math.random()-.5);
  state.session=gens.slice(0,5).map(g=>g());
}
function renderExercise(){
  const ex=state.session[state.index];state.checked=false;
  $('topicBadge').textContent=ex.topic;$('difficultyBadge').textContent=ex.level;
  $('exercisePrompt').textContent=ex.prompt;$('exerciseContext').innerHTML=ex.context;
  $('exerciseInputs').innerHTML=ex.fields.map((f,i)=>`
    <div class="answer-row"><label for="ans${i}">${f.label}</label><input id="ans${i}" type="number" step="any" placeholder="${f.placeholder||'Escribe tu respuesta'}"></div>`).join('');
  $('feedbackBox').className='feedback hidden';$('feedbackBox').innerHTML='';
  $('hintBox').className='hint hidden';$('hintBox').innerHTML=ex.hint;
  $('nextBtn').classList.add('hidden');$('checkBtn').classList.remove('hidden');
  $('exerciseCounter').textContent=`Ejercicio ${state.index+1} de ${state.session.length}`;
  $('sessionProgress').style.width=`${state.index/state.session.length*100}%`;
  updateSessionScore();
}
function checkExercise(){
  if(state.checked)return;
  const ex=state.session[state.index];
  const vals=ex.fields.map((f,i)=>parseFloat($('ans'+i).value));
  if(vals.some(Number.isNaN)){alert('Responde todos los campos antes de revisar.');return;}
  const ok=vals.every((v,i)=>Math.abs(v-ex.answers[i]) <= (ex.tolerance||0.02));
  state.checked=true; if(ok)state.correct++;
  if(state.mode==='exam'){
    $('feedbackBox').className='feedback ok';$('feedbackBox').textContent='Respuesta registrada. La retroalimentación se mostrará al finalizar.';
  }else{
    $('feedbackBox').className='feedback '+(ok?'ok':'bad');
    $('feedbackBox').innerHTML=ok?'<strong>Correcto.</strong> '+ex.explanation:'<strong>Revisa el procedimiento.</strong> '+ex.explanation+'<br><small>Resultado esperado: '+ex.answers.join(' · ')+'</small>';
  }
  $('checkBtn').classList.add('hidden');$('nextBtn').classList.remove('hidden');updateSessionScore();
}
function nextExercise(){
  if(!state.checked)return;
  if(state.index<state.session.length-1){state.index++;renderExercise();}else finishSession();
}
async function finishSession(){
  const total=state.index + (state.checked?1:0);
  if(total===0){renderDashboard();return;}
  const correct=state.correct, score=Math.round(correct/total*100);
  const record={timestamp:new Date().toISOString(),studentId:state.student.id,studentName:state.student.name,group:state.student.group,unit:state.unit.id,unitTitle:state.unit.title,topic:'Sesión mixta',mode:state.mode,correct,total,score};
  state.history.push(record);saveHistory();await sendRemote(record);
  alert(`Sesión terminada. Calificación: ${score}/100 (${correct} de ${total} correctos).`);
  renderDashboard();
}
function updateSessionScore(){$('sessionScore').textContent=`${state.correct}/${state.index+(state.checked?1:0)}`;}
function setMode(mode){
  state.mode=mode;document.querySelectorAll('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  if(state.unit){state.index=0;state.correct=0;buildSession();renderExercise();}
}
const TEACHER_HASH='21179c412fe576b78850dccde08993380422b24c0ebf5d03e7b6eed558122f3f';
async function hashText(text){const data=new TextEncoder().encode(text);const hash=await crypto.subtle.digest('SHA-256',data);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');}
function openTeacherLogin(){
  if(sessionStorage.getItem('math38976_teacher_auth')==='1'){showTeacher();return;}
  $('teacherPin').value='';$('teacherPinError').classList.add('hidden');$('teacherLoginModal').classList.remove('hidden');setTimeout(()=>$('teacherPin').focus(),50);
}
async function confirmTeacherLogin(){
  const ok=(await hashText($('teacherPin').value))===TEACHER_HASH;
  if(!ok){$('teacherPinError').classList.remove('hidden');return;}
  sessionStorage.setItem('math38976_teacher_auth','1');$('teacherLoginModal').classList.add('hidden');showTeacher();
}
function showTeacher(){
  if(sessionStorage.getItem('math38976_teacher_auth')!=='1'){openTeacherLogin();return;}
  switchView('teacherView'); renderResultsTable();
  $('endpointInput').value=localStorage.getItem('math38976_endpoint')||'';
}
function logoutStudent(){
  if(!state.student){switchView('loginView');return;}
  if(state.unit && !$('practiceView').classList.contains('hidden') && !confirm('¿Salir de la sesión? El ejercicio actual no se guardará.')) return;
  state.student=null;state.unit=null;state.session=[];state.index=0;state.correct=0;state.checked=false;
  localStorage.removeItem('math38976_student');
  $('studentName').value='';$('studentId').value='';$('studentGroup').value='';
  switchView('loginView');
}
function renderResultsTable(){
  const rows=[...state.history].reverse();
  $('resultsBody').innerHTML=rows.length?rows.map(r=>`<tr><td>${new Date(r.timestamp).toLocaleString('es-MX')}</td><td>${r.studentId}</td><td>${r.studentName}</td><td>${r.group}</td><td>${r.unit}</td><td>${r.topic}</td><td>${labelMode(r.mode)}</td><td>${r.correct}</td><td>${r.total}</td><td><strong>${r.score}</strong></td></tr>`).join(''):'<tr><td colspan="10">Todavía no hay resultados guardados.</td></tr>';
}
function exportCSV(){
  const headers=['Fecha','Matricula','Alumno','Grupo','Unidad','Tema','Modo','Aciertos','Total','Calificacion'];
  const lines=[headers.join(',')].concat(state.history.map(r=>[r.timestamp,r.studentId,r.studentName,r.group,r.unit,r.topic,labelMode(r.mode),r.correct,r.total,r.score].map(csvCell).join(',')));
  const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='control-notas-matematicas-38976.csv';a.click();URL.revokeObjectURL(a.href);
}
function csvCell(v){const s=String(v??'');return '"'+s.replaceAll('"','""')+'"';}
function clearData(){if(confirm('¿Borrar todos los resultados guardados en este navegador?')){state.history=[];saveHistory();renderResultsTable();}}
function saveEndpoint(){localStorage.setItem('math38976_endpoint',$('endpointInput').value.trim());alert('URL guardada.');}
async function sendRemote(record){
  const url=localStorage.getItem('math38976_endpoint');if(!url)return;
  try{await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(record)});}catch(e){console.warn('No fue posible enviar el registro remoto',e);}
}
function labelMode(m){return m==='graded'?'Actividad':m==='exam'?'Examen':'Práctica';}
function roman(n){return ['','I','II','III','IV'][n];}
function ex(topic,level,prompt,context,fields,answers,hint,explanation,tolerance=.02){return{topic,level,prompt,context,fields,answers,hint,explanation,tolerance};}

// UNIDAD I
function linearSlope(){
  const x1=rand(1,5), y1=rand(20,50,5), m=rand(3,9), x2=x1+rand(2,5), y2=y1+m*(x2-x1), b=y1-m*x1;
  return ex('Ecuación de la recta','Comprendo','Determina la pendiente y la ordenada al origen.',`Una relación lineal pasa por los puntos (${x1}, ${y1}) y (${x2}, ${y2}).`,[{label:'Pendiente m'},{label:'Ordenada b'}],[m,b],'Usa m=(y₂-y₁)/(x₂-x₁) y después y=mx+b.',`La recta es y=${m}x+${b}.`);
}
function linearSystem(){
  const x=rand(3,12),y=rand(2,10),a=rand(2,5),b=rand(1,4),c=rand(1,4),d=rand(2,5),e=a*x+b*y,f=c*x+d*y;
  return ex('Sistema 2×2','Resuelvo','Resuelve el sistema de ecuaciones.',`${a}x + ${b}y = ${e}<br>${c}x + ${d}y = ${f}`,[{label:'Valor de x'},{label:'Valor de y'}],[x,y],'Elimina una variable multiplicando una o ambas ecuaciones.',`La solución que satisface ambas ecuaciones es x=${x}, y=${y}.`);
}
function linearCost(){
  const fixed=rand(12000,40000,1000),cv=rand(40,180,5),q=rand(100,500,10),cost=fixed+cv*q;
  return ex('Costo lineal','Aplico','Calcula el costo total.',`Una empresa tiene costos fijos mensuales de ${money(fixed)} y un costo variable de ${money(cv)} por unidad. Si produce ${q} unidades, usa C(x)=CF+CV·x.`,[{label:'Costo total ($)'}],[cost],'Sustituye x por la cantidad producida.',`C(${q})=${fixed}+${cv}(${q})=${money(cost)}.`,.5);
}
function linearProfit(){
  const p=rand(220,500,10),cv=rand(80,p-60,10),fixed=rand(15000,50000,1000),q=rand(150,450,10),profit=p*q-(fixed+cv*q);
  return ex('Utilidad','Aplico','Calcula la utilidad.',`Un producto se vende en ${money(p)}, su costo variable es ${money(cv)} y sus costos fijos son ${money(fixed)}. ¿Cuál es la utilidad al vender ${q} unidades?`,[{label:'Utilidad ($)'}],[profit],'Utilidad = Ingreso - Costo total.',`U=${p}(${q})-[${fixed}+${cv}(${q})]=${money(profit)}.`,.5);
}
function supplyDemand(){
  const qe=rand(80,180,10),pe=rand(180,400,10),md=-rand(1,3),ms=rand(1,3),bd=pe-md*qe,bs=pe-ms*qe;
  return ex('Oferta y demanda','Aplico','Encuentra el equilibrio de mercado.',`Demanda: P=${md}Q+${bd}<br>Oferta: P=${ms}Q+${bs}`,[{label:'Cantidad de equilibrio Q'},{label:'Precio de equilibrio P'}],[qe,pe],'Iguala las dos ecuaciones de precio.',`Al igualar oferta y demanda se obtiene Q=${qe} y P=${pe}.`,.05);
}
function breakEven(){
  const p=rand(250,600,10),cv=rand(80,p-80,10),q=rand(100,400,10),fixed=(p-cv)*q;
  return ex('Punto de equilibrio','Aplico','Determina el punto de equilibrio en unidades.',`Precio de venta: ${money(p)}. Costo variable: ${money(cv)}. Costos fijos: ${money(fixed)}.`,[{label:'Unidades de equilibrio'}],[q],'PE = Costos fijos / (Precio - Costo variable).',`PE=${fixed}/(${p}-${cv})=${q} unidades.`,.05);
}

// UNIDAD II
function quadraticRoots(){
  const r1=rand(1,8),r2=rand(1,8);const B=-(r1+r2),C=r1*r2;
  return ex('Fórmula general','Resuelvo','Encuentra las dos raíces (escribe primero la menor).',`x² ${B<0?'-':'+'} ${Math.abs(B)}x + ${C} = 0`,[{label:'Raíz menor'},{label:'Raíz mayor'}],[Math.min(r1,r2),Math.max(r1,r2)],'Usa x=(-b±√(b²-4ac))/2a.',`Las raíces son x=${Math.min(r1,r2)} y x=${Math.max(r1,r2)}.`);
}
function quadraticFactor(){
  const r1=rand(1,7),r2=rand(2,9),B=-(r1+r2),C=r1*r2;
  return ex('Factorización','Resuelvo','Resuelve por factorización.',`x² ${B<0?'-':'+'} ${Math.abs(B)}x + ${C}=0`,[{label:'Primera raíz (menor)'},{label:'Segunda raíz (mayor)'}],[Math.min(r1,r2),Math.max(r1,r2)],`Busca dos números que multipliquen ${C} y sumen ${B}.`,`(x-${r1})(x-${r2})=0.`);
}
function quadraticVertex(){
  const h=rand(2,10),k=rand(20,100,5),a=-rand(1,4);
  const b=-2*a*h,c=a*h*h+k;
  return ex('Vértice','Comprendo','Determina el vértice de la parábola.',`f(x)=${a}x² + ${b}x + ${c}`,[{label:'Coordenada x del vértice'},{label:'Coordenada y del vértice'}],[h,k],'xᵥ=-b/(2a), luego evalúa f(xᵥ).',`El vértice es (${h}, ${k}).`);
}
function quadraticRange(){
  const h=rand(1,8),k=rand(10,60),a=rand(1,3),b=-2*a*h,c=a*h*h+k;
  return ex('Dominio y rango','Comprendo','Para esta parábola que abre hacia arriba, indica el valor mínimo del rango.',`f(x)=${a}x² + ${b}x + ${c}. El dominio es todos los números reales.`,[{label:'Valor mínimo de y'}],[k],'El mínimo está en la coordenada y del vértice.',`El vértice tiene y=${k}, por lo que el rango es y≥${k}.`);
}
function quadraticProfit(){
  const h=rand(20,60,5),k=rand(20000,80000,5000),a=-rand(10,40,5);
  return ex('Utilidad máxima','Aplico','¿En qué cantidad se maximiza la utilidad y cuál es la utilidad máxima?',`La utilidad de una empresa está modelada por U(x)=${a}(x-${h})²+${k}.`,[{label:'Cantidad x'},{label:'Utilidad máxima ($)'}],[h,k],'La forma U=a(x-h)²+k muestra directamente el vértice.',`Como a<0, el vértice (${h},${k}) representa el máximo.`,.5);
}
function quadraticBreakEven(){
  const r1=rand(10,30,5),r2=rand(40,80,5),a=rand(10,30,5),B=-a*(r1+r2),C=a*r1*r2;
  return ex('Punto de equilibrio','Aplico','Encuentra los dos niveles de producción donde la utilidad es cero.',`U(x)=${a}x² ${B<0?'-':'+'} ${Math.abs(B)}x + ${C}`,[{label:'Primer punto de equilibrio'},{label:'Segundo punto de equilibrio'}],[r1,r2],'Resuelve U(x)=0 mediante factorización o fórmula general.',`Los ceros de la función son x=${r1} y x=${r2}.`,.05);
}

// UNIDAD III
function expEvaluate(){
  const a=rand(2,5),x=rand(2,4),ans=a**x;
  return ex('Función exponencial','Comprendo','Evalúa la función.',`f(x)=${a}^x. Calcula f(${x}).`,[{label:'Resultado'}],[ans],'Multiplica la base por sí misma tantas veces como indique el exponente.',`${a}^${x}=${ans}.`);
}
function expGrowth(){
  const initial=rand(1000,5000,500),rate=rand(5,15)/100,years=rand(2,5),ans=initial*((1+rate)**years);
  return ex('Crecimiento','Aplico','Proyecta el valor después del periodo indicado.',`Una base de clientes inicia con ${initial} personas y crece ${Math.round(rate*100)}% anual durante ${years} años. Usa N=N₀(1+r)^t.`,[{label:'Clientes proyectados'}],[round(ans,2)],'Convierte el porcentaje a decimal y eleva (1+r) al número de años.',`N=${initial}(1+${rate})^${years}=${round(ans,2)}.`,.05);
}
function compoundInterest(){
  const P=rand(10000,50000,5000),r=rand(6,14)/100,t=rand(2,5),n=12,ans=P*((1+r/n)**(n*t));
  return ex('Interés compuesto','Aplico','Calcula el monto acumulado con capitalización mensual.',`Inversión inicial: ${money(P)}. Tasa anual: ${Math.round(r*100)}%. Plazo: ${t} años. A=P(1+r/n)^(nt), con n=12.`,[{label:'Monto final ($)'}],[round(ans,2)],'Usa r en decimal y n=12.',`El monto es aproximadamente ${money(ans)}.`,.1);
}
function compoundTime(){
  const P=10000,r=.10,target=rand(14000,18000,1000);const t=Math.log(target/P)/Math.log(1+r);
  return ex('Tiempo con logaritmos','Resuelvo','¿Cuántos años se requieren para alcanzar la meta?',`Una inversión de ${money(P)} crece 10% anual. ¿Cuánto tarda en alcanzar ${money(target)}? Usa A=P(1+r)^t.`,[{label:'Años (2 decimales)'}],[round(t,2)],'Despeja t aplicando logaritmos: t=ln(A/P)/ln(1+r).',`t≈${round(t,2)} años.`,.02);
}
function businessGrowth(){
  const sales=rand(200000,600000,50000),rate=rand(4,12)/100,months=rand(6,18),ans=sales*((1+rate)**(months/12));
  return ex('Proyección empresarial','Aplico','Proyecta las ventas.',`Ventas actuales: ${money(sales)}. Crecimiento anual esperado: ${Math.round(rate*100)}%. Horizonte: ${months} meses.`,[{label:'Ventas proyectadas ($)'}],[round(ans,2)],'Convierte meses a años antes de usar V=V₀(1+r)^t.',`V≈${money(ans)}.`,.1);
}
function logSolve(){
  const base=2,x=rand(4,8),value=base**x;
  return ex('Logaritmos','Resuelvo','Resuelve la ecuación exponencial.',`2^x=${value}`,[{label:'Valor de x'}],[x],'Aplica logaritmo en ambos lados o reconoce la potencia de 2.',`x=log₂(${value})=${x}.`);
}

// UNIDAD IV
function matrixAdd(){
  const a=[rand(1,9),rand(1,9),rand(1,9),rand(1,9)],b=[rand(1,9),rand(1,9),rand(1,9),rand(1,9)],c=a.map((v,i)=>v+b[i]);
  return ex('Suma de matrices','Comprendo','Suma A+B y escribe los cuatro elementos por renglón.',`A=[[${a[0]}, ${a[1]}],[${a[2]}, ${a[3]}]] &nbsp; B=[[${b[0]}, ${b[1]}],[${b[2]}, ${b[3]}]]`,['c11','c12','c21','c22'].map(x=>({label:x})),c,'Suma elementos de la misma posición.',`A+B=[[${c[0]},${c[1]}],[${c[2]},${c[3]}]].`);
}
function matrixMultiply(){
  const a=[rand(1,5),rand(1,5),rand(1,5),rand(1,5)],b=[rand(1,5),rand(1,5),rand(1,5),rand(1,5)];
  const c=[a[0]*b[0]+a[1]*b[2],a[0]*b[1]+a[1]*b[3],a[2]*b[0]+a[3]*b[2],a[2]*b[1]+a[3]*b[3]];
  return ex('Multiplicación de matrices','Resuelvo','Calcula A×B.',`A=[[${a[0]}, ${a[1]}],[${a[2]}, ${a[3]}]] &nbsp; B=[[${b[0]}, ${b[1]}],[${b[2]}, ${b[3]}]]`,['c11','c12','c21','c22'].map(x=>({label:x})),c,'Multiplica renglón por columna.',`A×B=[[${c[0]},${c[1]}],[${c[2]},${c[3]}]].`);
}
function twoByTwoSystem(){
  const x=rand(1,8),y=rand(1,8),a=2,b=1,c=1,d=3,e=a*x+b*y,f=c*x+d*y;
  return ex('Sistemas lineales','Resuelvo','Resuelve el sistema.',`${a}x+${b}y=${e}<br>${c}x+${d}y=${f}`,[{label:'x'},{label:'y'}],[x,y],'Usa reducción de renglones o eliminación.',`La solución es x=${x}, y=${y}.`);
}
function determinant2(){
  const a=rand(1,9),b=rand(1,9),c=rand(1,9),d=rand(1,9),det=a*d-b*c;
  return ex('Determinantes','Comprendo','Calcula el determinante.',`A=[[${a}, ${b}],[${c}, ${d}]]`,[{label:'det(A)'}],[det],'Para 2×2: ad-bc.',`det(A)=${a}(${d})-${b}(${c})=${det}.`);
}
function inverse2(){
  let a=rand(1,5),b=rand(1,5),c=rand(1,5),d=rand(1,5),det=a*d-b*c;while(det===0){d++;det=a*d-b*c;}
  const vals=[d/det,-b/det,-c/det,a/det].map(v=>round(v,2));
  return ex('Matriz inversa','Resuelvo','Calcula A⁻¹ (redondea a 2 decimales).',`A=[[${a}, ${b}],[${c}, ${d}]]`,['a11','a12','a21','a22'].map(x=>({label:x})),vals,'A⁻¹=(1/det A)[[d,-b],[-c,a]].',`det(A)=${det}; A⁻¹≈[[${vals[0]},${vals[1]}],[${vals[2]},${vals[3]}]].`,.02);
}
function inputOutput(){
  const p1=rand(10,30),p2=rand(10,30),q1=rand(2,8),q2=rand(2,8),total1=p1*q1,total2=p2*q2;
  return ex('Insumo-producto','Aplico','Calcula el valor total de producción de cada sector.',`Dos sectores producen cantidades q=[${q1}, ${q2}] y tienen precios unitarios p=[${p1}, ${p2}]. Interpreta la multiplicación elemento a elemento para obtener el valor de cada sector.`,[{label:'Valor sector 1'},{label:'Valor sector 2'}],[total1,total2],'Multiplica precio por cantidad en cada sector.',`Sector 1: ${p1}×${q1}=${total1}; sector 2: ${p2}×${q2}=${total2}.`);
}

// Eventos
$('startBtn').addEventListener('click',startStudent);
$('backBtn').addEventListener('click',renderDashboard);
$('teacherBtn').addEventListener('click',openTeacherLogin);
$('logoutBtn').addEventListener('click',logoutStudent);
$('cancelTeacherLogin').addEventListener('click',()=>$('teacherLoginModal').classList.add('hidden'));
$('confirmTeacherLogin').addEventListener('click',confirmTeacherLogin);
$('teacherPin').addEventListener('keydown',e=>{if(e.key==='Enter')confirmTeacherLogin();});
$('teacherBackBtn').addEventListener('click',()=>state.student?renderDashboard():switchView('loginView'));
$('checkBtn').addEventListener('click',checkExercise);
$('nextBtn').addEventListener('click',nextExercise);
$('hintBtn').addEventListener('click',()=>$('hintBox').classList.toggle('hidden'));
$('finishBtn').addEventListener('click',finishSession);
$('exportBtn').addEventListener('click',exportCSV);
$('clearBtn').addEventListener('click',clearData);
$('saveEndpointBtn').addEventListener('click',saveEndpoint);
document.querySelectorAll('.mode').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));

loadStudent();
