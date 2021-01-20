// ==UserScript==
// @name         Azure DevOps Fancy Board
// @namespace    https://github.com/fix-me/
// @version      0.1
// @updateURL    https://raw.githubusercontent.com/fix-me/fancy-azure-devops/master/board.user.js
// @downloadURL  https://raw.githubusercontent.com/fix-me/fancy-azure-devops/master/board.user.js
// @description  On the Azure DevOps board, add collapse expand feature
// @author       fix-me
// @match        https://dev.azure.com/*/board/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    const COLLAPSE = "Collapse";
    const EXPAND = "Expand";

    let injected = false;
    let expanded = true;

    const buttonLabel = document.createTextNode(COLLAPSE);

    const collapseElements = () => document.querySelectorAll(".board-tile").forEach(bt => {
        bt.style.height = (12+bt.querySelector(".clickable-title").offsetHeight)+"px";
        bt.style.overflow = "hidden";
    });

    const expandElements = () => document.querySelectorAll(".board-tile").forEach(bt => {
        bt.style.height = "";
        bt.style.overflow = "";
    });

    const doToggle = () => {
        if (expanded) collapseElements(); else expandElements();

        expanded = !expanded;
        buttonLabel.textContent = expanded ? COLLAPSE : EXPAND;
    }

    const getMenubar = () => document.querySelector(".ms-CommandBar-primaryCommands");
    const getClassExistingA = () => document.querySelector(".ms-CommandBar-primaryCommands a").className;
    const getClassExistingSpan = () => document.querySelector(".ms-CommandBar-primaryCommands a span").className;

    const addToggleButton = () => {
        try {
            const menubar = getMenubar();
            const classA = getClassExistingA();
            const classSpan = getClassExistingSpan();

            const div = document.createElement("div");
            div.className = "ms-CommandBarItem";

            const a = document.createElement("a");
            a.className = classA;
            a.addEventListener("click", doToggle);

            const span = document.createElement("span");
            span.className = classSpan;

            span.append(buttonLabel);
            a.append(span);
            div.append(a);
            menubar.append(div);

            injected = true;
        } catch(e) {
            // Element not found
            console.warn("Injection of toggle button failed!");
        }
    };

    const inject = () => {
        requestAnimationFrame(()=>{
            addToggleButton();
            if (!injected) {
                setTimeout(()=>{
                    inject();
                }, 5000);
            }
        });
    };

    inject();
})();