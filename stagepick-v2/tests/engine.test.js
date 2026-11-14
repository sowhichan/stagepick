const assert = require('node:assert/strict');
require('../js/data.js');
require('../js/recommend.js');
const D=globalThis.SPData,E=globalThis.SPEngine;
let n=0;
function test(name,fn){fn();n++;console.log('PASS',name)}
const base={genres:['인디/얼터너티브'],moods:['몽환적인','잔잔한'],favorite:'wave to earth',novelty:50,region:'서울',budget:50000,when:'any',date:''};
test('기본 추천 아티스트 3팀 이내, 이유 포함',()=>{
 const r=E.makeRecommendation(base);assert.equal(r.artists.length,3);assert.ok(r.artists.every(x=>x.reason.length>4));
});
test('동일 조건은 동일 결과',()=>{
 const list=()=>E.makeRecommendation(base).artists.map(x=>x.artist.id);
 assert.deepEqual(list(),list());
});
test('예산·지역·날짜 일치 공연만 선정',()=>{
 const p={...base,budget:30000,when:'weekend'};
 const r=E.makeRecommendation(p);assert.ok(r.events.every(x=>E.eligibleEvent(x.event,p)));
});
test('아무 공연이 없는 날짜에서는 공연을 만들지 않음',()=>{
 const p={...base,when:'specific',date:'2099-01-01'};
 assert.equal(E.makeRecommendation(p).events.length,0);
});
test('링크는 HTTPS만 허용하고 브라우저 스크립트 URL 차단',()=>{
 assert.ok(!E.safeUrl('javascript:alert(1)'));assert.ok(!E.safeUrl('http://example.org'));assert.ok(!E.safeUrl('https://localhost/foo'));assert.ok(E.safeUrl('https://open.spotify.com/track/0aVd7QiY8BstysHb62c5Fi'));
});
test('등록 정보 정제 및 과거 데이터의 원문 변조 방지',()=>{
 const item={artist:{id:'abc',name:'테스트',type:'밴드',genre:['록/밴드','악성장르'],mood:['신나는'],tracks:[{name:'샘플',spotify:'javascript:alert(1)'}]},event:{name:'공연',date:'2027-01-16',time:'19:00',region:'서울',venue:'시연',price:30000,url:'javascript:alert(1)'}};
 const clean=E.sanitizeRegistration(item);assert.deepEqual(clean.artist.genre,['록/밴드']);assert.equal(clean.artist.tracks[0].spotify,'');assert.equal(clean.event.url,'');
});
test('비슷한 분위기의 다른 아티스트 공연 추천 가능',()=>{
 const prefs={...base,genres:['재즈/소울'],moods:['잔잔한'],favorite:'Yerin Baek',budget:60000};
 const result=E.makeRecommendation(prefs);assert.ok(result.artists.length>0);assert.ok(result.events.every(x=>E.eligibleEvent(x.event,prefs)));
});
test('가상 공연 모두 시연용 표시 및 예약 링크 없음',()=>{
 assert.equal(D.DEMO_EVENTS.length,9);assert.ok(D.DEMO_EVENTS.every(e=>e.source==='demo'&&!e.url));
});
console.log(`\n${n}/${n} engine checks passed.`);
