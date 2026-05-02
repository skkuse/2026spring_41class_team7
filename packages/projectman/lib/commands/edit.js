const util = require('util');
const exec = util.promisify(require('child_process').exec);

// helper functions
const color = require('../colors.js');
const logs = require('../logs.js');

const { SETTINGS_PATH, throwCreateIssueError } = require('../helper.js');

// projectman edit
async function editConfigurations() {
  let openSettingsCommand;

  if (process.platform == 'win32') {
    openSettingsCommand = 'Notepad ';
  } else if (process.platform == 'linux') {
    openSettingsCommand = 'xdg-open ';
  } else {
    openSettingsCommand = 'open -t ';
  }

  try {
    const { stderr } = await exec(`${openSettingsCommand} "${SETTINGS_PATH}"`);
    if (stderr) {
      logs.error('Error occured while opening the file: ' + SETTINGS_PATH);
      console.log('You can follow above path and manually edit jobclaw-projects.json');
      throwCreateIssueError(stderr);
      return;
    }

    console.log(
      color.boldGreen('>>> ') + 'Opening jobclaw-projects.json' + color.green(' ✔')
    );
  } catch (err) {
    logs.error('Error occured while opening the file: ' + SETTINGS_PATH);
    console.warn('You can follow above path and manually edit jobclaw-projects.json');
    throwCreateIssueError(err);
  }
}

module.exports = editConfigurations;
