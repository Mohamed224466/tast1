(async ()=>{
  try{
    const res = await fetch('http://localhost:5000/api/videos/add',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ title:'اختبار رابط', url:'https://youtu.be/2g0Bmo2C2xQ?si=nJ6bMchf4-qzqhAi', description:'وصف تجريبي' })
    });
    const text = await res.text();
    console.log('status', res.status);
    console.log(text.slice(0,1000));
  }catch(e){
    console.error('fetch error', e);
  }
})();