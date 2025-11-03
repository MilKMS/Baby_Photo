// 연도 표기
document.getElementById('year')?.textContent = new Date().getFullYear();

// === 테마 데이터만 바꾸면 됨 ===
const THEMES = [
  { title: "여행",    year: 2024, img: "images/travel.jpg" },
  { title: "생일",    year: 2024, img: "images/birthday.jpg" },
  { title: "놀이시간", year: 2023, img: "images/playtime.jpg" },
  { title: "첫 걸음", year: 2023, img: "images/firststep.jpg" },
  // ...원하는 만큼 추가
];

const track = document.getElementById('track');
const viewport = document.getElementById('viewport');

// 렌더링 (위/아래 번갈아 배치)
track.innerHTML = THEMES.map((t, i) => {
  const pos = (i % 2 === 0) ? "top" : "bottom";
  return `
    <article class="item ${pos}" role="listitem" tabindex="-1">
      <div class="nub" aria-hidden="true"></div>
      <div class="card">
        <img src="${t.img}" alt="${escapeHTML(t.title)} 대표 사진" loading="lazy">
        <div class="meta">
          <div class="year">${t.year}</div>
          <div class="title">${escapeHTML(t.title)}</div>
        </div>
      </div>
    </article>`;
}).join("");

// 현재 중앙 아이템 강조
const items = Array.from(track.querySelectorAll('.item'));
function setActiveByCenter() {
  const vwCenter = window.innerWidth / 2;
  let best = { idx: 0, dist: Infinity };
  items.forEach((el, idx) => {
    const r = el.getBoundingClientRect();
    const center = (r.left + r.right) / 2;
    const d = Math.abs(center - vwCenter);
    if (d < best.dist) best = { idx, dist: d };
  });
  items.forEach(el => el.classList.remove('active'));
  items[best.idx]?.classList.add('active');
}
const obs = new ResizeObserver(setActiveByCenter);
obs.observe(document.body);
window.addEventListener('scroll', setActiveByCenter, { passive: true });
window.addEventListener('resize', setActiveByCenter);

// 휠로 가로 스크롤
viewport.addEventListener('wheel', (e) => {
  e.preventDefault();
  viewport.scrollLeft += e.deltaY * 0.9 + e.deltaX * 0.9;
}, { passive: false });

// 키보드 좌우 이동
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') viewport.scrollLeft += 300;
  if (e.key === 'ArrowLeft')  viewport.scrollLeft -= 300;
});

// 트랙을 스크롤 대상이 되게 만들기 (수평 스크롤)
viewport.style.overflowX = 'auto';
viewport.style.scrollSnapType = 'x proximity';
items.forEach(el => el.style.scrollSnapAlign = 'center');

// 페이지 로드 시 중앙 강조
window.addEventListener('load', () => {
  // 최초 중앙에 첫 아이템 오도록
  const first = items[0];
  if (first) {
    const rect = first.getBoundingClientRect();
    const dx = (rect.left + rect.right)/2 - window.innerWidth/2;
    viewport.scrollLeft += dx;
  }
  setActiveByCenter();
});

function escapeHTML(s=""){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
