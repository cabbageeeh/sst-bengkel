const assert=require('node:assert/strict');
const {DatabaseSync}=require('node:sqlite');
const db=new DatabaseSync('dev.sqlite3',{readOnly:true});
const base='http://localhost:5556';
async function page(path){const response=await fetch(base+path,{headers:{'X-Inertia':'true'}});assert.equal(response.status,200,path);return (await response.json()).props;}
(async()=>{
 const report=await page('/reports?period=month&year=2026&month=11');
 const expected=db.prepare("SELECT COALESCE(SUM(total_amount),0) total FROM invoices WHERE status='paid' AND invoice_date >= ? AND invoice_date <= ?").get(Date.parse('2026-11-01T00:00:00+07:00'),Date.parse('2026-11-30T23:59:59.999+07:00'));
 assert.equal(Number(report.stats.revenue),expected.total);
 assert.equal(report.revenueData.reduce((n,row)=>n+Number(row.revenue),0),expected.total);
 const monthly=await page('/reports/revenue?group_by=month');
 const days=await page('/reports/revenue?group_by=day');
 assert.equal(monthly.revenueData.reduce((n,row)=>n+Number(row.total_amount),0),days.revenueData.reduce((n,row)=>n+Number(row.total_amount),0));
 assert.ok(monthly.revenueData.every(row=>/^\d{4}-\d{2}$/.test(row.date)));
 const endDay=await page('/reports/revenue?start_date=2026-11-26&end_date=2026-11-26');
 const dayExpected=db.prepare("SELECT COALESCE(SUM(total_amount),0) total FROM invoices WHERE status='paid' AND invoice_date BETWEEN ? AND ?").get(Date.parse('2026-11-26T00:00:00+07:00'),Date.parse('2026-11-26T23:59:59.999+07:00'));
 assert.equal(endDay.revenueData.reduce((n,row)=>n+Number(row.total_amount),0),dayExpected.total);
 const customers=await page('/reports/customers');
 assert.equal(customers.customerData.length,db.prepare('select count(*) n from customers').get().n);
 assert.equal(customers.customerData.reduce((n,row)=>n+Number(row.total_spent),0),db.prepare("select coalesce(sum(total_amount),0) n from invoices where status='paid'").get().n);
 const empty=await page('/reports?period=month&year=2000&month=1');assert.equal(Number(empty.stats.revenue),0);assert.equal(empty.revenueData.length,0);
 for(const path of ['/','/spk','/customers','/vehicles','/invoices','/reports/services','/customers/create','/vehicles/create','/spk/create','/invoices/create']) await page(path);
 console.log('Passed: report totals match database, monthly/day grouping, inclusive end date, all customers, empty period, and 10 management routes.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>db.close());
