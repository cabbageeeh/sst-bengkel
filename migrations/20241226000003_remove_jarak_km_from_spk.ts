import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('spk', function (table) {
        // Menghapus field jarak_km karena duplikat dengan kilometer
        table.dropColumn('jarak_km');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('spk', function (table) {
        // Menambahkan kembali field jarak_km jika rollback
        table.decimal('jarak_km', 8, 2).comment('Jarak tempuh dalam kilometer');
    });
}