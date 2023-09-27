// ==UserScript==
// @name         Azure DevOps Fancy Taskboard
// @namespace    https://github.com/fix-me/
// @version      0.5
// @updateURL    https://raw.githubusercontent.com/fix-me/fancy-azure-devops/master/taskboard.user.js
// @downloadURL  https://raw.githubusercontent.com/fix-me/fancy-azure-devops/master/taskboard.user.js
// @description  On the Azure DevOps taskboard, highlight tasks with tags 'AC', 'frontend', 'backend', 'machine', 'devops'
// @author       fix-me
// @match        https://dev.azure.com/*/taskboard/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    let tags = [];
    const favoriteTags = ["AC", "frontend", "backend", "native", "machine", "devops", "Cloud2Cloud", "optional"];

    const getHomeURL = () => window.dataProviders.data["ms.vss-tfs-web.header-action-data"].suiteHomeUrl;
    const getProjectID = () => window.dataProviders.data["ms.vss-work-web.agile-backlog-configuration-data-provider"].projectId;

    const fetchTags = async () => {
        if (tags.length === 0) {
            const res = await fetch("https://dev.azure.com" + getHomeURL() + "_apis/Contribution/dataProviders/query", {
                "headers": {
                    "accept": "application/json;api-version=5.1-preview.1;excludeUrls=true;enumsAsNumbers=true;msDateFormat=true;noArrayWrap=true",
                    "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    "pragma": "no-cache",
                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest",
                    "x-vss-reauthenticationaction": "Suppress"
                },
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": "{\"contributionIds\":[\"ms.vss-work-web.work-item-tag-suggestions-data-provider\"],\"context\":{\"properties\":{\"projectScope\":\"" + getProjectID() + "\"}}}",
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            });

            const json = await res.json();

            tags = json.data["ms.vss-work-web.work-item-tag-suggestions-data-provider"];
        }

        return tags;
    }

    const fetchItem = async (id) => {
        const res = await fetch("https://dev.azure.com" + getHomeURL() + "_apis/Contribution/dataProviders/query", {
            "headers": {
                "accept": "application/json;api-version=5.1-preview.1;excludeUrls=true;enumsAsNumbers=true;msDateFormat=true;noArrayWrap=true",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "cache-control": "no-cache",
                "content-type": "application/json",
                "pragma": "no-cache",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
                "x-vss-reauthenticationaction": "Suppress"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "{\"contributionIds\":[\"ms.vss-work-web.work-item-data-provider\"],\"context\":{\"properties\":{\"id\":" + id + ",\"include-in-recent-activity\":true}}}",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

        const json = await res.json();

        const item = json.data["ms.vss-work-web.work-item-data-provider"];

        return item;
    }

    const getItemTags = (item) => {
        return item["work-item-data"].fields[80].split(";").map(t => t.trim());
    }

    const getItemRevision = (item) => {
        return item["work-item-data"].revision;
    }

    const getItemId = (item) => {
        return item["work-item-id"]
    }

    const setItemTags = async (item, tags) => {
        const res = await fetch("https://dev.azure.com" + getHomeURL() + "_apis/Contribution/dataProviders/query", {
            "headers": {
                "accept": "application/json;api-version=5.1-preview.1;excludeUrls=true;enumsAsNumbers=true;msDateFormat=true;noArrayWrap=true",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "cache-control": "no-cache",
                "content-type": "application/json",
                "pragma": "no-cache",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
                "x-vss-reauthenticationaction": "Suppress"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "{\"contributionIds\":[\"ms.vss-work-web.update-work-items-data-provider\"],\"context\":{\"properties\":{\"updatePackage\":\"[{\\\"id\\\":" + getItemId(item) + ",\\\"rev\\\":" + getItemRevision(item) + ",\\\"projectId\\\":\\\"" + getProjectID() + "\\\",\\\"isDirty\\\":true,\\\"fields\\\":{\\\"80\\\":\\\"" + tags.join("; ") + "\\\"}}]\"}}}",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
    }


    const isTask = node => node?.parentNode.getAttribute("aria-label").indexOf("Task") === 0;

    const selectTaskElems = () => [
        ...new Set(Array.from(document.getElementsByClassName("tbTileContent"))
            .filter(isTask))
    ];

    const getTaskElemTags = (taskElem) => Array.from(taskElem.querySelectorAll(".tag-box:not(.add-tag)")).map(t => t.innerHTML);

    const getTaskElemId = (taskElem) => taskElem.querySelector(".id").innerText;

    const addTaskElemRemovers = (taskElem) => Array.from(taskElem.querySelectorAll(".tag-container")).filter(tc => !tc.querySelector(".remove-tag")).forEach(tc => {
        const theTag = tc.querySelector(".tag-box").innerText;
        const s = document.createElement("span");
        s.innerText = "x";
        s.classList.add("remove-tag");
        s.style.color = "gray";
        s.style.backgroundColor = "#fff";
        s.style.padding = "2px 2px";
        s.style.cursor = "pointer";
        s.onclick = async () => {
            const item = await fetchItem(getTaskElemId(taskElem));
            const itemTags = getItemTags(item);
            const newItemTags = itemTags.filter(t => t !== theTag);
            setItemTags(item, newItemTags);
            //console.log(getTaskElemId(taskElem), getTaskElemTags(taskElem), theTag);
        }
        tc.appendChild(s);
    });

    const getTagColor = (tag) => {
        switch (tag) {
            case "AC": return "#ebe66c";
            case "frontend": return "#8af086";
            case "backend": return "#ff7063";
            case "native": return "#ffa0f0";
            case "machine": return "#80ffff";
            case "devops": return "#cfc8ba";
            case "Cloud2Cloud": return "#C39BD3";
            default: return undefined;
        }
    }

    const styleOptionByTag = (option, tag) => {
        const color = getTagColor(tag);

        if (color !== undefined) {
            option.style.backgroundColor = color;
        }
    }

    const createOverlay = async (taskElem) => {
        const alreadySetTags = getTaskElemTags(taskElem);
        const allTags = await fetchTags();
        const selectableTags = [...new Set([...favoriteTags, ...allTags].filter(t => !alreadySetTags.includes(t)))];

        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.zIndex = "9999";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "#0009";
        overlay.style.top = "0";
        overlay.style.left = "0";

        const selectWrapper = document.createElement("div");
        selectWrapper.style.position = "relative";
        selectWrapper.style.top = "50%";
        selectWrapper.style.left = "50%";

        overlay.appendChild(selectWrapper)
        document.body.appendChild(overlay);

        const select = document.createElement("select");
        const defaultOption = document.createElement("option");
        defaultOption.innerHTML = "SELECT TAG";
        select.appendChild(defaultOption)
        selectableTags.forEach(tag => {
            const option = document.createElement("option");
            option.innerText = tag;
            option.value = tag;
            styleOptionByTag(option, tag);

            select.appendChild(option);
        });

        select.onchange = async (e) => {
            const newTag = select.value;
            const newTags = [...alreadySetTags, newTag];

            const id = getTaskElemId(taskElem);
            const item = await fetchItem(id);
            await setItemTags(item, newTags);

            document.body.removeChild(overlay);
        }

        selectWrapper.appendChild(select);

        const abortButton = document.createElement("button");
        abortButton.innerText = "Abort";
        abortButton.onclick = () => {
            document.body.removeChild(overlay);
        }

        selectWrapper.appendChild(abortButton);
    }

    const addTaskElemAdder = (taskElem) => {
        let ul = taskElem.querySelector(".tags-items-container ul")

        if (!ul) {
            const tagsFieldContainer = document.createElement("div");
            tagsFieldContainer.classList.add("tags");
            tagsFieldContainer.classList.add("field-container");

            const tfsTags = document.createElement("div");
            tfsTags.classList.add("tfs-tags");
            tagsFieldContainer.appendChild(tfsTags);

            const tagsItemsContainer = document.createElement("div");
            tagsItemsContainer.classList.add("tags-items-container");
            tfsTags.appendChild(tagsItemsContainer);

            ul = document.createElement("ul");
            tagsItemsContainer.appendChild(ul);

            taskElem.appendChild(tagsFieldContainer);
        }

        if (!ul || !!ul.querySelector(".add-tag")) return;

        const li = document.createElement("li");
        li.classList.add("tag-item");

        const span = document.createElement("span");
        span.classList.add("tag-box");
        span.classList.add("add-tag");
        span.classList.add("tag-box-selectable");
        span.setAttribute("dir", "ltr");

        const spanPlusButton = document.createElement("span");
        spanPlusButton.classList.add("bowtie-icon");
        spanPlusButton.classList.add("bowtie-math-plus-light");

        span.appendChild(spanPlusButton);

        li.appendChild(span);
        spanPlusButton.onclick = () => {
            createOverlay(taskElem);
        }
        ul.appendChild(li);
    }

    const doStyleTaskElems = () => {
        const taskElems = selectTaskElems();

        taskElems.forEach(taskElem => {
            const tags = getTaskElemTags(taskElem);

            const intersectionTags = tags.filter(tag => favoriteTags.includes(tag));
            if (intersectionTags.length > 0) {
                // first tag defined task color
                const color = getTagColor(intersectionTags[0]);
                taskElem.style.backgroundColor = color;
            }
        })
    }

    const doAddRemovers = () => {
        selectTaskElems().forEach(t => addTaskElemRemovers(t));
    }

    const doAddAdders = () => {
        selectTaskElems().forEach(t => addTaskElemAdder(t));
    }

    const update = () => {
        requestAnimationFrame(() => {
            doStyleTaskElems();
            doAddRemovers();
            doAddAdders();
            setTimeout(() => {
                update();
            }, 5000);
        });
    };

    update();
})();
