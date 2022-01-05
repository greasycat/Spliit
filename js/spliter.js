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
        for (let i = 0; i < arr.length; ++i) {
            for (let j = i; j < arr.length; ++j) {
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

}

class Record {

    description = ""
    date = ""
    note = ""
    payers = new Set()
    payee = ""
    total = 0
    isGratuity = false

    constructor(description = "", payers = new Set(), payee = "", total = 0, date = "", note = "", isGratuity = false) {
        this.description = description
        this.payers = payers
        this.payee = payee
        this.total = total
        this.date = date
        this.note = note
        this.isGratuity = isGratuity
    }

    serialize() {
        return new Record(this.description, Array.from(this.payers), this.payee, this.total, this.date, this.note, this.isGratuity)
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

    addRecord(description, payers, payee, total, date, note, isGratuity) {
        let record = new Record(description, payers, payee, total, date, note, isGratuity)
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

    getRelation(member1, member2) {
        return this._data.relations.getRelation(member1, member2)
    }

    /*
    Relation operations
     */

    updateRelations(taxMultiplier = 1) {
            this._data.relations.remakeBalanceRelation()
            this._data.records.forEach((record) => {
                if (this._data.relations.hasMember(record.payee)) {
                    let average = (record.isGratuity ? record.total : record.total*taxMultiplier) / (record.payers.size)
                    record.payers.forEach((payer) => {
                        if (this._data.relations.hasMember(payer)) {
                            this._data.relations.addBalance(payer, record.payee, average)
                        }
                    })
                }
            })
    }

    relationsForEach(callback) {
        this._data.relations._balanceRelations.forEach(callback)
    }

    membersForEach(callback) {
        this._data.relations._members.forEach(callback)
    }

    /* Calculation */


    calculatorGroupTotal(taxMultiplier) {
        let sum = 0
        this.recordsForEach((record) => {
            if (record.isGratuity)
                sum += record.total
            else
                sum += record.total*taxMultiplier;
        })
        return sum
    }
    /*
    Save/Restore
    */

    import(members, records) {
        this.newTable(new Set(members))
        this._data.records = records.map(rawRecord => new Record(rawRecord.description, new Set(rawRecord.payers), rawRecord.payee, rawRecord.total, rawRecord.date, rawRecord.note, rawRecord.isGratuity))
    }

    export() {
        return [Array.from(this._data.relations._members),
            this._data.records.map((record) => record.serialize())]
    }
}

