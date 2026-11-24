import { Pool } from 'pg';
export declare const pool: Pool;
export declare const initDatabase: () => Promise<void>;
export declare const runMigrations: (client?: any) => Promise<void>;
export default pool;
//# sourceMappingURL=database.d.ts.map