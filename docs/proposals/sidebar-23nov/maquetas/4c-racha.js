/* 4C · La racha con su nombre: «Racha de 2 días · mejor, 9». */
(() => {
  const p = document.querySelector('[data-pace-semana] > span:last-child');
  if (!p || p.querySelector('[data-pace-capsula]')) return;
  p.textContent = p.textContent
    .replace(/(\d+) días? en ritmo · mejor (\d+)/, (m, n, b) => 'Racha de ' + n + (n === '1' ? ' día' : ' días') + ' · mejor, ' + b)
    .replace(/(\d+) días? en ritmo$/, (m, n) => 'Racha de ' + n + (n === '1' ? ' día' : ' días'))
    .replace(/(\d+) days? in rhythm · best (\d+)/, (m, n, b) => n + '-day streak · best, ' + b)
    .replace(/(\d+) days? in rhythm$/, (m, n) => n + '-day streak');
})();
