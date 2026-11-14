from playwright.sync_api import sync_playwright
from pathlib import Path
import json
import os
base=Path(__file__).resolve().parents[1]
url='about:blank'
shot_dir=Path(os.environ.get('STAGEPICK_SCREENSHOT_DIR','/tmp'))
shot_dir.mkdir(parents=True,exist_ok=True)
def inline_html(preload=None):
    html=(base/'index.html').read_text()
    css=(base/'css/style.css').read_text()
    data=(base/'js/data.js').read_text()
    engine=(base/'js/recommend.js').read_text()
    app=(base/'js/app.js').read_text()
    initial=preload or {}
    shim='''<script>var __memory=Object.assign({},__PRELOAD__);Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return Object.prototype.hasOwnProperty.call(__memory,k)?__memory[k]:null},setItem(k,v){__memory[k]=String(v)},removeItem(k){delete __memory[k]}}});</script>'''.replace('__PRELOAD__',json.dumps(initial,ensure_ascii=False))
    html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>'+css+'</style>')
    html=html.replace('<script src="js/data.js" defer></script>','<script>'+data+'</script>')
    html=html.replace('<script src="js/recommend.js" defer></script>','<script>'+engine+'</script>')
    html=html.replace('<script src="js/app.js" defer></script>',shim+'<script>'+app+'</script>')
    return html
checks=[]
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
  errors=[]
  page.on('pageerror', lambda err: errors.append(str(err)))
  page.set_content(inline_html(),wait_until='load')
  page.wait_for_timeout(400)
  assert not errors, errors
  assert page.locator('#artist-count').inner_text()=='12팀',page.locator('#artist-count').inner_text()
  assert page.locator('#event-count').inner_text()=='9개의 공연',page.locator('#event-count').inner_text()
  checks.append('기본 카탈로그 12팀·9개 공연 로드')
  page.screenshot(path=str(shot_dir/'StagePick_v2_desktop.png'),full_page=True,animations='disabled')
  page.get_by_role('button',name='몽환적인 인디').click()
  page.wait_for_timeout(400)
  assert page.locator('#results').is_visible()
  assert page.locator('#artist-results .artist-card').count()==3
  assert page.locator('#event-results .event-card').count()>=1
  checks.append('취향 프리셋→3팀·공연 추천')
  page.screenshot(path=str(shot_dir/'StagePick_v2_results.png'),full_page=False,animations='disabled')
  page.locator('#event-region').select_option('부산')
  assert page.locator('#event-count').inner_text()=='1개의 공연'
  checks.append('공연 지역 필터')
  page.locator('#event-region').select_option('전체')
  page.locator('#event-directory button[data-save-event]').first.click()
  assert page.locator('#saved-count').inner_text()=='1'
  page.locator('#saved-only').check()
  assert page.locator('#event-count').inner_text()=='1개의 공연'
  checks.append('공연 저장·저장 목록 필터')
  page.locator('#artist-search').fill('SURL')
  assert page.locator('#artist-count').inner_text()=='1팀'
  page.locator('#artist-directory [data-artist-detail]').first.click()
  assert page.locator('#artist-dialog').is_visible()
  page.locator('#dialog-close').click()
  checks.append('아티스트 검색·상세 모달')
  page.locator('#organizers').scroll_into_view_if_needed()
  page.locator('[name="artist"]').fill('브라우저 시연 밴드')
  page.locator('[name="genre"]').select_option('인디/얼터너티브')
  page.locator('[name="mood"]').select_option('몽환적인')
  page.locator('[name="track"]').fill('테스트 음악')
  page.locator('#reg-next-1').click()
  page.locator('[name="event"]').fill('샘플 공연 시연')
  page.locator('[name="date"]').fill('2027-01-16')
  page.locator('[name="region"]').select_option('서울')
  page.locator('[name="venue"]').fill('가상 무대')
  page.locator('[name="price"]').fill('27000')
  page.locator('#reg-next-2').click()
  assert page.locator('#reg-review').is_visible()
  page.locator('#reg-submit').click()
  assert page.locator('#registered-list .registered-item').count()==1
  assert page.locator('#artist-count').inner_text()=='1팀' # filter still SURL
  page.locator('#artist-search').fill('')
  assert page.locator('#artist-count').inner_text()=='13팀'
  assert page.locator('#event-directory .event-card').count()==1 # saved only
  page.locator('#saved-only').uncheck()
  assert page.locator('#event-count').inner_text()=='10개의 공연'
  checks.append('관계자 정보 등록→아티스트·공연 후보 반영')
  page.locator('#registered-list button[data-edit]').click()
  assert page.locator('[name="artist"]').input_value()=='브라우저 시연 밴드'
  page.locator('[name="artist"]').fill('수정된 시연 밴드')
  page.locator('#reg-next-1').click()
  page.locator('#reg-next-2').click()
  page.locator('#reg-submit').click()
  assert page.locator('#registered-list').get_by_text('수정된 시연 밴드').count()==1
  checks.append('등록 정보 수정')
  state=page.evaluate('__memory')
  page.set_content(inline_html(state),wait_until='load')
  assert page.locator('#registered-list').get_by_text('수정된 시연 밴드').count()==1
  assert page.locator('#saved-count').inner_text()=='1'
  checks.append('새로고침 후 등록·저장 유지')
  # Chromium confirm autoconfirms dismiss? explicitly accept
  page.on('dialog',lambda dialog:dialog.accept())
  page.locator('#registered-list button[data-delete]').click()
  assert page.locator('#registered-list .registered-item').count()==0
  checks.append('등록 정보 삭제')
  assert '5/5' in page.locator('#test-summary').inner_text(),page.locator('#test-summary').inner_text()
  checks.append('내장 추천 규칙 테스트 5/5')
  assert not errors,errors
  # mobile
  mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
  merrors=[]
  mobile.on('pageerror',lambda err:merrors.append(str(err)))
  mobile.set_content(inline_html(),wait_until='load')
  mobile.wait_for_timeout(200)
  mobile.screenshot(path=str(shot_dir/'StagePick_v2_mobile.png'),full_page=True,animations='disabled')
  dims=mobile.evaluate('({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})')
  assert dims['scroll'] <= dims['client']+1, dims
  mobile.locator('#menu-toggle').click()
  assert mobile.locator('#main-nav').is_visible()
  assert not merrors,merrors
  checks.append('모바일 메뉴 및 가로 넘침 없음')
  browser.close()
print(json.dumps({'checks':checks,'passed':len(checks),'url':url},ensure_ascii=False,indent=2))
