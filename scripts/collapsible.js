const toolToolBox = document.getElementById('tools');
const settingsToolBox = document.getElementById('settings');
const toolCollapse = document.getElementById('toolCollapseButton');
const settingsCollapse = document.getElementById('settingsCollapseButton');

function changeToolboxState(whichTool, state) {
	if (whichTool === 'settings') {
		if (state === 'false') {
			settingsToolBox.setAttribute('hidden', 'false');
			settingsCollapse.setAttribute('title', 'Collapse the settings');
			settingsCollapse.innerText = 'Collapse settings';
		} else {
			settingsToolBox.setAttribute('hidden', 'true');
			settingsCollapse.setAttribute('title', 'Expand the settings');
			settingsCollapse.innerText = 'Expand settings';
		}
	} else {
		if (state === 'false') {
			toolToolBox.setAttribute('hidden', 'false');
			toolCollapse.setAttribute('title', 'Collapse the toolbox');
			toolCollapse.innerText = 'Collapse tools';
		} else {
			toolToolBox.setAttribute('hidden', 'true');
			toolCollapse.setAttribute('title', 'Expand the toolbox');
			toolCollapse.innerText = 'Expand tools';
		}
	}
}

changeToolboxState('tools', editorSave.toolsHiddenSetting);
changeToolboxState('settings', editorSave.settingsHiddenSetting);

toolCollapse.addEventListener('click', () => {
	if (toolToolBox.getAttribute('hidden') === 'true') {
		editorSave.toolsHiddenSetting = 'false';
		changeToolboxState('tools', 'false');
	} else {
		editorSave.toolsHiddenSetting = 'true';
		changeToolboxState('tools', 'true');
	}
	saveEditorSettings();
})

settingsCollapse.addEventListener('click', () => {
	if (settingsToolBox.getAttribute('hidden') === 'true') {
		editorSave.settingsHiddenSetting = 'false';
		changeToolboxState('settings', 'false');
	} else {
		editorSave.settingsHiddenSetting = 'true';
		changeToolboxState('settings', 'true');
	}
	saveEditorSettings();
})
