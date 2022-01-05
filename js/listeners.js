/*
Global variables
 */


/*
UI Effects
 */

function entryMouseEnter() {
    $(this).addClass("table-active")
}

function entryMouseLeave() {
    $(this).removeClass("table-active")
}

function enterKeyPress(event) {

}

/*
Modal Validation
 */


function onNameInput() {
    let input = $(this).val()
    let i = parseInt($(this).attr("id").split("-")[1])-1

    let format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/
    if (!input.match(format) && temporaryNames.findIndex((item) => item === input) === -1)
    {
        $(this).removeClass("bg-danger")
        temporaryNames[i] = input
    } else {
        $(this).addClass("bg-danger")
        temporaryNames[i] = ""
    }
}



function onMemberNumberChange() {
    let num = parseInt($(this).val())
    if (!isNaN(num))  {
        let memberNamesDiv = $("#member-names")
        memberNamesDiv.empty()
        temporaryNames = new Array(num).fill("")
        for (let i = 1; i <= num; ++i) {
            let inputElement = generateMemberNameHTML(i)
            memberNamesDiv.append(inputElement)
            $(`#member-${i}`).on("input", onNameInput)
        }
    }
}

function newSplitButtonClick() {
    let num = parseInt($("#member-number").val())
    if (Number.isInteger(num)) {
        console.log("" in temporaryNames)
        if (temporaryNames.includes("")) {
            console.log("Incorrect names")
            $("#input-alert").append(generateAlertHTML("Please fill all the names"))
        } else {
            $("#new-split-modal").modal('toggle')

            spliter.newTable(new Set(temporaryNames))
            resetNewSplitModal()
            resetTable()

            saveLocalStorage()

        }
    } else {
        $("#input-alert").append(generateAlertHTML("Please fill correct number"))
    }
}

/*
Table Change Listeners
 */

function getRowIndex(elem) {
    return parseInt(elem.closest("tr").attr("id").split("-")[1])
}

function onDescriptionChange() {
    spliter.setRecordDescription(getRowIndex($(this)), $(this).text())
    console.log(`Change description`)
    saveLocalStorage()
}

function onPayeeChange() {
    let name = $(this).val()
    if (spliter.hasMember(name)) {
        let index = getRowIndex($(this))
        changeDisabledCheckbox(index, name)
        spliter.setRecordPayee(index, name)
        spliter.setRecordPayers(index, new Set([name])) //Empty previous payers array
    }
    // console.log(spliter.getRecordPayee(getRowIndex($(this))))
    saveLocalStorage()
}

function onTotalChange() {
    let value = $(this).text()
    let numberRegex = /^[+-]?(\d*|\d{1,3}(,\d{3})*)(\.\d+)?\b$/
    let total = parseFloat(value)
    if (numberRegex.test(value)&&!isNaN(total)) {
        console.log(getRowIndex($(this)))
        spliter.setRecordTotal(getRowIndex($(this)), total)
        $(this).removeClass("border border-danger border-3")
    }else{
        $(this).addClass("border-danger border border-3")
    }

    saveLocalStorage()
    // console.log(value)

}

function onDateChange() {

    saveLocalStorage()
}

function onNoteChange() {

    saveLocalStorage()
}

function onPayerChange() {
    let checked = $(this).prop("checked")
    let info = $(this).prop("id").split("-")

    let previousPayer = spliter.getRecordPayers(info[1])
    if (checked) {
        previousPayer.add(info[2])
    } else {
        previousPayer.delete(info[2])
    }
    spliter.setRecordPayers(info[1], previousPayer)
    // console.log(previousPayer)
    saveLocalStorage()
}

function deleteButtonClick() {

    currentRow = getRowIndex($(this))
    $("#delete-confirm-modal").modal("toggle")
}

function deleteConfirmButtonClick() {
    deleteCurrentRecord(currentRow)
    $("#delete-confirm-modal").modal("toggle")

}

function deleteButtonRightClick() {
    currentRow = getRowIndex($(this))
    $(this).tooltip('hide')
    deleteCurrentRecord(currentRow)
    return false
}


function deleteAllConfirmButtonClick() {
    deleteAllRecords()
    $("#delete-all-confirm-modal").modal("toggle")
}

/*
Stats tab
 */

function onStatsTabClick() {
    applyStats()
}


/*
Setting tab
 */

function onTaxCheckboxClick() {
    Setting.isTaxEnabled = $(this).prop("checked")
    saveLocalStorage()
}

function onTaxInput() {
    let taxRate = parseFloat($(this).val())
    if (!isNaN(taxRate))
        Setting.taxRate = taxRate
    saveLocalStorage()
}

function onPayeeCheckableCheckboxClick()
{
    Setting.isPayeeCheckable = $(this).prop("checked")
    resetTable()
    saveLocalStorage()
}

/*
Data Import and Export
 */

function saveButtonClick() {
    $("#save-file-modal").modal("toggle")
}

function onFilenameChange() {
    let temp = $(this).val()
    console.log(temp)
    if (temp !== "" && temp !== undefined) {
        Setting.filename = temp
    }
}

function saveConfirmButtonClick()
{
    let a = document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([exportToJSON()], {type: "text/plain"}));
    a.download = Setting.filename;
    a.click();
    $("#save-file-modal").modal("toggle")
}

function importButtonClick() {
    $("#file-selector").click()
}

function onFileChange(event) {
    importFile(event.target.files[0])
    $(this).val("")
}

function fileDragover(event) {
    event.stopPropagation()
    event.preventDefault()
    event.originalEvent.dataTransfer.dropEffect = "copy"
}

function fileDrop(event) {
    event.stopPropagation()
    event.preventDefault()
    let fileList = event.originalEvent.dataTransfer.files;
    importFile(fileList[0])
}
