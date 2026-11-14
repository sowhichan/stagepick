/* StagePick v2 — music metadata carried forward from original StagePick prototype.
   Artist names and Spotify URLs are existing catalog references, not live-verified.
   Concert entries below are fictional demonstration records; never actual ticket inventory. */
(function(root){
'use strict';
const GENRES=['인디/얼터너티브','록/밴드','재즈/소울','팝/시티팝','발라드/포크','일렉트로닉'];
const MOODS=['잔잔한','몽환적인','감성적인','신나는','강렬한','그루비한'];
const REGIONS=['서울','부산','인천','대전','대구','광주'];
const ARTISTS=[
{id:'wave',name:'wave to earth',type:'밴드',genre:['인디/얼터너티브','재즈/소울'],mood:['잔잔한','몽환적인','그루비한'],description:'잔잔한 기타와 부드러운 보컬, 몽환적인 질감이 어우러지는 밴드 사운드.',tracks:[{name:'seasons',spotify:'https://open.spotify.com/track/0aVd7QiY8BstysHb62c5Fi',embed:'https://open.spotify.com/embed/track/0aVd7QiY8BstysHb62c5Fi'}],art:['#7479d4','#313263'],source:'catalog',shade:'WAVE'},
{id:'silica',name:'실리카겔',type:'밴드',genre:['록/밴드','인디/얼터너티브','일렉트로닉'],mood:['강렬한','신나는','몽환적인'],description:'강렬한 밴드 사운드와 실험적인 전자 질감이 만나는 얼터너티브 록.',tracks:[{name:'NO PAIN',spotify:'https://open.spotify.com/track/01d3IKaDzqxP50zPZnAkT9',embed:'https://open.spotify.com/embed/track/01d3IKaDzqxP50zPZnAkT9'}],art:['#e88d73','#762b59'],source:'catalog',shade:'NO PAIN'},
{id:'hyukoh',name:'HYUKOH',type:'밴드',genre:['록/밴드','인디/얼터너티브'],mood:['감성적인','그루비한','잔잔한'],description:'담백한 보컬과 독특한 기타 리프가 매력적인 얼터너티브 밴드.',tracks:[{name:'TOMBOY',spotify:'https://open.spotify.com/track/6DA7kCWYMggJjqPM84V2Ng',embed:'https://open.spotify.com/embed/track/6DA7kCWYMggJjqPM84V2Ng'}],art:['#77a4a0','#214558'],source:'catalog',shade:'TOMBOY'},
{id:'yerin',name:'Yerin Baek',type:'솔로',genre:['재즈/소울','팝/시티팝','발라드/포크'],mood:['감성적인','잔잔한','몽환적인'],description:'섬세한 보컬과 소울·팝 감각이 자연스럽게 녹아 있는 음악.',tracks:[{name:'Square (2017)',spotify:'https://open.spotify.com/track/2cTK5kS6aPYBNdhUQCzFN7',embed:'https://open.spotify.com/embed/track/2cTK5kS6aPYBNdhUQCzFN7'}],art:['#bb869f','#603c75'],source:'catalog',shade:'SQUARE'},
{id:'sesoneon',name:'SE SO NEON',type:'밴드',genre:['인디/얼터너티브','록/밴드'],mood:['몽환적인','강렬한','감성적인'],description:'유려한 기타 사운드와 자유로운 에너지가 공존하는 얼터너티브 밴드.',tracks:[{name:'A Long Dream',spotify:'https://open.spotify.com/track/2LQJZcCEfTG1v087gaaMMj',embed:'https://open.spotify.com/embed/track/2LQJZcCEfTG1v087gaaMMj'}],art:['#cd9570','#75497d'],source:'catalog',shade:'SO NEON'},
{id:'jannabi',name:'JANNABI',type:'밴드',genre:['인디/얼터너티브','발라드/포크','록/밴드'],mood:['감성적인','잔잔한'],description:'빈티지한 감성과 서정적인 멜로디가 중심이 되는 밴드 음악.',tracks:[{name:'for lovers who hesitate',spotify:'https://open.spotify.com/track/5BqwC9kOBbqYkzdOKeXFFk',embed:'https://open.spotify.com/embed/track/5BqwC9kOBbqYkzdOKeXFFk'}],art:['#d3af69','#75583b'],source:'catalog',shade:'JANNABI'},
{id:'adoy',name:'ADOY',type:'밴드',genre:['팝/시티팝','인디/얼터너티브','일렉트로닉'],mood:['몽환적인','그루비한','잔잔한'],description:'빛나는 신스와 매끄러운 멜로디가 어우러지는 드림팝·시티팝.',tracks:[{name:'Wonder',spotify:'https://open.spotify.com/track/0v89jw9S9NPzOPCoZnLZxE',embed:'https://open.spotify.com/embed/track/0v89jw9S9NPzOPCoZnLZxE'}],art:['#a694db','#445a95'],source:'catalog',shade:'ADOY'},
{id:'surl',name:'SURL',type:'밴드',genre:['록/밴드','인디/얼터너티브'],mood:['신나는','감성적인','강렬한'],description:'선명한 기타와 에너지 넘치는 라이브 감성이 특징인 록 밴드.',tracks:[{name:'Dry Flower',spotify:'https://open.spotify.com/artist/7owveHzN1hmQuw6Ojg4sI3',embed:'https://open.spotify.com/embed/artist/7owveHzN1hmQuw6Ojg4sI3'}],art:['#e9a472','#a35046'],source:'catalog',shade:'SURL'},
{id:'oohyo',name:'OOHYO',type:'솔로',genre:['팝/시티팝','인디/얼터너티브','일렉트로닉'],mood:['몽환적인','감성적인','잔잔한'],description:'부드러운 신스팝과 투명한 감성이 조화를 이루는 사운드.',tracks:[{name:'Vineyard',spotify:'https://open.spotify.com/artist/50Zu2bK9y5UAtD0jcqk5VX',embed:'https://open.spotify.com/embed/artist/50Zu2bK9y5UAtD0jcqk5VX'}],art:['#9eab89','#536957'],source:'catalog',shade:'OOHYO'},
{id:'10cm',name:'10CM',type:'솔로',genre:['발라드/포크','팝/시티팝'],mood:['잔잔한','감성적인','그루비한'],description:'일상적인 노랫말과 경쾌한 어쿠스틱 사운드가 편안하게 닿는 음악.',tracks:[{name:'Phonecert (폰서트)',spotify:'https://open.spotify.com/track/47CcHKISaUPsK4QkO9ERFc',embed:'https://open.spotify.com/embed/track/47CcHKISaUPsK4QkO9ERFc'}],art:['#e5b788','#a36e61'],source:'catalog',shade:'10CM'},
{id:'nerd',name:'Nerd Connection',type:'밴드',genre:['록/밴드','인디/얼터너티브'],mood:['감성적인','강렬한','잔잔한'],description:'묵직한 밴드 사운드와 서정적인 멜로디를 함께 느낄 수 있는 록.',tracks:[{name:'Good Night Good Dream',spotify:'https://open.spotify.com/album/4VLZnvJ9dnuEnF57Pbashc',embed:'https://open.spotify.com/embed/album/4VLZnvJ9dnuEnF57Pbashc'}],art:['#819bac','#33455f'],source:'catalog',shade:'NERD'},
{id:'garden',name:'Car, the garden',type:'솔로',genre:['발라드/포크','인디/얼터너티브'],mood:['잔잔한','감성적인'],description:'서정적인 목소리와 여백이 많은 편곡이 돋보이는 포크·인디팝.',tracks:[{name:'나무',spotify:'https://open.spotify.com/track/30tYWTkLIQtZWnRIOqcHnJ',embed:'https://open.spotify.com/embed/track/30tYWTkLIQtZWnRIOqcHnJ'}],art:['#8caa91','#465e64'],source:'catalog',shade:'GARDEN'}
];
// Concerts are 100% fictional: generated relative to viewer's date, not real schedules, venues or official reservations.
function iso(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate()).toLocaleDateString('en-CA');}
function fromIso(s){const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
function nextSaturday(){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate() + ((6-d.getDay()+7)%7));return d;}
function dayOffsetFromSat(weeks,days=0){const d=nextSaturday();d.setDate(d.getDate()+weeks*7+days);return iso(d)}
const DEMO_EVENTS=[
{id:'e1',artistId:'wave',name:'파도 같은 밤 — 라이브',date:dayOffsetFromSat(0),time:'19:00',region:'서울',venue:'시연용 공연장 A · 합정',price:29000,source:'demo',url:''},
{id:'e2',artistId:'silica',name:'노이즈 앤 라이트',date:dayOffsetFromSat(0),time:'18:00',region:'서울',venue:'시연용 공연장 B · 홍대',price:48000,source:'demo',url:''},
{id:'e3',artistId:'adoy',name:'미드나잇 시티',date:dayOffsetFromSat(0,1),time:'17:00',region:'서울',venue:'시연용 공연장 C · 성수',price:35000,source:'demo',url:''},
{id:'e4',artistId:'hyukoh',name:'어느 도시의 저녁',date:dayOffsetFromSat(1),time:'19:30',region:'부산',venue:'시연용 공연장 D · 전포',price:45000,source:'demo',url:''},
{id:'e5',artistId:'sesoneon',name:'마음의 파동',date:dayOffsetFromSat(1),time:'18:30',region:'서울',venue:'시연용 공연장 E · 연남',price:43000,source:'demo',url:''},
{id:'e6',artistId:'surl',name:'기타가 시작되는 밤',date:dayOffsetFromSat(1,1),time:'18:00',region:'서울',venue:'시연용 공연장 F · 망원',price:32000,source:'demo',url:''},
{id:'e7',artistId:'nerd',name:'별과 꿈의 라이브',date:dayOffsetFromSat(2),time:'20:00',region:'인천',venue:'시연용 공연장 G · 구월',price:31000,source:'demo',url:''},
{id:'e8',artistId:'garden',name:'아주 가까운 노래',date:dayOffsetFromSat(2,1),time:'17:00',region:'서울',venue:'시연용 공연장 H · 서교',price:24000,source:'demo',url:''},
{id:'e9',artistId:'wave',name:'작은 파도, 다른 도시',date:dayOffsetFromSat(3),time:'18:00',region:'대구',venue:'시연용 공연장 I · 동성로',price:39000,source:'demo',url:''}
];

root.SPData={GENRES,MOODS,REGIONS,ARTISTS,DEMO_EVENTS,iso,fromIso,dayOffsetFromSat};
})(globalThis);
