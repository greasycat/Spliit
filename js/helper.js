let deleteTimeoutID = 0;

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
    let tableBody = $("#record-table-body")
    tableBody.append(`<tr id="record-${index}"></tr>`)
    let recordRow = $(`#record-${index}`)

    //Basic info
    recordRow.append(`<th scope="row">${index}</th>
                        <td class="edit-entry" contenteditable="true" id="description-${index}">${record.description}</td>
                        <td class="edit-entry" contenteditable="true" id="total-${index}">${record.total}</td>`)

    //Payee Selection
    recordRow.append(`<td><select class="form-select" id="payee-selection-${index}" aria-label="Select the payee"><option>Please select a payee</option></select></td>`)
    let selection = $(`#payee-selection-${index}`)

    //Fill Payee Options and add Payer checkboxes
    spliter.membersForEach((member) => {
        selection.append(`<option value="${member}">${member}</option>`)
        if (member === record.payee) {
            recordRow.append(`<td><input class="form-check-input" type="checkbox" disabled="disabled" aria-label="Checkbox for following text input" id="checkbox-${index}-${member}"></td>`)
        } else {
            recordRow.append(`<td><input class="form-check-input" type="checkbox" aria-label="Checkbox for following text input" id="checkbox-${index}-${member}"></td>`)
        }

        // Check for payers in the record
        $(`#checkbox-${index}-${member}`).prop("checked", record.payers.has(member)||record.payee === member).change(onPayerChange);
    })

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
}

function addNewRecord() {
    applyRecord(spliter.addRecord("", new Set(), "", 0, "", ""), spliter.getRecordSize()-1)
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
    spliter.updateRelations()
    let statsTableBody = $("#stats-table-body").empty()
    statsTableBody.append(`
                        <tr>
                        <th>Total spent by group:</th>
                        <td>${spliter.calculatorGroupTotal()}</td>
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

function importFile(file) {
    if (file.type && !file.type.endsWith('json')){
        console.log(file.type)
        console.log("not a json file")
    }

    const reader = new FileReader()
    reader.addEventListener('load', (event)=>{
        const result = event.target.result;
        spliter.importFromJSON(result.toString())
        resetTable()
        saveLocalStorage()
    })

    reader.readAsText(file, "utf-8")

}
