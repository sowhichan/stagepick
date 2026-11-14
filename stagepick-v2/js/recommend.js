/* StagePick v2 — deterministic browser-side prototype recommender (not a live AI). */
(function(root){
'use strict';
const {GENRES,MOODS,ARTISTS,DEMO_EVENTS,fromIso,iso,dayOffsetFromSat}=root.SPData;
const RELATED={
 '인디/얼터너티브':['록/밴드','팝/시티팝','발라드/포크'],
 '록/밴드':['인디/얼터너티브','일렉트로닉'],
 '재즈/소울':['팝/시티팝','발라드/포크'],
 '팝/시티팝':['재즈/소울','인디/얼터너티브','일렉트로닉'],
 '발라드/포크':['인디/얼터너티브','재즈/소울'],
 '일렉트로닉':['팝/시티팝','인디/얼터너티브']
};
const normalize=s=>String(s||'').toLocaleLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,'');
const unique=arr=>[...new Set(arr)];
const overlap=(a,b)=>a.filter(x=>b.includes(x));
function safeUrl(raw){try{const u=new URL(raw);return u.protocol==='https:'&&!!u.hostname&&u.hostname.includes('.')&&!u.username&&!u.password&&!/^(localhost|127\.|0\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(u.hostname)&&!u.hostname.endsWith('.local');}catch{return false;}}
function isSpotifyTrackEmbed(s){return safeUrl(s)&&/^https:\/\/open\.spotify\.com\/embed\/(track|album|artist|playlist)\/[A-Za-z0-9]+(?:\?.*)?$/.test(s)}
function today(){const d=new Date();return iso(d)}
function dateMatch(date,p){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(fromIso(date).getTime())||iso(fromIso(date))!==date||date<today())return false;
 if(p.when==='specific')return !!p.date&&date===p.date;
 if(p.when==='weekend')return date===dayOffsetFromSat(0)||date===dayOffsetFromSat(0,1);
 if(p.when==='nextweekend')return date===dayOffsetFromSat(1)||date===dayOffsetFromSat(1,1);
 return true;
}
function eligibleEvent(e,p){return Number.isFinite(+e.price)&&+e.price>=0&&+e.price<=+p.budget&&(p.region==='전체'||e.region===p.region)&&dateMatch(e.date,p)}
function favoriteMatch(a,p){const target=normalize(p.favorite);if(!target||target.length<2)return false;return normalize(a.name).includes(target)||target.includes(normalize(a.name))||(a.tracks||[]).some(t=>normalize(t.name).includes(target)||target.includes(normalize(t.name)))}
function preferenceScore(a,p,all){
 const genres=overlap(a.genre,p.genres),moods=overlap(a.mood,p.moods);
 const related=p.genres.filter(g=>!a.genre.includes(g)&&a.genre.some(x=>(RELATED[g]||[]).includes(x)));
 let score=genres.length*23+moods.length*13+related.length*5;
 const favorite=all.find(x=>favoriteMatch(x,p));const direct=favoriteMatch(a,p);
 if(favorite){
  if(direct)score+=Math.round(23-(p.novelty/100)*18);
  else score+=overlap(favorite.genre,a.genre).length*5+overlap(favorite.mood,a.mood).length*3;
 }
 if(p.novelty>=50&&!direct&&genres.length+moods.length>0)score+=(p.novelty/100)*8;
 if(p.novelty<=25&&direct)score+=6;
 return {score,matchedGenres:genres,matchedMoods:moods,relatedGenres:related,direct};
}
function rankArtists(p,all,events){
 const candidates=all.map(a=>({artist:a,...preferenceScore(a,p,all)}));
 for(const c of candidates){if(events.some(e=>e.artistId===c.artist.id&&eligibleEvent(e,p)))c.score+=9;}
 candidates.sort((a,b)=>b.score-a.score||a.artist.name.localeCompare(b.artist.name,'ko'));
 const selected=[];
 while(selected.length<3&&candidates.length){
  const scored=candidates.map(c=>({c,adjust:c.score-(selected.some(x=>x.artist.genre[0]===c.artist.genre[0])?Math.min(8,Math.max(0,p.novelty)*0.08):0)}));
  scored.sort((a,b)=>b.adjust-a.adjust||a.c.artist.name.localeCompare(b.c.artist.name,'ko'));
  const picked=scored[0].c;
  selected.push(picked);candidates.splice(candidates.indexOf(picked),1);
 }
 return selected;
}
function artistReason(c,p){
 const parts=[];
 if(c.matchedGenres.length)parts.push(`${c.matchedGenres.slice(0,2).join('·')} 장르가 취향과 맞아요`);
 if(c.matchedMoods.length)parts.push(`${c.matchedMoods.slice(0,2).join('·')} 분위기를 공유해요`);
 if(c.direct)parts.push('입력한 아티스트 또는 곡과 연결돼요');
 if(!parts.length&&c.relatedGenres.length)parts.push('선호 장르와 가까운 음악 스타일이에요');
 if(!parts.length)parts.push('익숙한 취향과 다른 방향을 가볍게 탐색해 보세요');
 return parts.slice(0,2).join(' · ')+'.';
}
function makeRecommendation(p,all=ARTISTS,events=DEMO_EVENTS){
 const list=rankArtists(p,all,events),idset=new Set(list.map(x=>x.artist.id));
 const scoreMap=new Map(all.map(a=>[a.id,preferenceScore(a,p,all).score]));
 const candidates=events.filter(e=>eligibleEvent(e,p)).map(e=>{
  const artist=all.find(a=>a.id===e.artistId);
  if(!artist)return null;
  const matches=preferenceScore(artist,p,all);
  const topSimilarity=Math.max(0,...list.map(x=>overlap(x.artist.genre,artist.genre).length*9+overlap(x.artist.mood,artist.mood).length*5));
  const direct=idset.has(artist.id);
  const score=(scoreMap.get(artist.id)||0)+topSimilarity+(direct?22:0);
  return {event:e,artist,direct,score,similarity:topSimilarity,reason:direct?'추천 아티스트의 공연이며 관람 조건을 충족해요.':'추천 아티스트와 비슷한 장르·분위기의 대체 공연이에요.'};
 }).filter(x=>x&&(x.direct||x.similarity>=9)&&x.score>=10);
 candidates.sort((a,b)=>b.score-a.score||a.event.date.localeCompare(b.event.date)||a.event.id.localeCompare(b.event.id));
 const picked=candidates.slice(0,3);
 const missing=list.filter(x=>!picked.some(y=>y.event.artistId===x.artist.id)).map(x=>x.artist.name);
 return {artists:list.map(x=>({...x,reason:artistReason(x,p)})),events:picked,missing,alternativeCount:picked.filter(x=>!x.direct).length,matchedEventCount:candidates.length};
}
function sanitizeRegistration(item){
 if(!item||typeof item!=='object'||!item.artist)return null;
 const a=item.artist;
 if(typeof a.name!=='string'||!a.name.trim()||a.name.length>60)return null;
 const genre=Array.isArray(a.genre)?a.genre.filter(x=>GENRES.includes(x)).slice(0,3):[];
 const mood=Array.isArray(a.mood)?a.mood.filter(x=>MOODS.includes(x)).slice(0,3):[];
 if(!genre.length||!mood.length)return null;
 const tracks=Array.isArray(a.tracks)?a.tracks.filter(t=>t&&typeof t.name==='string'&&t.name.length<=100).slice(0,2).map(t=>({name:t.name.slice(0,100),spotify:safeUrl(t.spotify)?t.spotify:'',embed:isSpotifyTrackEmbed(t.embed)?t.embed:''})):[];
 const artist={id:String(a.id||'').slice(0,90)||'local-'+Math.random().toString(36).slice(2),name:a.name.trim(),type:String(a.type||'기타').slice(0,30),genre,mood,description:String(a.description||'').slice(0,240),tracks,shade:a.name.slice(0,12),art:['#7b71a6','#282d4c'],source:'submitted'};
 const e=item.event;
 let event=null;
 if(e&&typeof e.name==='string'&&e.name.trim()&&/^\d{4}-\d{2}-\d{2}$/.test(e.date)&&Number.isFinite(+e.price)&&+e.price>=0&&+e.price<=500000){
  event={id:String(e.id||'evt-'+artist.id).slice(0,95),artistId:artist.id,name:e.name.trim().slice(0,90),date:e.date,time:/^\d{2}:\d{2}$/.test(e.time)?e.time:'19:00',region:root.SPData.REGIONS.includes(e.region)?e.region:'서울',venue:String(e.venue||'').slice(0,110),price:+e.price,url:safeUrl(e.url)?e.url:'',source:'submitted'};
 }
 return {artist,event};
}
root.SPEngine={normalize,safeUrl,isSpotifyTrackEmbed,today,dateMatch,eligibleEvent,preferenceScore,rankArtists,artistReason,makeRecommendation,sanitizeRegistration};
})(globalThis);
