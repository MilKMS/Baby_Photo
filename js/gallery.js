// 테마 데이터 (폴더와 마지막 번호만 입력하면 자동 생성)
const RAW_THEMES = [
  { title: "100일까지의 여정", year: 2024, folder: "images/borntohundred", lastIndex: 38 },
  { title: "첫 생일", year: 2025, folder: "images/OneYears", lastIndex: 71 }
];

const buildPhotoList = ({ folder, lastIndex, startIndex = 1, extension = "jpg" }) => {
  const total = Math.max(0, lastIndex - startIndex + 1);
  return Array.from({ length: total }, (_, idx) => `${folder}/${startIndex + idx}.${extension}`);
};

const THEMES = RAW_THEMES.map(theme => {
  const photos = buildPhotoList(theme);
  const coverIndex = photos.length ? Math.floor(Math.random() * photos.length) : 0;

  return {
    ...theme,
    cover: photos[coverIndex] ?? "",
    photos
  };
}).filter(theme => theme.photos.length);

const grid = document.getElementById("themeGrid");

grid.innerHTML = THEMES.map(t => `
  <div class="card" data-photos='${JSON.stringify(t.photos)}'>
    <img src="${t.cover}" alt="${t.title}">
    <h2>${t.title}</h2>
    <span>${t.year}</span>
  </div>
`).join("");

// 모달 생성
const modal = document.createElement("div");
modal.className = "modal";
modal.innerHTML = `
  <div class="modal__content">
    <button class="modal__close" type="button">닫기</button>
    <button class="modal__nav modal__nav--prev" type="button" aria-label="이전 사진">‹</button>
    <img src="" alt="선택한 사진">
    <button class="modal__nav modal__nav--next" type="button" aria-label="다음 사진">›</button>
    <div class="modal__counter" aria-live="polite"></div>
  </div>
`;
document.body.appendChild(modal);

const modalImg = modal.querySelector("img");
const btnClose = modal.querySelector(".modal__close");
const btnPrev = modal.querySelector(".modal__nav--prev");
const btnNext = modal.querySelector(".modal__nav--next");
const counter = modal.querySelector(".modal__counter");

let currentPhotos = [];
let currentIndex = 0;

const updateModal = () => {
  if (!currentPhotos.length) return;
  const hasMultiple = currentPhotos.length > 1;
  modalImg.src = currentPhotos[currentIndex];
  counter.textContent = `${currentIndex + 1} / ${currentPhotos.length}`;
  btnPrev.style.display = hasMultiple ? "flex" : "none";
  btnNext.style.display = hasMultiple ? "flex" : "none";
  counter.style.display = hasMultiple ? "block" : "none";
};

const openModal = photos => {
  currentPhotos = photos;
  currentIndex = 0;
  updateModal();
  modal.classList.add("open");
};

const showNext = () => {
  if (!currentPhotos.length) return;
  currentIndex = (currentIndex + 1) % currentPhotos.length;
  updateModal();
};

const showPrev = () => {
  if (!currentPhotos.length) return;
  currentIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
  updateModal();
};

// 카드 클릭 → 모달 오픈
grid.addEventListener("click", e=>{
  const card = e.target.closest(".card");
  if(!card) return;
  const photos = JSON.parse(card.dataset.photos);
  openModal(photos);
});

// 네비게이션
btnNext.addEventListener("click", showNext);
btnPrev.addEventListener("click", showPrev);

// 키보드 접근성
document.addEventListener("keydown", e => {
  if (!modal.classList.contains("open")) return;
  if (e.key === "ArrowRight") showNext();
  if (e.key === "ArrowLeft") showPrev();
  if (e.key === "Escape") modal.classList.remove("open");
});

// 닫기
btnClose.addEventListener("click",()=>modal.classList.remove("open"));
modal.addEventListener("click",(e)=>{
  if(e.target===modal) modal.classList.remove("open");
});
