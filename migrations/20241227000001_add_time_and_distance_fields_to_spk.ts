import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('spk', function (table) {
        // Menambahkan field jam masuk (timestamp)
        table.bigInteger('jam_masuk').comment('Timestamp jam masuk kendaraan');
        
        // Menambahkan field jam janji selesai (timestamp)
        table.bigInteger('jam_janji_selesai').comment('Timestamp estimasi jam selesai');
        
        // Menambahkan field jarak (tanpa _km)
        table.integer('jarak').comment('Jarak tempuh dalam kilometer - alias untuk kilometer');
        
        // Menambahkan index untuk field yang sering diquery
        table.index(['jam_masuk']);
        table.index(['jam_janji_selesai']);
        table.index(['jarak']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('spk', function (table) {
        // Drop index terlebih dahulu
        table.dropIndex(['jam_masuk']);
        table.dropIndex(['jam_janji_selesai']);
        table.dropIndex(['jarak']);
        
        // Drop kolom yang ditambahkan
        table.dropColumn('jam_masuk');
        table.dropColumn('jam_janji_selesai');
        table.dropColumn('jarak');
    });
}