const fs = require('fs');
const DB_FILE = './db.json';

// In-memory data store
let data = {
  users: [],
  appointments: [],
  medicalrecords: [],
  prescriptions: [],
  medicationlogs: [],
  messages: [],
  notifications: [],
  careplans: [],
  healthevents: [],
  videosessions: []
};

if (fs.existsSync(DB_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(DB_FILE));
    // Merge loaded data with defaults so new collections always exist
    data = { ...data, ...loaded };
  } catch (e) {
    console.error("Error parsing db.json", e);
  }
}

const saveDb = () => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

const createId = () => Math.random().toString(36).substr(2, 9);

class Query {
  constructor(results, modelName) {
    this.results = results;
    this.modelName = modelName;
  }
  select(fields) { return this; }
  populate(field, sel) {
    if (Array.isArray(this.results)) {
       this.results = this.results.map(r => {
           let refId = typeof r[field] === 'object' && r[field] !== null ? r[field]._id : r[field];
           if (['patientId', 'doctorId', 'senderId', 'userId', 'createdBy', 'assignedDoctors'].includes(field)) {
               if (field === 'assignedDoctors' && Array.isArray(r[field])) {
                   r[field] = r[field].map(docId => {
                       let id = typeof docId === 'object' && docId !== null ? docId._id : docId;
                       let u = data.users.find(u => u._id === id);
                       return u || docId;
                   });
               } else {
                   let u = data.users.find(u => u._id === refId);
                   if (u) r[field] = u;
               }
           } else if (field === 'prescriptionId') {
               let p = data.prescriptions.find(p => p._id === refId);
               if (p) r[field] = p;
           } else if (field === 'appointmentId') {
               let a = data.appointments.find(a => a._id === refId);
               if (a) r[field] = a;
           }
           return r;
       });
    } else if (this.results) {
        let fieldRef = this.results[field];
        if (fieldRef !== undefined) {
             let refId = typeof fieldRef === 'object' && fieldRef !== null ? fieldRef._id : fieldRef;
             if (['patientId', 'doctorId', 'senderId', 'userId', 'createdBy'].includes(field)) {
                 let u = data.users.find(u => u._id === refId);
                 if (u) this.results[field] = u;
             } else if (field === 'prescriptionId') {
                 let p = data.prescriptions.find(p => p._id === refId);
                 if (p) this.results[field] = p;
             } else if (field === 'appointmentId') {
                 let a = data.appointments.find(a => a._id === refId);
                 if (a) this.results[field] = a;
             }
        }
    }
    return this;
  }
  sort(obj) { 
      if (Array.isArray(this.results)) {
         this.results.sort((a,b) => {
             let key = Object.keys(obj)[0];
             let dir = obj[key] === 1 ? 1 : -1;
             let valA = a[key] ? new Date(a[key]).getTime() : 0;
             let valB = b[key] ? new Date(b[key]).getTime() : 0;
             if (isNaN(valA)) valA = a[key];
             if (isNaN(valB)) valB = b[key];

             if (valA < valB) return -1 * dir;
             if (valA > valB) return 1 * dir;
             return 0;
         });
      }
      return this; 
  }
  limit(n) { 
      if (Array.isArray(this.results)) {
          this.results = this.results.slice(0, n); 
      }
      return this; 
  }
  async then(resolve, reject) { 
      try {
          resolve(this.results);
      } catch (e) {
          if (reject) reject(e);
      }
  }
  async catch(reject) {}
  exec() { return Promise.resolve(this.results); }
}

