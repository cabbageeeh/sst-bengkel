import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('spk', function (table) {
        // Menambahkan field kilometer kendaraan
        table.integer('kilometer').comment('Kilometer kendaraan saat masuk service');
        
        // Menambahkan field keluhan customer
        table.text('keluhan').comment('Keluhan atau masalah yang dilaporkan customer');
        
        // Menambahkan field jarak dalam kilometer
        table.decimal('jarak_km', 8, 2).comment('Jarak tempuh dalam kilometer');
        
        // Menambahkan index untuk field yang sering diquery
        table.index(['kilometer']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('spk', function (table) {
        // Drop index terlebih dahulu
        table.dropIndex(['kilometer']);
        
        // Drop kolom yang ditambahkan
        table.dropColumn('kilometer');
        table.dropColumn('keluhan');
        table.dropColumn('jarak_km');
    });
}