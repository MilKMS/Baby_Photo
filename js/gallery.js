// Project Pages이므로 baseurl 필요 없음(상대경로)
const DATA_URL = "data/photos.json";

async function loadPhotos() {
  const r = await fetch(`${DATA_URL}?t=${Date.now()}`);
  const { photos = [] } = await r.json();

  // 연도 내림차순 → 같은 연도 내 파일명 정렬
  photos.sort((a,b) => (b.year - a.year) || String(a.src).localeCompare(b.src));

  const wrap = document.getElementById("gallery");
  wrap.innerHTML = photos.map(p => cardHTML(p)).join("");

  // 뷰어 바인딩
  setupViewer();
}

function cardHTML(p) {
  // p.src는 assets/photos/년도/파일명 형태
  const url = p.src;
  const alt = p.desc || `Photo ${p.year}`;
  return `
  <article class="card" tabindex="0" data-url="${url}" data-cap="${escapeHtml(`[${p.year}] ${p.desc||""}`)}">
    <img class="thumb" src="${url}" alt="${escapeHtml(alt)}" loading="lazy" />
    <div class="meta">
      <div class="year">${p.year}</div>
      <div class="desc">${escapeHtml(p.desc || "")}</div>
    </div>
  </article>`;
}

function setupViewer(){
  const viewer = document.createElement("div");
  viewer.className = "viewer";
  viewer.innerHTML = `<img alt=""><div class="cap"></div>`;
  document.body.appendChild(viewer);

  const img = viewer.querySelector("img");
  const cap = viewer.querySelector(".cap");

  function open(url, caption){
    img.src = url;
    cap.textContent = caption || "";
    viewer.classList.add("open");
  }
  function close(){
    viewer.classList.remove("open");
    img.src = "";
  }

  document.addEventListener("click", (e)=>{
    const card = e.target.closest(".card");
    if (card) {
      open(card.dataset.url, card.dataset.cap);
    } else if (e.target === viewer || e.target === img || e.target === cap) {
      close();
    }
  });
  document.addEventListener("keydown", (e)=>{
    if (e.key === "Escape") close();
  });
}

function escapeHtml(s=""){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) }

loadPhotos().catch(err => {
  console.error("Failed to load photos.json", err);
  document.getElementById("gallery").innerHTML = `<p style="color:#fca5a5">데이터를 불러오지 못했습니다.</p>`;
});
