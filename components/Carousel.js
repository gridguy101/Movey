// components/Carousel.js

export function createCarousel(items, onItemClick, { removable = false, onRemove } = {}) {
  if (!items || items.length === 0) return null;

  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  const containerWrap = document.createElement('div');
  containerWrap.className = 'carousel-container';

  const container = document.createElement('div');
  container.className = 'carousel';

  let scroll = 0;
  const cardWidth = 240;
  const visible   = Math.floor(window.innerWidth / cardWidth);
  const maxScroll = Math.max(0, (items.length - visible) * cardWidth);

  const scrollTo = dir => {
    scroll = Math.min(Math.max(scroll + dir * cardWidth, 0), maxScroll);
    container.style.transform = `translateX(-${scroll}px)`;
  };

  // Arrows
  const leftBtn = document.createElement('button');
  leftBtn.className = 'carousel-arrow left';
  leftBtn.innerText = '‹';
  leftBtn.onclick = () => scrollTo(-1);

  const rightBtn = document.createElement('button');
  rightBtn.className = 'carousel-arrow right';
  rightBtn.innerText = '›';
  rightBtn.onclick = () => scrollTo(1);

  // Cards
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'carousel-card';

    // background
    const img = item.backdrop_path || item.poster_path;
    if (img) card.style.backgroundImage = `url(https://image.tmdb.org/t/p/w500${img})`;
    else card.style.backgroundColor = '#555';

    // remove button
    if (removable && typeof onRemove === 'function') {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerText = '✕';
      removeBtn.addEventListener('click', e => {
        e.stopPropagation();
        onRemove(item);
      });
      card.appendChild(removeBtn);
    }

    // title
    const titleEl = document.createElement('div');
    titleEl.className = 'title';
    titleEl.textContent = item.title || 'Untitled';
    card.appendChild(titleEl);

    // click to play
    card.addEventListener('click', () => onItemClick && onItemClick(item));

    container.appendChild(card);
  });

  containerWrap.appendChild(container);
  wrapper.appendChild(containerWrap);
  if (items.length > visible) {
    wrapper.appendChild(leftBtn);
    wrapper.appendChild(rightBtn);
  }

  return wrapper;
}
