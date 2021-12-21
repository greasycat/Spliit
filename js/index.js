let isEntrySelected = false;
let currentSelectedEntry = null;
let spliter = new Spliter();
let names = []
let tooltipMap = new Map()
const localStorageName = 'splitter'

function resetNewSplitModal() {
    $("#memberNumber").val("")
    $("#memberNames").empty()
    $('#inputAlerts').empty()
}

function checkCacheSupport() {
    if (!('localStorage' in window))
        alert("local storage not supported")
}


$(document).ready(() => {
    checkCacheSupport()

    $(".edit-entry")
        .dblclick(entryDoubleClick)
        .mouseenter(entryMouseEnter)
        .mouseleave(entryMouseLeave)
    $(document).keypress(enterKeyPress);

    // New split
    $("#member-number").on("input", onMemberNumberChange)
    $("#create-new-split-button").click(newSplitButtonClick)

    // Record operations
    $("#add-record").mouseenter(entryMouseEnter).mouseleave(entryMouseLeave)
    $("#newRecordButton").click(addNewRecord)
    $("#delete-confirm-button").click(deleteConfirmButtonClick)
    $("#delete-all-confirm-button").click(deleteAllConfirmButtonClick)

    // Stats tab
    $("#stats-tab").on("click", onStatsTabClick)
    $("#stats-update-button").click(applyStats)

    //Import and Export
    $("#save-button").click(saveButtonClick)
    $("#import-button").click(importButtonClick)
    $("#file-selector").change(onFileChange)
    $("#filename-input").on("input", onFilenameChange)
    $("#save-file-confirm-button").click(saveConfirmButtonClick)
    $("body").on('dragover', fileDragover).on('drop', fileDrop)

    spliter = new Spliter()

    if (localStorage[localStorageName] !== undefined) {
        spliter.importFromJSON(localStorage[localStorageName])
        resetTable()
    } else {
        let defaultMembers = new Set(["A", "B", "C", "D"])
        spliter.newTable(defaultMembers)
        spliter.addRecord("Example: Coke", new Set(["B", "C"]), "A", 3.9, "", "")
        spliter.addRecord("Example: Banana", new Set(["C"]), "B", 4, "", "")
        resetTable()

    }
})

function saveLocalStorage() {
    localStorage[localStorageName] = spliter.exportToJSON()
}
