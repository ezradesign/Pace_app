const X = require('./explora');
(async () => {
  for (const [w, h] of [[640, 360], [740, 360], [844, 390], [915, 412], [360, 640]]) for (const id of ['move.neck.3', 'extra.desk.pushups']) {
    const { context, page } = await X.abrir({ w, h, lang: 'es' });
    await page.evaluate((x) => { const r = window.resolveBodyRoutine(x); window.dispatchEvent(new CustomEvent('pace:hacerla', { detail: { routine: r.routine, kind: r.source } })); }, id);
    await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
    await page.clock.runFor(8000); await page.waitForTimeout(400);
    const m = await page.evaluate(() => {
      const r = (s) => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().height > 0); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)]; };
      const num = r('[data-pace-v1-num]'), mando = r('[data-pace-v1-mando]');
      const e = [...document.querySelectorAll('[data-pace-v1-num]')].find(x => x.getBoundingClientRect().height > 0);
      let ve = null; if (e) { const b = e.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); ve = !!t && (e === t || e.contains(t)); }
      return { num, numlabel: r('[data-pace-v1-numlabel]'), mando, siguiente: r('[data-pace-v1-siguiente]'), alto: innerHeight, contadorVisible: ve };
    });
    console.log(w + 'x' + h, id, JSON.stringify(m));
    if (w === 740) await X.foto(page, 'land-run-' + id + '-' + w);
    await context.close();
  }
  await X.cerrar();
})();
