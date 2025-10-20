const patterns=[/[?&]v=([\w-]{11})/,/youtu\.be\/([\w-]{11})/,/embed\/([\w-]{11})/,/^([\w-]{11})$/];
const extract=(s)=>{for(const p of patterns){const m=s.match(p);if(m) return m[1];}return null};
const tests=['https://youtu.be/2g0Bmo2C2xQ?si=nJ6bMchf4-qzqhAi','https://www.youtube.com/watch?v=2g0Bmo2C2xQ','2g0Bmo2C2xQ','https://youtube.com/embed/2g0Bmo2C2xQ'];
tests.forEach(t=>console.log(t + ' -> ' + extract(t)));