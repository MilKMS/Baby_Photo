// 테마 데이터
const THEMES = [
  { title: "여행", year: 2024, cover: "images/travel/1.jpg", photos: ["images/travel/1.jpg","images/travel/2.jpg"] },
  { title: "생일", year: 2024, cover: "images/birthday/1.jpg", photos: ["images/birthday/1.jpg"] },
  { title: "놀이시간", year: 2023, cover: "images/playtime/1.jpg", photos: ["images/playtime/1.jpg"] }
];

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
modal.innerHTML = `<button>닫기</button><img src="">`;
document.body.appendChild(modal);

const modalImg = modal.querySelector("img");
const btnClose = modal.querySelector("button");

// 카드 클릭 → 모달 오픈
grid.addEventListener("click", e=>{
  const card = e.target.closest(".card");
  if(!card) return;
  const photos = JSON.parse(card.dataset.photos);
  modalImg.src = photos[0]; // 첫 사진만 표시
  modal.classList.add("open");
});

// 닫기
btnClose.addEventListener("click",()=>modal.classList.remove("open"));
modal.addEventListener("click",(e)=>{
  if(e.target===modal) modal.classList.remove("open");
});
