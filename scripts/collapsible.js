const toolToolBox = document.getElementById('tools');
const settingsToolBox = document.getElementById('settings');
const colorsToolBox = document.getElementById('colors')
const colorSelectButton = document.getElementById('colorSelectButton');
const colorCloseButton = document.getElementById('colorCloseButton');
const toolCollapse = document.getElementById('toolCollapseButton');
const settingsCollapse = document.getElementById('settingsCollapseButton');

function changeToolboxState(whichTool, state) {
	let toolElement
    switch (whichTool) {
        case "settings":
            toolElement = settingsToolBox;
            buttonElement = settingsCollapse;
        break
        case "tools":
            toolElement = toolToolBox;
            buttonElement = toolCollapse;
        break
        default:
            throw "that toolbox doesn't exist"
    }
    if (state === 'false') {
        toolElement.setAttribute('hidden', 'false');
        buttonElement.setAttribute('title', 'Collapse the settings');
        buttonElement.innerText = 'Collapse ' + whichTool;
    } else if (state === 'true'){
        toolElement.setAttribute('hidden', 'true');
        buttonElement.setAttribute('title', 'Expand the settings');
        buttonElement.innerText = 'Expand ' + whichTool;
    } else {
        throw new Error("you must choose a state")
    }
	
}

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
