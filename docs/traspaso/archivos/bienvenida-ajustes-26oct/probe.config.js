const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/mueve-estira-capas-e9ab74';
const base = require(R + '/playwright.config.js');
module.exports = Object.assign({}, base, {
  testDir: __dirname.replace(/\\/g, '/') + '/probe',
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: Object.assign({}, base.webServer, { cwd: R }),
  timeout: 240000,
  workers: 2,
});
