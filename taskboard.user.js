// ==UserScript==
// @name         Azure DevOps Fancy Taskboard
// @namespace    https://github.com/fix-me/
// @version      0.1
// @updateURL    https://raw.githubusercontent.com/fix-me/fancy-azure-devops/master/taskboard.user.js
// @downloadURL  https://raw.githubusercontent.com/fix-me/fancy-azure-devops/master/taskboard.user.js
// @description  On the Azure DevOps taskboard, highlight tasks with tags 'AC', 'frontend', 'backend', 'machine', 'devops'
// @author       fix-me
// @match        https://dev.azure.com/*/taskboard/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    const isTask = node => node.parentNode.getAttribute("aria-label").indexOf("Task") === 0;

    const styleByTag = (tag, color) => {
        Array.from(document.getElementsByClassName("tag-box"))
            .filter(t=>t.innerHTML.toLowerCase()===tag)
            .map(t=>t.closest(".tbTileContent"))
            .filter(isTask)
            .forEach(t=>{t.style="background-color: " + color})
    };

    setTimeout(()=>{
        styleByTag("ac", "Khaki");
        styleByTag("frontend", "PaleGreen");
        styleByTag("backend", "MistyRose");
        styleByTag("machine", "LightCyan");
        styleByTag("devops", "Gainsboro");
    },3000);

})();