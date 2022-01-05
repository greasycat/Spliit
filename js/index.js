let spliter = new Spliter();
let tooltipMap = new Map()
let temporaryNames = []
let currentRow

let Setting = {
    localStorageName: 'splitter',
    isPayeeCheckable: false,
    currentRow: undefined,
    filename: "data.json",
    isTaxEnabled: false,
    taxRate: 7.75,
}



function checkCacheSupport() {
    if (!('localStorage' in window))
        alert("local storage not supported")
}


$(document).ready(() => {
    checkCacheSupport()

    $(".edit-entry")
        .mouseenter(entryMouseEnter)
        .mouseleave(entryMouseLeave)
    $(document).keypress(enterKeyPress);

    // New split
    $("#member-number").on("input", onMemberNumberChange)
    $("#create-new-split-button").click(newSplitButtonClick)

    // Record operations
    $("#add-record").mouseenter(entryMouseEnter).mouseleave(entryMouseLeave)
    $("#new-record-button").click(addNewRecord)
    $("#new-gratuity").click(addNewGratuity)
    $("#delete-confirm-button").click(deleteConfirmButtonClick)
    $("#delete-all-confirm-button").click(deleteAllConfirmButtonClick)

    // Stats tab
    $("#stats-tab").on("click", onStatsTabClick)
    $("#stats-update-button").click(applyStats)

    //Setting tab
    $("#enable-tax-checkbox").click(onTaxCheckboxClick)
    $("#tax-input").on("input", onTaxInput)
    $("#payee-checkable-checkbox").click(onPayeeCheckableCheckboxClick)

    //Import and Export
    $("#save-button").click(saveButtonClick)
    $("#import-button").click(importButtonClick)
    $("#file-selector").change(onFileChange)
    $("#filename-input").on("input", onFilenameChange)
    $("#save-file-confirm-button").click(saveConfirmButtonClick)
    $("body").on('dragover', fileDragover).on('drop', fileDrop)

    spliter = new Spliter()

    if (localStorage[Setting.localStorageName] !== undefined) {
        importFromJSON(localStorage[Setting.localStorageName])
        resetTable()
    } else {
        let defaultMembers = new Set(["A", "B", "C", "D"])
        spliter.newTable(defaultMembers)
        spliter.addRecord("Example: Coke", new Set(["A","B", "C"]), "A", 3.9, "", "")
        spliter.addRecord("Example: Banana", new Set(["B","C"]), "B", 4, "", "")
        resetTable()

    }
})

function saveLocalStorage() {
    localStorage[Setting.localStorageName] = exportToJSON()
}
