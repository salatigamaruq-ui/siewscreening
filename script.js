const $=id=>document.getElementById(id);let espBase=location.origin;let timer=null;let toastTimer=null;let lastManualTemp=null;$('year').textContent=new Date().getFullYear();

function toast(m){const e=$('toast');e.textContent=m;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),3200)}

function setConn(ok,text){$('connectionText').textContent=text;$('connectionText').classList.toggle('on',ok)}

function setVal(id,v){$(id).textContent=(v===null||v===undefined||v===''||!Number.isFinite(Number(v)))?'—':v}

async function poll(){try{const r=await fetch(espBase+'/api/data',{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const d=await r.json();setConn(true,'ESP32 terhubung');setVal('bpmValue',d.bpm);setVal('spo2Value',d.spo2);setVal('respValue',d.respiratory_rate??d.napas??d.frekuensi);setVal('tempValue',d.temperature);latestSensorData={bpm:(d.bpm??null),spo2:(d.spo2??null),respiratory_rate:(d.respiratory_rate??d.napas??d.frekuensi??null),temperature:(d.temperature??null),status:(d.status||d.statusSIEW||'MENUNGGU DATA')};$('bpmHint').textContent=d.kategori_bpm||'Menunggu kategori';$('spo2Hint').textContent=d.kategori_spo2||'Menunggu kategori';$('respHint').textContent=d.kategori_napas||'Menunggu kategori';$('tempHint').textContent=d.kategori_suhu||'Menunggu kategori';$('updatedLabel').textContent='DATA TERBARU';$('sensorStatus').textContent='MAX30102: '+(d.max30102||'—')+' · MLX90614: '+(d.mlx90614||'—')+' · Apps Script: '+(d.appscript||'—')+' · '+(d.cloud_message||'');const s=String(d.status||d.statusSIEW||'MENUNGGU DATA').toUpperCase();$('resultTitle').textContent=s;$('resultDescription').textContent='Kesimpulan gabungan dari BPM, SpO₂, frekuensi napas, dan suhu tubuh. Hasil prototipe bukan diagnosis medis.';$('resultBox').className='result '+(s.includes('DALAM RENTANG')?'safe':(s.includes('PEMANTAUAN')||s.includes('WASPADA')||s.includes('DEMAM')?'warn':''));}catch(e){setConn(false,'ESP32 belum terhubung');$('updatedLabel').textContent='MENUNGGU DATA'}}

let latestSensorData={bpm:null,spo2:null,respiratory_rate:null,status:'MENUNGGU DATA'};

$('participantForm').addEventListener('submit',e=>e.preventDefault());

$('submitAllData').addEventListener('click',async()=>{

 const form=$('participantForm');

 if(!form.reportValidity()){toast('Lengkapi semua data peserta dan suhu terlebih dahulu.');return}

 const temp=Number($('temperatureInput').value);

 if(!Number.isFinite(temp)||temp<25||temp>45){toast('Suhu tubuh harus antara 25–45 °C.');return}

 const btn=$('submitAllData');btn.disabled=true;btn.textContent='Mengirim data…';

 try{

   // Periksa akses internet terlebih dahulu, bukan respons pengiriman Apps Script.
   const internetResponse = await fetch(espBase+'/api/internet',{cache:'no-store'});
   const internetState = await internetResponse.json();
   if (!internetState.connected) {
     toast('Internet belum terhubung. Sambungkan ESP32 ke Wi-Fi yang memiliki internet, lalu coba lagi.');
     return;
   }

   await poll();

   const payload={
     participant:{name:$('participantName').value.trim(),gender:$('participantSex').value,age:Number($('participantAge').value),weightKg:Number($('participantWeight').value),heightCm:Number($('participantHeight').value)},
     temperatureC:temp,
     measurements:{spo2:latestSensorData.spo2,bpm:latestSensorData.bpm,respiratoryRate:latestSensorData.respiratory_rate,status:latestSensorData.status},
     submittedAt:new Date().toISOString()
   };

   await fetch(espBase+'/api/temperature',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({temperature:temp})});

   // Jangan menilai berhasil/gagal berdasarkan format balasan Apps Script.
   await fetch(espBase+'/api/participant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});

   lastManualTemp=temp;
   toast('Data telah dikirim untuk diproses. Periksa sheet ADMIN untuk memastikan baris tercatat.');
 } catch(err) {
   toast('Internet tidak dapat dijangkau. Periksa koneksi Wi-Fi internet ESP32, lalu coba lagi.');
 }

 finally{btn.disabled=false;btn.textContent='Submit semua data dan hasil pengukuran'}

});

$('scanWifi').addEventListener('click',async()=>{const b=$('scanWifi');const sel=$('wifiSsid');b.disabled=true;b.textContent='Memindai…';try{const r=await fetch(espBase+'/api/wifi/scan',{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const d=await r.json();const list=(d.networks||[]).map(n=>n.ssid).filter(Boolean);sel.innerHTML='';const first=document.createElement('option');first.value='';first.textContent=list.length?'Pilih jaringan Wi-Fi':'Tidak ada jaringan ditemukan';sel.appendChild(first);list.forEach(ssid=>{const opt=document.createElement('option');opt.value=ssid;opt.textContent=ssid;sel.appendChild(opt)});if(!list.length)toast('Tidak ada Wi-Fi ditemukan. Coba pindai lagi.');else toast(list.length+' jaringan Wi-Fi ditemukan.')}catch(e){toast('Pemindaian gagal. Pastikan terhubung ke hotspot SIEW.')}finally{b.disabled=false;b.textContent='Pindai'}});

$('wifiForm').addEventListener('submit',async e=>{e.preventDefault();const ssid=$('wifiSsid').value.trim();const password=$('wifiPassword').value;if(!ssid){toast('Masukkan SSID Wi-Fi.');return}try{const body=new URLSearchParams({ssid,password});const r=await fetch(espBase+'/api/wifi/save',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});const d=await r.json();if(!r.ok)throw Error(d.message||'Gagal');$('wifiStatus').textContent='Konfigurasi disimpan. Periksa status koneksi beberapa saat lagi.';toast(d.message||'Konfigurasi Wi-Fi disimpan.');setTimeout(poll,1800)}catch(e){toast('Tidak dapat menyimpan Wi-Fi. Pastikan tersambung ke hotspot SIEW.')}});

poll();timer=setInterval(poll,2500);
