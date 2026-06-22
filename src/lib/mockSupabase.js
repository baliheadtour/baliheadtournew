class MockQueryBuilder {
  constructor(table, dbInstance) {
    this.table = table;
    this.dbInstance = dbInstance;
    this.filters = [];
    this.sort = null;
    this.isSingle = false;
    this.action = 'select';
    this.payload = null;
  }

  select() { this.action = 'select'; return this; }
  delete() { this.action = 'delete'; return this; }
  update(payload) { this.action = 'update'; this.payload = payload; return this; }
  upsert(payload) { this.action = 'upsert'; this.payload = payload; return this; }

  eq(field, value) { this.filters.push({field, value}); return this; }
  order(field, opts) { this.sort = { field, ascending: opts?.ascending ?? true }; return this; }
  single() { this.isSingle = true; return this; }

  async execute() {
    await this.dbInstance.init();
    let tableData = this.dbInstance.db[this.table] || [];

    if (this.action === 'upsert') {
       const id = this.payload.id;
       const existingIndex = tableData.findIndex(d => d.id === id);
       if (existingIndex > -1) {
          tableData[existingIndex] = { ...tableData[existingIndex], ...this.payload };
       } else {
          tableData.unshift(this.payload);
       }
       this.dbInstance.db[this.table] = tableData;
       this.dbInstance.save();
       return { error: null };
    }

    if (this.action === 'delete') {
       const f = this.filters[0];
       if (f) {
          this.dbInstance.db[this.table] = tableData.filter(d => d[f.field] !== f.value);
          this.dbInstance.save();
       }
       return { error: null };
    }

    if (this.action === 'update') {
       const f = this.filters[0];
       if (f) {
          this.dbInstance.db[this.table] = tableData.map(d => d[f.field] === f.value ? { ...d, ...this.payload } : d);
          this.dbInstance.save();
       }
       return { error: null };
    }

    // select
    let data = [...tableData];
    for (const f of this.filters) {
       data = data.filter(d => d[f.field] === f.value);
    }
    
    if (this.sort) {
       data.sort((a,b) => {
          let valA = a[this.sort.field];
          let valB = b[this.sort.field];
          if (valA < valB) return this.sort.ascending ? -1 : 1;
          if (valA > valB) return this.sort.ascending ? 1 : -1;
          return 0;
       });
    }

    if (this.isSingle) {
       return { data: data[0] || null, error: null };
    }
    return { data, error: null };
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

class MockStorage {
  from(bucket) {
    return {
      upload: async (path, file) => {
         return new Promise((resolve) => {
            if (typeof window !== 'undefined' && file instanceof Blob) {
               const reader = new FileReader();
               reader.onloadend = () => {
                  const base64 = reader.result;
                  const storedUploads = JSON.parse(localStorage.getItem('mock_uploads') || '{}');
                  storedUploads[path] = base64;
                  localStorage.setItem('mock_uploads', JSON.stringify(storedUploads));
                  resolve({ error: null });
               };
               reader.readAsDataURL(file);
            } else {
               resolve({ error: null });
            }
         });
      },
      getPublicUrl: (path) => {
         if (typeof window !== 'undefined') {
            const storedUploads = JSON.parse(localStorage.getItem('mock_uploads') || '{}');
            if (storedUploads[path]) {
               return { data: { publicUrl: storedUploads[path] } };
            }
         }
         return { data: { publicUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80" } };
      }
    };
  }
}

class MockSupabaseClient {
  constructor() {
     this.db = { listings: [], companies: [] };
     this.initialized = false;
     this.storage = new MockStorage();
     this.auth = { getSession: async () => ({ data: { session: null } }) };
  }

  async init() {
     if (this.initialized) return;
     if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mock_db');
        if (stored) {
           this.db = JSON.parse(stored);
        } else {
           try {
              const res = await fetch('/initial_db.json');
              const data = await res.json();
              this.db = data;
              this.save();
           } catch (e) {
              console.error("Error loading mock db", e);
           }
        }
     } else {
        try {
           const fs = require('fs');
           const path = require('path');
           const data = fs.readFileSync(path.join(process.cwd(), 'public', 'initial_db.json'), 'utf-8');
           this.db = JSON.parse(data);
        } catch(e) {}
     }
     this.initialized = true;
  }

  save() {
     if (typeof window !== 'undefined') {
        localStorage.setItem('mock_db', JSON.stringify(this.db));
     }
  }

  from(table) {
     return new MockQueryBuilder(table, this);
  }
}

export const supabase = new MockSupabaseClient();
