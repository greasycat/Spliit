class BalanceRelation {
    constructor(member1 = "", member2 = "", amount = 0) {
        this.balance = amount
        this.member1 = member1
        this.member2 = member2
    }

    absolute() {
        return Math.abs(this.balance)
    }

    receiver() {
        if (this.balance >= 0) {
            return this.member1
        } else {
            return this.member2
        }
    };

    sender() {
        if (this.balance < 0) {
            return this.member1
        } else {
            return this.member2
        }
    };

}

class RelationTable {
    _balanceRelations = []
    _members = new Set()

    constructor(defaultMembers = new Set()) {
        if (defaultMembers !== undefined && defaultMembers.size !== 0) {
            this.makeBalanceRelations(defaultMembers)
            this._members = defaultMembers
        }
    }

    makeBalanceRelations(members = new Set()) {
        this._balanceRelations = []
        let arr = Array.from(members)
        for (let i = 0; i < arr.length - 1; ++i) {
            for (let j = i + 1; j < arr.length; ++j) {
                this._balanceRelations.push(new BalanceRelation(arr[i], arr[j], 0))
            }
        }
    };

    remakeBalanceRelation() {
        this.makeBalanceRelations(this._members)
    }

    hasMember(member) {
        return this._members.has(member)
    }

    getRelation(member1 = "", member2 = "") {
        this._balanceRelations.forEach((relation) => {
            if ((relation.member1 === member1 && relation.member2 === member2) || (relation.member2 === member1 && relation.member1 === member2)) {
                return relation
            }
        })

    }

    addBalance(sender, receiver, amount) {
        this._balanceRelations.forEach((relation) => {
            if (relation.member1 === sender && relation.member2 === receiver) {
                relation.balance -= amount
            } else if (relation.member2 === sender && relation.member1 === receiver) {
                relation.balance += amount
            }
        })
    }

    // exportRelationToJson ()  {
    //     return JSON.stringify(this.balanceRelations)
    // }
    //
    // restoreRelationFromJson (json = "")  {
    //     this.balanceRelations = JSON.parse(json)
    // }

}

class Record {

    description = ""
    date = ""
    note = ""
    payers = new Set()
    payee = ""
    total = 0

    constructor(description = "", payers = new Set(), payee = "", total = 0, date = "", note = "") {
        this.description = description
        this.payers = payers
        this.payee = payee
        this.total = total
        this.date = date
        this.note = note
    }

    serialize() {
        return new Record(this.description, Array.from(this.payers), this.payee, this.total, this.date, this.note)
    }
}

class Spliter {

    _data = {
        records: [],
        relations: {},
    }

    constructor() {
    }

    newTable(defaultMember = new Set()) {
        this._data.relations = new RelationTable(defaultMember)
        this._data.records = []
    }


    /*
    * Get/Set/Check Operation
    * */

    setRecordDescription(i, description) {
        this._data.records[i].description = description
    }

    setRecordPayers(i, payers = new Set()) {
        this._data.records[i].payers = payers
    }

    setRecordPayee(i, payee) {
        this._data.records[i].payee = payee
    }

    setRecordTotal(i, total) {
        this._data.records[i].total = total
    }


    setRecordDate(i, date) {
        this._data.records[i].date = date
    }

    setRecordNote(i, note) {
        this._data.records[i].note = note
    }

    getRecordPayers(i) {
        return this._data.records[i].payers
    }

    getRecordPayee(i) {
        return this._data.records[i].payee;
    }

    getRecordSize() {
        return this._data.records.length
    }

    hasMember(member) {
        return this._data.relations.hasMember(member)
    }



    /*
    Record operations
     */

    addRecord(description, payers, payee, total, date, note) {
        let record = new Record(description, payers, payee, total, date, note)
        this._data.records.push(record)
        return record
    }

    deleteRecord(i) {
        if (this._data.records.length > 0 && this._data.records.length > i && i >= 0) {
            this._data.records.splice(i, 1)
        }
    }

    recordsForEach(callback) {
        this._data.records.forEach(callback)
    }

    deleteAllRecords() {
        this._data.records = []
    }


    /*
    Relation operations
     */

    updateRelations() {
        // if (this._data.records !== undefined && this._data.records.length !== 0) {
            this._data.relations.remakeBalanceRelation()
            this._data.records.forEach((record) => {
                if (this._data.relations.hasMember(record.payee)) {
                    let average = record.total / (record.payers.size + 1)
                    record.payers.forEach((payer) => {
                        if (this._data.relations.hasMember(payer)) {
                            this._data.relations.addBalance(payer, record.payee, average)
                        }
                    })
                }
            })
        // }
    }

    relationsForEach(callback) {
        this._data.relations._balanceRelations.forEach(callback)
    }

    membersForEach(callback) {
        this._data.relations._members.forEach(callback)
    }

    /* Calculation */


    calculatorGroupTotal() {
        let sum = 0
        this.recordsForEach((record) => {
            sum += record.total;
        })
        return sum
    }
    /*
    Save/Restore
    */

    importFromJSON(json) {
        let importData = JSON.parse(json)
        this.newTable(new Set(importData[0]))
        this._data.records = importData[1].map(rawRecord => new Record(rawRecord.description, new Set(rawRecord.payers), rawRecord.payee, rawRecord.total, rawRecord.date, rawRecord.note))
    }

    exportToJSON() {
        let exportData = [Array.from(this._data.relations._members),
            this._data.records.map((record) => record.serialize())]
        return JSON.stringify(exportData)
    }
}