const createModel = (collectionName) => {
  return class Model {
    constructor(doc) {
      Object.assign(this, doc);
      this._id = this._id || createId();
      if (!this.createdAt) this.createdAt = new Date().toISOString();
      if (!this.updatedAt) this.updatedAt = new Date().toISOString();
    }
    async save() {
      if (!data[collectionName]) data[collectionName] = [];
      this.updatedAt = new Date().toISOString();
      const idx = data[collectionName].findIndex(x => x._id === this._id);
      if (idx > -1) {
        data[collectionName][idx] = { ...this };
      } else {
        data[collectionName].push({ ...this });
      }
      saveDb();
      return this;
    }
    static find(query = {}) {
      if (!data[collectionName]) data[collectionName] = [];
      let results = data[collectionName].filter(item => {
        let match = true;
        for (let k in query) {
            if (query[k] && query[k].$in) {
                 if (!query[k].$in.includes(item[k])) match = false;
            } else if (query[k] && query[k].$or) {
                // simplified $or on a field
                match = query[k].$or.some(v => item[k] === v || item[k]?.toString() === v?.toString());
            } else if (typeof query[k] === 'object' && query[k] !== null && typeof item[k] === 'object' && item[k] !== null) {
                // Ignore complex matches for mock
            } else if (item[k] !== query[k] && item[k]?.toString() !== query[k]?.toString()) {
                match = false;
            }
        }
        return match;
      });
      // deep copy so populate doesn't mutate db
      results = JSON.parse(JSON.stringify(results));
      return new Query(results, collectionName);
    }
    static findOne(query) {
      if (!data[collectionName]) data[collectionName] = [];
      let result = data[collectionName].find(item => {
        let match = true;
        for (let k in query) {
            if (item[k] !== query[k] && item[k]?.toString() !== query[k]?.toString()) match = false;
        }
        return match;
      });
      return new Query(result ? JSON.parse(JSON.stringify(result)) : null, collectionName);
    }
    static findById(id) {
      return this.findOne({ _id: id });
    }
    static async findByIdAndUpdate(id, update) {
      if (!data[collectionName]) data[collectionName] = [];
      const idx = data[collectionName].findIndex(x => x._id === id || x._id?.toString() === id?.toString());
      if (idx > -1) {
        const updateData = update.$set || update;
        Object.assign(data[collectionName][idx], updateData, { updatedAt: new Date().toISOString() });
        saveDb();
        return JSON.parse(JSON.stringify(data[collectionName][idx]));
      }
      return null;
    }
    static async insertMany(docs) {
      if (!data[collectionName]) data[collectionName] = [];
      let docsWithIds = docs.map(d => ({ ...d, _id: d._id || createId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
      data[collectionName].push(...docsWithIds);
      saveDb();
      return docsWithIds;
    }
    static async deleteMany(query) {
      if (!data[collectionName]) data[collectionName] = [];
      data[collectionName] = data[collectionName].filter(item => {
        let match = true;
        for (let k in query) {
            if (query[k] && query[k].$in) {
                 if (!query[k].$in.includes(item[k])) match = false;
            } else if (item[k] !== query[k] && item[k]?.toString() !== query[k]?.toString()) match = false;
        }
        return !match; // filter keeps those that DON'T match
      });
      saveDb();
    }
    static async countDocuments(query = {}) {
      if (!data[collectionName]) data[collectionName] = [];
      return data[collectionName].filter(item => {
        let match = true;
        for (let k in query) {
          if (item[k] !== query[k] && item[k]?.toString() !== query[k]?.toString()) match = false;
        }
        return match;
      }).length;
    }
  }
}

class Schema {
  constructor(definition) {
    this.definition = definition;
  }
  index() {}
}
Schema.Types = { ObjectId: String };

module.exports = {
  User: createModel('users'),
  Appointment: createModel('appointments'),
  MedicalRecord: createModel('medicalrecords'),
  Prescription: createModel('prescriptions'),
  MedicationLog: createModel('medicationlogs'),
  Message: createModel('messages'),
  Notification: createModel('notifications'),
  CarePlan: createModel('careplans'),
  HealthEvent: createModel('healthevents'),
  VideoSession: createModel('videosessions'),
  Schema: Schema,
  model: (name, schema) => createModel(name.toLowerCase() + 's')
};
