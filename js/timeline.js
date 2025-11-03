/* ===== timeline.js (drop-in) ===== */

// 연도 표시 (옵셔널 체이닝 안 씀: 구형 브라우저 호환 ↑)
(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

// === 테마 데이터: 파일명만 본인 것에 맞게 바꾸세요 ===
const THEMES = [
  { slug: "travel",   title: "여행",    year: 2024, cover: "images/travel.jpg",
    photos: ["images/travel/001.jpg","images/travel/002.jpg","images/travel/003.jpg"] },
  { slug: "birthday", title: "생일",    year: 2024, cover: "images/birthday.jpg",
    photos: ["images/birthday/party1.jpg","images/birthday/cake.jpg"] },
  { slug: "playtime", title: "놀이시간", year: 2023, cover: "images/playtime.jpg",
    photos: ["images/playtime/1.jpg","images/playtime/2.jpg"] }
];

// 필수 요소
const track    = document.getElementById('track');
const viewport = document.getElementById('viewport');

// 가드: 기본 아이템 1개라도 없으면 더미로 채움(스크롤 테스트용)
const data = Array.isArray(THEMES) && THEMES.length ? THEMES : [
  { slug:"sample", title:"샘플", year:new Date().getFullYear(), cover:"https://picsum.photos/800/600?grayscale",
    photos:["https://picsum.photos/seed/1/1200/900","https://picsum.photos/seed/2/1200/900"] }
];

// 렌더 (위/아래 번갈아 배치)
track.innerHTML = data.map((t, i) => {
  const pos = (i % 2 === 0) ? "top" : "bottom";
  const safe = escapeHTML(t.title);
  return `
    <article class="item ${pos}" role="listitem" tabindex="-1" data-slug="${t.slug}">
      <div class="nub" aria-hidden="true"></div>
      <div class="card">
        <img src="${t.cover}" alt="${safe} 대표 사진" loading="lazy"
             onerror="this.style.background='linear-gradient(135deg,#eee,#ddd)';this.alt='이미지 로드 실패';this.removeAttribute('src');">
        <div class="meta">
          <div class="year">${t.year}</div>
          <div class="title">${safe}</div>
        </div>
      </div>
    </article>`;
}).join("");

// 요소 목록
const items = Array.from(track.querySelectorAll('.item'));

// 가운데 있는 아이템 강조
function setActiveByCenter() {
  const vwCenter = window.innerWidth / 2;
  let bestIdx = 0, bestDist = Infinity;
  items.forEach((el, idx) => {
    const r = el.getBoundingClientRect();
    const center = (r.left + r.right) / 2;
    const d = Math.abs(center - vwCenter);
    if (d < bestDist) { bestDist = d; bestIdx = idx; }
  });
  items.forEach(el => el.classList.remove('active'));
  if (items[bestIdx]) items[bestIdx].classList.add('active');
}

// 휠 → 가로 스크롤
viewport.addEventListener('wheel', (e) => {
  e.preventDefault();
  viewport.scrollLeft += (e.deltaY || 0) * 0.9 + (e.deltaX || 0) * 0.9;
}, { passive: false });

// 좌우 키
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') viewport.scrollLeft += 300;
  if (e.key === 'ArrowLeft')  viewport.scrollLeft -= 300;
});

// 스냅/리스너
viewport.style.overflowX = 'auto';
viewport.style.scrollSnapType = 'x proximity';
items.forEach(el => el.style.scrollSnapAlign = 'center');
window.addEventListener('scroll', setActiveByCenter, { passive: true });
window.addEventListener('resize', setActiveByCenter);

// 처음 로드 시 첫 아이템을 중앙으로
window.addEventListener('load', () => {
  const first = items[0];
  if (first) {
    const rect = first.getBoundingClientRect();
    const dx = (rect.left + rect.right) / 2 - window.innerWidth / 2;
    viewport.scrollLeft += dx;
  }
  setActiveByCenter();
});

// ====== (선택) 오버레이 갤러리 ======
const overlay = document.getElementById('overlay');
if (overlay) {
  const overlayBack  = document.getElementById('overlayBack');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlaySub   = document.getElementById('overlaySub');
  const overlayGrid  = document.getElementById('overlayGrid');

  function openTheme(slug){
    const t = data.find(x => x.slug === slug);
    if (!t) return;
    overlayTitle.textContent = t.title;
    overlaySub.textContent   = `${t.year} · ${t.photos.length} photos`;
    overlayGrid.innerHTML    = t.photos.map(p => `<img src="${p}" alt="${escapeHTML(t.title)}">`).join('');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    history.pushState({theme: slug}, "", `#theme=${encodeURIComponent(slug)}`);
  }
  function closeTheme(){
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
    if (location.hash.startsWith('#theme=')) history.back();
  }

  overlayBack?.addEventListener('click', closeTheme);
  overlay.addEventListener('click', (e)=>{ if (e.target === overlay) closeTheme(); });
  window.addEventListener('keydown', (e)=>{ if (e.key === 'Escape' && overlay.classList.contains('open')) closeTheme(); });

  // 타임라인 클릭으로 열기
  track.addEventListener('click', (e)=>{
    const item = e.target.closest('.item');
    if (!item) return;
    openTheme(item.dataset.slug);
  });

  // popstate로 뒤로가기 지원
  window.addEventListener('popstate', ()=>{
    if (location.hash.startsWith('#theme=')) {
      const slug = decodeURIComponent(location.hash.split('=')[1]||"");
      if (!overlay.classList.contains('open')) openTheme(slug);
    } else if (overlay.classList.contains('open')) {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden','true');
    }
  });

  // 해시 진입 시 바로 열기
  if (location.hash.startsWith('#theme=')) {
    const slug = decodeURIComponent(location.hash.split('=')[1]||"");
    openTheme(slug);
  }
}

function escapeHTML(s=""){return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
