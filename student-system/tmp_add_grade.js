import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
(async ()=>{
  const db = await open({ filename: './database.sqlite', driver: sqlite3.Database });
  try{
    await db.run('ALTER TABLE videos ADD COLUMN grade TEXT');
    console.log('ALTERED: grade column added');
  }catch(e){
    console.error('ERR', e.message);
  }finally{
    await db.close();
  }
})();