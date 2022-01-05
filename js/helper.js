
function generateMemberNameHTML(i) {
    return `<div class="input-group">
                <span class="input-group-text">Member${i}</span>
                <span class="input-group-text">Name</span>
                <input type="text" aria-label="memberNumber" class="form-control" id="member-${i}"\>
            </div>`
}

function generateAlertHTML(message) {
    return `<div class="alert alert-danger alert-dismissible" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
}

function resetNewSplitModal() {
    $("#memberNumber").val("")
    $("#memberNames").empty()
    $('#inputAlerts').empty()
}

function applyTableHead(spliter, enableDate = false, enableNote = false) {

    let html = `
        <tr>
            <th scope="col">#</th>
            <th scope="col">Description</th>
            <th scope="col">Total</th>
            <th scope="col">Payee</th>
            `
    spliter.membersForEach(member => {
        html += `<th scope="col">${member}</th>`
    })

    if (enableDate)
        html += `<th scope="col">Date</th>`

    if (enableNote)
        html += `<th scope="col">Note</th>`


    html += `</tr>`

    $("#record-table-head").append(html)
}

function resetTable() {
    emptyTableHead()
    emptyTableBody()
    applyTableHead(spliter)
    applyTableBody(spliter)
    updateSetting()
}

function emptyTableHead() {
    $("#record-table-head").empty()
}

function emptyTableBody() {
    $("#record-table-body").empty()
}

function updateAllTooltip() {
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(elem => {
        tooltipMap.set(elem, new bootstrap.Tooltip(elem))
    })
}

function changeDisabledCheckbox(index, name) {
    spliter.membersForEach((member) => {
        $(`#checkbox-${index}-${member}`).prop("disabled", name === member).prop("checked", name === member)
    })
}

function applyTableBody(spliter, enableDate = false, enableNote = false) {
    spliter.recordsForEach(applyRecord)

}

function applyRecord(record, index) {
    let indexColor = record.isGratuity ?  "record-index-grey":"record-index-green"

    let tableBody = $("#record-table-body")
    tableBody.append(`<tr id="record-${index}"></tr>`)
    let recordRow = $(`#record-${index}`)

    console.log(record.isGratuity)

    //Basic info
    recordRow.append(`<th scope="row" class=" border-end ${indexColor}">${index}</th>
                        <td class="edit-entry" contenteditable="true" id="description-${index}">${record.description}</td>
                        <td class="edit-entry" contenteditable="true" id="total-${index}">${record.total}</td>`)

    //Payee Selection
    recordRow.append(`<td><select class="form-select" id="payee-selection-${index}" aria-label="Select the payee"><option>Please select a payee</option></select></td>`)
    let selection = $(`#payee-selection-${index}`)

    //Fill Payee Options and add Payer checkboxes
    spliter.membersForEach((member) => {
        selection.append(`<option value="${member}">${member}</option>`)
        if (member === record.payee) {
            recordRow.append(`<td><input class="form-check-input" type="checkbox"  aria-label="Checkbox for following text input" id="checkbox-${index}-${member}"></td>`)

        } else {
            recordRow.append(`<td><input class="form-check-input" type="checkbox" aria-label="Checkbox for following text input" id="checkbox-${index}-${member}"></td>`)
        }

        // Check for payers in the record

        $(`#checkbox-${index}-${member}`)
            .prop("checked", record.payers.has(member))
            .prop("disabled", !Setting.isPayeeCheckable&& record.payee === member)
            .change(onPayerChange)
    })

    //Add payee as the default payer
    // spliter.setRecordPayers(index, new Set([spliter.getRecordPayee(index)]))

    //Select the stored payee
    selection.val(record.payee)

    //Delete Button
    recordRow.append(`<td><button class="btn btn-outline-danger" data-bs-toggle="tooltip" data-bs-placement="top" title="Right click to quick delete" id="delete-button-${index}">Delete</button></td>`)


    //Listeners
    $(`#description-${index}`).on("input", (onDescriptionChange))
    $(`#total-${index}`).on("input", onTotalChange)
    selection.change(onPayeeChange)
    $(`#delete-button-${index}`).click(deleteButtonClick).contextmenu(deleteButtonRightClick)
    updateAllTooltip()

    // console.log(record)
}

function addNewRecord() {
    applyRecord(spliter.addRecord("", new Set(), "", 0, "", "", false), spliter.getRecordSize()-1)
    saveLocalStorage()
}

function addNewGratuity() {
    applyRecord(spliter.addRecord("", new Set(), "", 0, "", "", true), spliter.getRecordSize()-1)
    saveLocalStorage()
}

function deleteCurrentRecord(i) {
    if (i !== undefined) {
        spliter.deleteRecord(i)
        emptyTableBody()
        applyTableBody(spliter)
        saveLocalStorage()
    }
}

function deleteAllRecords() {
    spliter.deleteAllRecords()
    emptyTableBody()
    applyTableBody(spliter)
    saveLocalStorage()
}

function applyStats() {
    // console.log(spliter._data.relations)
    let taxMultiplier = 1.0
    if (Setting.isTaxEnabled) {
        taxMultiplier += Setting.taxRate*0.01
    }
    spliter.updateRelations(taxMultiplier)
    let statsTableBody = $("#stats-table-body").empty()
    statsTableBody.append(`
                        <tr>
                        <th>Total spent by group:</th>
                        <td>${spliter.calculatorGroupTotal(taxMultiplier)}</td>
                        </tr>
    `)


    spliter.relationsForEach((relation) => {
        if (relation.absolute()!==0) {
            statsTableBody.append(`
            <tr>
                <th>
                    ${relation.sender()} → ${relation.receiver()}
                </th> 
                <td>
                    ${relation.absolute()}
                </td> 
            </tr>
        `)
        }
    })
}

function updateSetting() {
    $("#enable-tax-checkbox").prop("checked", Setting.isTaxEnabled)
    $("#payee-checkable-checkbox").prop("checked", Setting.isPayeeCheckable)
    $("#tax-input").val(Setting.taxRate)
}

function importFromJSON(json) {
    let importedData = JSON.parse(json.toString())
    console.log(importedData)
    spliter.import(importedData[0], importedData[1])
    Setting = importedData[2]
}

function exportToJSON()
{
    let exportList = spliter.export()
    exportList.push(Setting)
    return JSON.stringify(exportList)
}

function importFile(file) {
    if (file.type && !file.type.endsWith('json')){
        console.log(file.type)
        console.log("not a json file")
    }

    const reader = new FileReader()
    reader.addEventListener('load', (event)=>{
        importFromJSON(event.target.result);
        resetTable()
        saveLocalStorage()
    })

    reader.readAsText(file, "utf-8")

}
