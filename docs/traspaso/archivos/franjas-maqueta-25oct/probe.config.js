const base = require('C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/beautiful-perlman-2b642c/playwright.config.js');
module.exports = Object.assign({}, base, {
  testDir: 'C:/Users/ezrav/AppData/Local/Temp/claude/C--Users-ezrav-Desktop-Proyectos-Desarrollo-de-aplicaciones-Pace-app--claude-worktrees-beautiful-perlman-2b642c/b51ebda3-702e-4c12-9bc5-90c05d26c986/scratchpad/probe',
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: Object.assign({}, base.webServer, { cwd: 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/beautiful-perlman-2b642c' }),
  timeout: 180000,
});
