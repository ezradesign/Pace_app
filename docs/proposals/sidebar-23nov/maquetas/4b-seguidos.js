/* 4B · La racha dice «seguidos»: «2 días seguidos · tu mejor, 9». */
(() => {
  const p = document.querySelector('[data-pace-semana] > span:last-child');
  if (!p || p.querySelector('[data-pace-capsula]')) return;
  p.textContent = p.textContent
    .replace(/(\d+) días? en ritmo · mejor (\d+)/, (m, n, b) => n + (n === '1' ? ' día seguido' : ' días seguidos') + ' · tu mejor, ' + b)
    .replace(/(\d+) días? en ritmo$/, (m, n) => n + (n === '1' ? ' día seguido' : ' días seguidos'))
    .replace(/(\d+) days? in rhythm · best (\d+)/, (m, n, b) => n + (n === '1' ? ' day' : ' days') + ' in a row · your best, ' + b)
    .replace(/(\d+) days? in rhythm$/, (m, n) => n + (n === '1' ? ' day' : ' days') + ' in a row');
})();
