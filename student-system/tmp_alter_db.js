import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
(async ()=>{
  const db = await open({ filename: './database.sqlite', driver: sqlite3.Database });
  try{
    await db.run('ALTER TABLE videos ADD COLUMN url TEXT');
    console.log('ALTERED');
    await db.run('UPDATE videos SET url = youtube_url');
    console.log('UPDATED');
  }catch(e){
    console.error('ERR', e.message);
  }finally{
    await db.close();
  }
})();