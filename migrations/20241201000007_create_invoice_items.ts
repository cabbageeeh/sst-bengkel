import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('invoice_items', function (table) {
        table.uuid('id').primary().notNullable();
        table.uuid('invoice_id').notNullable();
        table.string('item_name', 255).notNullable();
        table.text('description');
        table.integer('quantity').defaultTo(1);
        table.decimal('unit_price', 12, 2).notNullable();
        table.decimal('total_price', 12, 2).notNullable();
        table.enum('type', ['service', 'part', 'other']).defaultTo('service');
        table.bigInteger("created_at").notNullable();
        table.bigInteger("updated_at").notNullable();
        
        // Foreign key constraint
        table.foreign('invoice_id').references('id').inTable('invoices').onDelete('CASCADE');
        
        // Indexes for better performance
        table.index(['invoice_id']);
        table.index(['type']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('invoice_items');
}
