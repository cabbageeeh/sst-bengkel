import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('spk', function (table) {
        // Drop existing index on start_date
        table.dropIndex(['start_date']);
    });
    
    // Rename columns
    await knex.schema.raw('ALTER TABLE spk RENAME COLUMN start_date TO tanggal_masuk');
    await knex.schema.raw('ALTER TABLE spk RENAME COLUMN completion_date TO tanggal_keluar');
    
    await knex.schema.alterTable('spk', function (table) {
        // Create new index on tanggal_masuk
        table.index(['tanggal_masuk']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('spk', function (table) {
        // Drop index on tanggal_masuk
        table.dropIndex(['tanggal_masuk']);
    });
    
    // Rename columns back
    await knex.schema.raw('ALTER TABLE spk RENAME COLUMN tanggal_masuk TO start_date');
    await knex.schema.raw('ALTER TABLE spk RENAME COLUMN tanggal_keluar TO completion_date');
    
    await knex.schema.alterTable('spk', function (table) {
        // Recreate original index on start_date
        table.index(['start_date']);
    });
}