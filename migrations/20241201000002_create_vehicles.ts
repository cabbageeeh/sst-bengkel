import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('vehicles', function (table) {
        table.uuid('id').primary().notNullable();
        table.uuid('customer_id').notNullable();
        table.string('license_plate', 20).notNullable().unique();
        table.string('brand', 100).notNullable();
        table.string('model', 100).notNullable();
        table.integer('year');
        table.string('engine_type', 50);
        table.string('color', 50);
        table.text('notes');
        table.bigInteger("created_at").notNullable();
        table.bigInteger("updated_at").notNullable();
        
        // Foreign key constraint
        table.foreign('customer_id').references('id').inTable('customers').onDelete('CASCADE');
        
        // Indexes for better performance
        table.index(['license_plate']);
        table.index(['customer_id']);
        table.index(['brand']);
        table.index(['model']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('vehicles');
}
